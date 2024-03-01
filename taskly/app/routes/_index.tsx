import { Button } from "@/components/ui/button";
import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
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
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Welcome to Taskly
      </h1>
      <ul>
        <li>
          <Button asChild>
            <a href="/tasks">Tasks</a>
          </Button>
        </li>
      </ul>
    </div>
  );
}
