import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createUserSession, getUserId } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const users = await prisma.user.findMany();
  return json({ users });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  if (!userId) return redirect("/login");
  if (typeof userId !== "string") return redirect("/login");

  return createUserSession({
    request,
    userId: userId,
    remember: true,
  });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Login</h1>
      <Form action="/login" method="post">
        <div>
          <label htmlFor="email">Email</label>
          <select id="email" name="userId">
            {data.users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
