import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Outlet, useSubmit } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Response("User non-existent found", { status: 500 });
  }

  const tasks = await prisma.task.findMany({ where: { userId } });
  return json({ user: { email: user.email }, tasks });
}

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("request.method", request.method);
  const userId = await requireUserId(request);
  switch (request.method) {
    case "PATCH": {
      const data = new URLSearchParams(await request.text());
      const taskId = data.get("taskId");
      if (!taskId) {
        throw new Response("Missing taskId", { status: 400 });
      }
      const task = await prisma.task.findUnique({
        where: { userId, id: parseInt(taskId) },
      });
      if (!task) {
        throw new Response("Task not found", { status: 404 });
      }
      const completed = data.get("completed");
      console.log("completed", completed);
      if (completed) {
        await prisma.task.update({
          where: { id: task.id },
          data: { completed: completed === "true" },
        });
      }
      return json({ message: "Task updated" }, 200);
    }
    case "DELETE": {
      const data = new URLSearchParams(await request.text());
      const taskId = data.get("delete");
      if (!taskId) {
        throw new Response("Missing taskId", { status: 400 });
      }
      const task = await prisma.task.findUnique({
        where: { userId, id: parseInt(taskId) },
      });
      if (!task) {
        throw new Response("Task not found", { status: 404 });
      }
      await prisma.task.delete({ where: { id: task.id } });
      return json({ message: "Task deleted" }, 200);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleCheck =
    (taskId: number, currentlyCompleted: boolean) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("got a check", taskId);

      submit({ taskId, completed: !currentlyCompleted }, { method: "patch" });
    };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      {data.user.email} <a href="/logout">Logout</a>
      <h1>Tasks</h1>
      <ul>
        {data.tasks.map((task) => (
          <li key={task.id} style={{ display: "flex", gap: 10 }}>
            <Form method="patch">
              <input hidden name="completed" defaultValue={task.id} />
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleCheck(task.id, task.completed)}
              />
            </Form>

            <a href={`/tasks/${task.id}`}>{task.title}</a>

            <Form method="delete">
              <input hidden name="delete" defaultValue={task.id} />
              <button type="submit">X</button>
            </Form>
          </li>
        ))}
      </ul>
      <a href="/tasks/new">New Task</a>
      <Outlet />
    </div>
  );
}
