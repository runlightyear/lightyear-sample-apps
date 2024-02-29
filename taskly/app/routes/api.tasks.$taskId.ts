import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/apiauth.server";
import { prisma } from "~/db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireAuth(request);

  if (!params.taskId) {
    throw new Response("Not found", { status: 400 });
  }
  const taskId = parseInt(params.taskId);

  const task = await prisma.task.findUnique({
    where: { userId, id: taskId },
  });

  if (!task) {
    return json({ message: "Task not found" }, { status: 404 });
  }

  return json(task, 200);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireAuth(request);

  if (!params.taskId) {
    throw new Response("Not found", { status: 400 });
  }
  const taskId = parseInt(params.taskId);

  const existingTask = await prisma.task.findUnique({
    where: { userId, id: taskId },
  });

  if (!existingTask) {
    return json({ message: "Task not found" }, { status: 404 });
  }

  switch (request.method) {
    case "PATCH": {
      /* Update */
      let data;
      try {
        data = await request.json();
      } catch (error) {
        console.log(error);
        return json({ message: "Invalid JSON" }, 400);
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: "title" in data ? data.title : undefined,
          completed: "completed" in data ? Boolean(data.completed) : undefined,
        },
      });

      return json(task, 200);
    }
    case "DELETE": {
      /* Delete */

      await prisma.task.delete({ where: { id: taskId } });

      return json(null, 204);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
};
