import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { createUserSession, getUserId } from "~/session.server";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="lg:p-8">
      <div
        className={
          "mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
        }
      >
        <div className="flex flex-col space-y-2 text-center">
          <div className="text-2xl font-semibold tracking-tight">
            Log in as user
          </div>
          <Form className="w-84" action="/login" method="post">
            <div className="flex flex-col gap-2 my-4">
              <label
                className="text-muted-foreground text-left"
                htmlFor="email"
              >
                Email
              </label>
              <Select name="userId">
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {data.users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Login</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
