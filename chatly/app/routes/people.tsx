import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TopNav } from "~/components/TopNav";
import { requireUser } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return json({ user });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const { user } = data;

  return (
    <>
      <TopNav selected="people" user={user} />
    </>
  );
}
