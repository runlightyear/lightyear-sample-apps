import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

export interface ChatlyLogoProps {
  className?: string;
}

export function ChatlyLogo(props: ChatlyLogoProps) {
  const { className } = props;

  return (
    <div className={cn("flex items-center gap-2 text-xl")}>
      <MessageCircle />
      Chatly
    </div>
  );
}
