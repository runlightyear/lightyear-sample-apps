import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { TopNav } from "~/components/TopNav";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const threads = await prisma.thread.findMany({
    where: { ownerId: userId },
    include: {
      messages: true,
      person: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return json({ threads });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col h-screen">
      <TopNav selected="messages" user={{ initials: "AB" }} />
      <div className="grow flex items-stretch">
        <Outlet />
      </div>
    </div>
  );
}
