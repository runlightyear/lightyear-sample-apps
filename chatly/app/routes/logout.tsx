import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { logout } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  return await logout(request);
}

export async function loader() {
  return redirect("/login");
}
