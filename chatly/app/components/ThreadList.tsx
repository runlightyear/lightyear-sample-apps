import { cn } from "@/lib/utils";
import { Link } from "@remix-run/react";

export interface ThreadListProps {
  threads: Array<{
    id: number;
    from: string;
    summary: string;
  }>;
  selectedId: number;
}

export function ThreadList(props: ThreadListProps) {
  const { threads, selectedId } = props;

  return (
    <div className="flex flex-col h-full border-r w-72">
      {threads.map((thread) => (
        <Link to={`/messages/inbox/${thread.id}`} key={thread.id}>
          <div
            className={cn(
              "p-4 border-b",
              selectedId === thread.id ? "bg-gray-100" : ""
            )}
          >
            <div className="font-semibold">{thread.from}</div>
            <div className="text-foreground">{thread.summary}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
