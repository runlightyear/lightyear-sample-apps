import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import { ThreadList } from "~/components/ThreadList";
import { Chat } from "~/components/Chat";
import { ChatSidebar } from "~/components/ChatSidebar";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
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

  const { threadId } = params;

  if (threadId === undefined) {
    throw new Error("No thread id");
  }

  const thread = threads.find((thread) => thread.id === parseInt(threadId));

  if (!thread) {
    throw new Error("Unknown thread id");
  }

  return json({ threads, threadId, thread });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const { threads, threadId, thread } = data;

  const { person } = thread;

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
        lead={{
          name: person.name,
          email: person.email,
          phone: person.phone,
        }}
      />
    </>
  );
}
