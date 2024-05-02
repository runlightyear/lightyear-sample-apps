import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const { companyId } = params;
  if (!companyId) {
    throw new Error("No company ID provided");
  }

  switch (request.method) {
    case "PATCH": {
      const data = new URLSearchParams(await request.text());
      const name = data.get("name");
      const domain = data.get("domain");

      if (!name) {
        return json({ message: "Name is required" }, 400);
      }

      await prisma.company.update({
        where: {
          id: parseInt(companyId),
        },
        data: {
          name,
          domain,
        },
      });

      return json({ message: "Updated" });
    }
    case "DELETE": {
      await prisma.company.update({
        where: {
          ownerId: userId,
          id: parseInt(companyId),
        },
        data: {
          isDeleted: true,
        },
      });

      return json({ message: "Deleted" }, 200);
    }
    default: {
      return json({ message: "Method not allowed" }, 405);
    }
  }
}
