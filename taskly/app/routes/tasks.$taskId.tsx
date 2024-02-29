import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.taskId) {
    throw new Response("Not found", { status: 404 });
  }

  if (params.taskId === "new") {
    return json({ new: true, task: null });
  }

  const taskId = parseInt(params.taskId);
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new Response("Not found", { status: 404 });
  }
  return json({ new: false, task });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  if (typeof title !== "string") {
    throw new Response("Bad request", { status: 400 });
  }

  if (!params.taskId) {
    throw new Response("Not found", { status: 404 });
  }

  if (params.taskId === "new") {
    const task = await prisma.task.create({
      data: { title, userId },
    });

    return redirect(`/tasks`);
  }

  const taskId = parseInt(params.taskId);
  const task = await prisma.task.findUnique({
    where: { userId, id: taskId },
  });
  if (!task) {
    throw new Response("Not found", { status: 404 });
  }

  await prisma.task.update({ where: { id: taskId }, data: { title } });

  return redirect("/tasks");
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>{data.new ? "Create" : "Edit"} Task</h1>
      <Form method="post">
        <div>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            defaultValue={data.task?.title ?? ""}
          />
        </div>
        <div>
          <button>Save</button>
          <a href="/tasks">Cancel</a>
        </div>
      </Form>
    </div>
  );
}
