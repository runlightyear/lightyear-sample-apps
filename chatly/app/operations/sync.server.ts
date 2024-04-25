import { prisma } from "~/db.server";

export async function sync() {
  console.log("Ready to sync...");

  const people = await prisma.person.findMany({
    orderBy: {
      updatedAt: "asc",
    },
  });

  for (const person of people) {
    if (!person.isDeleted) {
      await upsertObject({
        collection: "crm",
        model: "contact",
        userId: person.ownerId.toString(),
        objectId: person.id.toString(),
        updatedAt: person.updatedAt.toISOString(),
        data: {
          firstName: person.name?.split(" ")[0],
          lastName: person.name?.split(" ")[1] || "",
          primaryEmail: person.email,
          primaryPhone: person.phone,
        },
      });
    } else {
      await deleteObject({
        collection: "crm",
        model: "contact",
        userId: person.ownerId.toString(),
        objectId: person.id.toString(),
      });
    }
  }

  const response = await fetch(
    `http://localhost:3000/api/v1/envs/dev/collections/crm/models/contact/objects/product/delta`,
    {
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const responseData = await response.json();

  console.log("responseData", JSON.stringify(responseData, null, 2));

  for (const change of responseData.changes) {
    if (change.operation === "CREATE") {
      const newPerson = await prisma.person.create({
        data: {
          ownerId: parseInt(change.userId),
          name: change.data.firstName + " " + change.data.lastName,
          email: change.data.primaryEmail,
          phone: change.data.primaryPhone,
        },
      });

      await upsertObject({
        collection: "crm",
        model: "contact",
        userId: newPerson.ownerId.toString(),
        objectId: newPerson.id.toString(),
        updatedAt: newPerson.updatedAt.toISOString(),
        data: {
          firstName: newPerson.name?.split(" ")[0],
          lastName: newPerson.name?.split(" ")[1] || "",
          primaryEmail: newPerson.email,
          primaryPhone: newPerson.phone,
        },
      });
    } else if (change.operation === "UPDATE") {
      const updatedPerson = await prisma.person.update({
        where: {
          ownerId: parseInt(change.userId),
          id: parseInt(change.objectId),
        },
        data: {
          name: change.data.firstName + " " + change.data.lastName,
          email: change.data.primaryEmail,
          phone: change.data.primaryPhone,
        },
      });

      await upsertObject({
        collection: "crm",
        model: "contact",
        userId: updatedPerson.ownerId.toString(),
        objectId: updatedPerson.id.toString(),
        updatedAt: updatedPerson.updatedAt.toISOString(),
        data: {
          firstName: updatedPerson.name?.split(" ")[0],
          lastName: updatedPerson.name?.split(" ")[1] || "",
          primaryEmail: updatedPerson.email,
          primaryPhone: updatedPerson.phone,
        },
      });
    } else if (change.operation === "DELETE") {
      await prisma.person.update({
        where: {
          ownerId: parseInt(change.userId),
          id: parseInt(change.objectId),
        },
        data: {
          isDeleted: true,
        },
      });

      await deleteObject({
        collection: "crm",
        model: "contact",
        userId: change.userId,
        objectId: change.objectId,
      });
    }
  }
}

export interface UpsertObjectProps {
  collection: string;
  model: string;
  userId: string;
  objectId: string;
  updatedAt: string;
  data: unknown;
}

export async function upsertObject(props: UpsertObjectProps) {
  const { collection, model, userId, objectId, updatedAt, data } = props;

  const response = await fetch(
    `http://localhost:3000/api/v1/envs/dev/collections/${collection}/models/${model}/objects`,
    {
      method: "POST",
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        managedUserExternalId: userId,
        externalId: objectId,
        externalUpdatedAt: updatedAt,
        data,
      }),
    }
  );

  if (response.ok) {
    console.log(`Upserted object: ${objectId}`);
    console.log(await response.text());
  } else {
    console.error("Failed to upsert object:", objectId);
    console.log(await response.text());
  }
}

export interface DeleteObjectProps {
  collection: string;
  model: string;
  userId: string;
  objectId: string;
}

export async function deleteObject(props: DeleteObjectProps) {
  const { collection, model, userId, objectId } = props;

  const response = await fetch(
    `http://localhost:3000/api/v1/envs/dev/collections/${collection}/models/${model}/objects`,
    {
      method: "DELETE",
      headers: {
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        managedUserExternalId: userId,
        externalId: objectId,
      }),
    }
  );

  if (response.ok) {
    console.log(`Deleted object: ${objectId}`);
    console.log(await response.text());
  } else {
    console.error("Failed to delete object:", objectId);
    console.log(await response.text());
  }
}
