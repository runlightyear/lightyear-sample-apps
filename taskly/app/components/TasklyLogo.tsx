import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

export interface TasklyLogoProps {
  className?: string;
}

export function TasklyLogo(props: TasklyLogoProps) {
  const { className } = props;

  return (
    <div className={cn("flex items-center gap-2 text-xl")}>
      <CheckCircle />
      Taskly
    </div>
  );
}
