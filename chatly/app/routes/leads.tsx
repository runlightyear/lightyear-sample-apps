import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Outlet, useSubmit } from "@remix-run/react";
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
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Response("User non-existent found", { status: 500 });
  }

  const leads = await prisma.lead.findMany({ where: { ownerId: userId } });
  return json({ user: { email: user.email }, leads });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("request.method", request.method);
  const userId = await requireUserId(request);
  switch (request.method) {
    case "DELETE": {
      const data = new URLSearchParams(await request.text());
      const leadId = data.get("delete");
      if (!leadId) {
        throw new Response("Missing leadId", { status: 400 });
      }
      const lead = await prisma.lead.findUnique({
        where: { ownerId: userId, id: parseInt(leadId) },
      });
      if (!lead) {
        throw new Response("Lead not found", { status: 404 });
      }
      await prisma.lead.delete({ where: { id: lead.id } });
      return json({ message: "Lead deleted" }, 200);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleCheck =
    (leadId: number, currentlyCompleted: boolean) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("got a check", leadId);

      submit({ leadId, completed: !currentlyCompleted }, { method: "patch" });
    };

  return (
    <>
      <TopNav selected="leads" user={{ initials: "AB" }} />
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        {data.user.email} <a href="/logout">Logout</a>
        <h1>Leads</h1>
        <ul>
          {data.leads.map((lead) => (
            <li key={lead.id} style={{ display: "flex", gap: 10 }}>
              <a href={`/leads/${lead.id}`}>{lead.name}</a>
              <span>{lead.email}</span>
              <span>{lead.phone}</span>

              <Form method="delete">
                <input hidden name="delete" defaultValue={lead.id} />
                <button type="submit">X</button>
              </Form>
            </li>
          ))}
        </ul>
        <a href="/leads/new">New Lead</a>
        <Outlet />
      </div>
    </>
  );
}
