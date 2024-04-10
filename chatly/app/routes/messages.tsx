import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Outlet, useSubmit } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUser, requireUserId } from "~/session.server";
import { TopNav } from "~/components/TopNav";
import { sync } from "~/operations/sync.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const threads = await prisma.thread.findMany({
    where: { ownerId: user.id },
    include: {
      messages: true,
      person: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return json({ user, threads });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  await sync(userId);
  return null;
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const { user } = data;

  const handleSync = () => {
    submit(null, { method: "POST", navigate: false });
  };

  return (
    <div className="flex flex-col h-screen">
      <TopNav selected="messages" user={user} onSync={handleSync} />
      <div className="grow flex items-stretch">
        <Outlet />
      </div>
    </div>
  );
}
