import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ChatProps {
  messages: Array<{
    id: string;
    from: string;
    position: "left" | "right";
    when: string;
    text: string;
  }>;
}

export function Chat(props: ChatProps) {
  const { messages } = props;

  return (
    <div className="grow flex flex-col h-full">
      <div className="grow flex flex-col h-full p-4 gap-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-top gap-4",
              message.position === "left" ? "flex-row" : "flex-row-reverse"
            )}
          >
            <Avatar>
              <AvatarFallback className="text-muted-foreground text-sm">
                EB
              </AvatarFallback>
            </Avatar>
            <div>
              <div className={"bg-gray-100 p-4 rounded-md"}>{message.text}</div>
              <div
                className={cn(
                  "text-xs text-muted-foreground mt-1",
                  message.position === "left" ? "text-left" : "text-right"
                )}
              >
                {message.when}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex px-4 py-6 gap-2">
        <Input placeholder="Your reply" />
        <Button className="">Send</Button>
      </div>
    </div>
  );
}
