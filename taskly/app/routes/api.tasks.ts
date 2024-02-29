import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireAuth } from "~/apiauth.server";
import { prisma } from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  console.log("searchParams", searchParams);
  const orderBy = searchParams.get("orderBy") ?? "createdAt";
  if (!(orderBy === "createdAt" || orderBy === "updatedAt")) {
    return json({ message: "Invalid orderBy" }, { status: 400 });
  }
  const direction = searchParams.get("direction") ?? "asc";
  if (!(direction === "asc" || direction === "desc")) {
    return json({ message: "Invalid direction" }, { status: 400 });
  }
  const since = searchParams.get("since") ?? undefined;
  if (since) {
    if (!Date.parse(since)) {
      return json({ message: "Invalid since" }, { status: 400 });
    }
  }

  const userId = await requireAuth(request);

  const tasks = await prisma.task.findMany({
    where: { userId, ...(since ? { [orderBy]: { gt: since } } : {}) },
    orderBy: { [orderBy]: direction },
  });

  return json(tasks, 200);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireAuth(request);
  let data;
  try {
    data = await request.json();
  } catch (error) {
    console.log(error);
    return json({ message: "Invalid JSON" }, 400);
  }

  switch (request.method) {
    case "POST": {
      /* Create */
      if (!data.title) {
        return json({ message: "Missing title" }, 400);
      }

      const task = await prisma.task.create({
        data: { userId, title: data.title, completed: Boolean(data.completed) },
      });

      return json(task, 201);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
};
