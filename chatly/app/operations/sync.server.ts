import { prisma } from "~/db.server";
import z from "zod";

const CollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      managedUserId: z.string(),
      externalId: z.string().nullable(),
      appName: z.string().nullable(),
      customAppName: z.string().nullable(),
      productId: z.string().nullable(),
      data: z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        phone: z.string().nullable(),
      }),
      createdAt: z.string(),
      updatedAt: z.string(),
      status: z.enum(["UPSERTED", "DELETED"]),
    })
  ),
});

type Collection = z.infer<typeof CollectionSchema>;

export async function sync(userId: number) {
  console.log("Syncing...");

  const collection = await getCollection();
  let lastProductSync = await getLastProductSync();

  for (const item of collection.items) {
    if (new Date(item.updatedAt) < new Date(lastProductSync)) {
      console.log("Skipping item", item.data.name);
      continue;
    }

    if (item.status === "UPSERTED") {
      if (!item.productId) {
        const newPerson = await prisma.person.create({
          data: {
            ownerId: userId,
            name: item.data.name,
            email: item.data.email,
            phone: item.data.phone,
          },
        });

        item.productId = newPerson.id.toString();
        console.log("Created person", newPerson.name);
      } else {
        await prisma.person.update({
          where: { id: parseInt(item.productId) },
          data: {
            name: item.data.name,
            email: item.data.email,
            phone: item.data.phone,
          },
        });
        console.log("Updated person", item.data.name);
      }
    } else if (item.status === "DELETED") {
      if (item.productId) {
        await prisma.person.delete({
          where: { id: parseInt(item.productId) },
        });
        item.productId = null;
        console.log("Deleted person", item.data.name);
      }
    }

    await updateCollection(collection);

    lastProductSync = item.updatedAt;
    await updateLastProductSync(lastProductSync);
  }
}

async function getCollection() {
  const response = await fetch(
    "https://app.runlightyear.com/api/v1/envs/dev/actions/hubspot/variables/collection",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const json = await response.json();
  const value = JSON.parse(json.value);
  const collection = CollectionSchema.parse(value);

  return collection;
}

async function updateCollection(collection: Collection) {
  const response = await fetch(
    "https://app.runlightyear.com/api/v1/envs/dev/actions/hubspot/variables/collection",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
      body: JSON.stringify({ value: JSON.stringify(collection) }),
    }
  );
}

async function getLastProductSync() {
  const response = await fetch(
    "https://app.runlightyear.com/api/v1/envs/dev/actions/hubspot/variables/lastProductSync",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
    }
  );

  const json = await response.json();
  return json.value;
}

async function updateLastProductSync(lastSync: string) {
  const response = await fetch(
    "https://app.runlightyear.com/api/v1/envs/dev/actions/hubspot/variables/lastProductSync",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `apiKey ${process.env.LIGHTYEAR_API_KEY}`,
      },
      body: JSON.stringify({ value: lastSync }),
    }
  );
}

export async function updatePersonInLightyear(id: string) {
  const collection = await getCollection();
  const item = collection.items.find((i) => i.productId === id);
  if (!item) {
    console.log("Person not found in collection", id);
    return;
  }

  const person = await prisma.person.findUnique({
    where: { id: parseInt(id) },
  });

  if (!person) {
    console.log("Person not found in database", id);
    return;
  }

  item.data = {
    name: person.name,
    email: person.email,
    phone: person.phone,
  };

  await updateCollection(collection);
}
