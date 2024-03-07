import { Link } from "@remix-run/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChatlyLogo } from "./ChatlyLogo";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export interface TopNavProps {
  selected: "messages" | "leads" | "integrations";
  user: {
    initials: string;
  };
}

interface MenuItemProps {
  to: string;
  selected: boolean;
  children: ReactNode;
}

function MenuItem(props: MenuItemProps) {
  const { to, selected, children } = props;

  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium, transition-colors",
        selected ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function TopNav(props: TopNavProps) {
  const { user, selected } = props;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <ChatlyLogo />
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <MenuItem to="/messages" selected={selected === "messages"}>
            Messages
          </MenuItem>
          <MenuItem to="/leads" selected={selected === "leads"}>
            Leads
          </MenuItem>
          <MenuItem to="/integrations" selected={selected === "integrations"}>
            Integrations
          </MenuItem>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Input className="w-[350px]" placeholder="Search..." />
          <Avatar className="size-9">
            <AvatarFallback className="text-muted-foreground">
              AB
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
