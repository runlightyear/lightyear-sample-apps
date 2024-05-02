import {
  json,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { TopNav } from "~/components/TopNav";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  switch (request.method) {
    case "POST":
      const data = new URLSearchParams(await request.text());
      const name = data.get("name");
      const domain = data.get("domain");

      if (!name) {
        return json({ message: "Name is required" }, 400);
      }

      const company = await prisma.company.create({
        data: {
          ownerId: user.id,
          name,
          domain,
        },
      });
      return json(company, { status: 201 });
    default:
      return json({ message: "Method not allowed" }, 405);
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const { user } = data;

  return (
    <>
      <TopNav selected="companies" user={user} />
      <Outlet />
    </>
  );
}
