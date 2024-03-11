import type { MetaFunction } from "@remix-run/node";
import { LeftNav } from "~/components/LeftNav";
import { Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
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
      <Outlet />
    </>
  );
}
