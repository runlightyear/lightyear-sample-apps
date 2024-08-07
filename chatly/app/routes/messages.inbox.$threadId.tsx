import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { prisma } from "~/db.server";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { ThreadList } from "~/components/ThreadList";
import { Chat } from "~/components/Chat";
import { ChatSidebar } from "~/components/ChatSidebar";
import { useToast } from "@/components/ui/use-toast";
import { sync } from "~/operations/sync.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Chatly | Messages" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const threads = await prisma.thread.findMany({
    where: { ownerId: userId },
    include: {
      messages: { include: { person: true, user: true } },
      person: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const companies = await prisma.company.findMany({
    where: { ownerId: userId },
    orderBy: {
      name: "asc",
    },
  });

  const { threadId } = params;

  if (threadId === undefined) {
    throw new Error("No thread id");
  }

  const thread = threads.find((thread) => thread.id === parseInt(threadId));

  if (!thread) {
    throw new Error("Unknown thread id");
  }

  return json({ threads, threadId, thread, companies });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  switch (request.method) {
    case "PUT": {
      // const data = await request.formData();
      const data = new URLSearchParams(await request.text());
      const personId = data.get("id");
      const name = data.get("name");
      const email = data.get("email");
      const phone = data.get("phone");
      const companyId = data.get("companyId");

      if (!personId) {
        throw new Response("Missing person id", { status: 400 });
      }

      const person = await prisma.person.findUnique({
        where: { id: parseInt(personId) },
      });
      if (!person) {
        throw new Response("Person not found", { status: 404 });
      }

      await prisma.person.update({
        where: { id: parseInt(personId) },
        data: {
          name,
          email,
          phone,
          companyId: companyId ? parseInt(companyId) : null,
        },
      });

      await sync();

      return json({ message: "Updated" }, 200);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
}

export default function Index() {
  const { toast } = useToast();
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const { threads, threadId, thread } = data;

  const { person } = thread;

  const handlePersonSave = async (person: {
    id: string | number;
    name: string;
    email: string;
    phone: string;
    companyId: string | null;
  }) => {
    submit(person, { method: "put" });
    toast({ description: "Person updated", duration: 2000 });
  };

  return (
    <>
      <ThreadList
        threads={threads.map((thread) => ({
          id: thread.id,
          from: thread.person.email ?? "unknown",
          summary:
            thread.messages[0].text.slice(0, 30) +
            (thread.messages[0].text.length > 30 ? "..." : ""),
        }))}
        selectedId={parseInt(threadId)}
      />
      <Chat
        messages={thread.messages.map((message) => {
          const position = message.user?.id ? "right" : "left";
          const from =
            (message.person?.email || message.user?.email) ?? "Unknown";
          const when = message.createdAt;

          return { id: message.id, from, position, when, text: message.text };
        })}
      />
      <ChatSidebar
        key={person.id}
        lead={{
          id: person.id.toString(),
          name: person.name,
          email: person.email,
          phone: person.phone,
          companyId: person.companyId?.toString() ?? null,
        }}
        companies={data.companies}
        onSave={handlePersonSave}
      />
    </>
  );
}
