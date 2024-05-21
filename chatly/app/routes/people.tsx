import {
  json,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { TopNav } from "~/components/TopNav";
import { prisma } from "~/db.server";
import { sync } from "~/operations/sync.server";
import { requireUser } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return json({ user });
};

export const action: ActionFunction = async ({ request }) => {
  console.log("running here");
  const user = await requireUser(request);

  switch (request.method) {
    case "POST":
      const data = new URLSearchParams(await request.text());
      const name = data.get("name");
      const email = data.get("email");
      const phone = data.get("phone");
      const companyId = data.get("companyId");

      const person = await prisma.person.create({
        data: {
          ownerId: user.id,
          name,
          email,
          phone,
          companyId: companyId ? parseInt(companyId) : null,
        },
      });

      await sync();

      return json(person, { status: 201 });
    default:
      return json({ message: "Method not allowed" }, 405);
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  const { user } = data;

  return (
    <>
      <TopNav selected="people" user={user} />
      <Outlet />
    </>
  );
}
