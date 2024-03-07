import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.leadId) {
    throw new Response("Not found", { status: 404 });
  }

  if (params.leadId === "new") {
    return json({ new: true, lead: null });
  }

  const leadId = parseInt(params.leadId);
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw new Response("Not found", { status: 404 });
  }
  return json({ new: false, lead });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  if (typeof name !== "string") {
    throw new Response("Bad request", { status: 400 });
  }
  if (typeof email !== "string") {
    throw new Response("Bad request", { status: 400 });
  }
  if (typeof phone !== "string") {
    throw new Response("Bad request", { status: 400 });
  }

  if (!params.leadId) {
    throw new Response("Not found", { status: 404 });
  }

  if (params.leadId === "new") {
    const lead = await prisma.lead.create({
      data: { ownerId: userId, name, email, phone },
    });

    return redirect(`/leads`);
  }

  const leadId = parseInt(params.leadId);
  const lead = await prisma.lead.findUnique({
    where: { ownerId: userId, id: leadId },
  });
  if (!lead) {
    throw new Response("Not found", { status: 404 });
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { name, email, phone },
  });

  return redirect("/leads");
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>{data.new ? "Create" : "Edit"} Lead</h1>
      <Form method="post">
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={data.lead?.name ?? ""} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            defaultValue={data.lead?.email ?? ""}
          />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            defaultValue={data.lead?.phone ?? ""}
          />
        </div>
        <div>
          <button>Save</button>
          <a href="/leads">Cancel</a>
        </div>
      </Form>
    </div>
  );
}
