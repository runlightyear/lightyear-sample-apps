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
import { LeftNav } from "~/components/LeftNav";
import { MessageList } from "~/components/MessageList";
import { Chat } from "~/components/Chat";
import { ChatSidebar } from "~/components/ChatSidebar";

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
    <div className="flex flex-col h-screen">
      <TopNav selected="messages" user={{ initials: "AB" }} />
      <div className="grow flex items-stretch">
        <LeftNav
          items={[
            { label: "Your Inbox" },
            { label: "Mentions" },
            { label: "Drafts" },
            { label: "Unassigned" },
            { label: "Display" },
          ]}
          selected="Your Inbox"
        />
        <MessageList
          messages={[
            { id: "1", from: "eric@prisma.io", summary: "Here is your answer" },
            { id: "2", from: "eric@prisma.io", summary: "Here is your answer" },
            { id: "3", from: "eric@prisma.io", summary: "Here is your answer" },
            { id: "4", from: "eric@prisma.io", summary: "Here is your answer" },
            { id: "5", from: "eric@prisma.io", summary: "Here is your answer" },
            { id: "6", from: "eric@prisma.io", summary: "Here is your answer" },
          ]}
        />
        <Chat
          messages={[
            {
              id: "1",
              from: "EB",
              position: "left",
              when: "2 days ago",
              text: "My message to you",
            },
            {
              id: "2",
              from: "ME",
              position: "right",
              when: "2 days ago",
              text: "My message back to you",
            },
          ]}
        />
        <ChatSidebar
          lead={{
            name: "Eric Bouck",
            email: "eric@prisma.io",
            phone: "415-555-1212",
          }}
        />
      </div>
    </div>
  );
}
