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
      <h1>Welcome to Remix</h1>

      <ul>
        <li>
          <a href="/leads">Leads</a>
        </li>
      </ul>
    </div>
  );
}
