import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { sync } from "~/operations/sync.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const { personId } = params;
  if (!personId) {
    throw new Error("No person ID provided");
  }

  switch (request.method) {
    case "PATCH": {
      const data = new URLSearchParams(await request.text());
      const name = data.get("name");
      const email = data.get("email");
      const phone = data.get("phone");
      const companyId = data.get("companyId");

      await prisma.person.update({
        where: {
          id: parseInt(personId),
        },
        data: {
          name: name || null,
          email: email || null,
          phone: phone || null,
          companyId: companyId ? parseInt(companyId) : null,
        },
      });

      await sync();

      return json({ message: "Updated" });
    }
    case "DELETE": {
      await prisma.person.update({
        where: {
          ownerId: userId,
          id: parseInt(personId),
        },
        data: {
          isDeleted: true,
        },
      });

      await sync();

      return json({ message: "Deleted" }, 200);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
}
