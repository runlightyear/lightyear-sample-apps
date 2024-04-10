import { Link, useFetcher } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { ChatlyLogo } from "./ChatlyLogo";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TopNavProps {
  selected: "messages" | "people" | "integrations";
  user: {
    email: string;
    initials: string;
  };
  onSync: () => void;
  onLogout: () => Promise<void>;
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
  const fetcher = useFetcher();
  const { user, selected, onSync, onLogout } = props;

  const [showMenu, setShowMenu] = useState(true);

  const handleLogout = () => {
    console.log("ready to logout");
    fetcher.submit(null, { method: "POST", action: "/logout" });
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <ChatlyLogo />
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <MenuItem to="/messages" selected={selected === "messages"}>
            Messages
          </MenuItem>
          <MenuItem to="/people" selected={selected === "people"}>
            People
          </MenuItem>
          <MenuItem to="/integrations" selected={selected === "integrations"}>
            Integrations
          </MenuItem>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Button onClick={onSync}>Sync</Button>
          <Input className="w-[350px]" placeholder="Search..." />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-9 cursor-pointer">
                <AvatarFallback className="text-muted-foreground uppercase">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>
                <span className="text-muted-foreground">Logged in as</span>{" "}
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
