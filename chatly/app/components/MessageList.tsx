export interface MessageListProps {
  messages: Array<{
    id: string;
    from: string;
    summary: string;
  }>;
}

export function MessageList(props: MessageListProps) {
  const { messages } = props;

  return (
    <div className="flex flex-col h-full border-r w-72">
      {messages.map((message) => (
        <div key={message.id} className="p-4 border-b">
          <div className="font-semibold">{message.from}</div>
          <div className="text-foreground">{message.summary}</div>
        </div>
      ))}
    </div>
  );
}
