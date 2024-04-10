import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  return json({});
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      Testing
    </div>
  );
}
