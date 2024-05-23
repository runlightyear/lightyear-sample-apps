import { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node"; // or cloudflare/deno

export async function loader({ request }: LoaderFunctionArgs) {
  return redirect("/messages");
}
