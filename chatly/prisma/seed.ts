import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      email: "alice@prisma.io",
      password: "password",
    },
  });

  const martinMcDonald = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Martin McDonald",
      email: "martin@example.com",
      phone: "555-123-4567",
    },
  });

  const samCowan = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Sam Cowan",
      email: "same@example.com",
      phone: "555-456-7890",
    },
  });

  const charlesCarter = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Charles Carter",
      email: "charles@example.com",
      phone: "555-987-6543",
    },
  });

  const florenceOlin = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Florence Olin",
      email: "florence@example.com",
      phone: "555-123-4567",
    },
  });

  const lindaLane = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Linda Lane",
      email: "linda@example.com",
      phone: "555-321-4321",
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: alice.id,
      personId: martinMcDonald.id,
      messages: {
        create: [
          {
            personId: martinMcDonald.id,
            text: "I have a question",
          },
          {
            userId: alice.id,
            text: "Here is the answer",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: alice.id,
      personId: samCowan.id,
      messages: {
        create: [
          {
            personId: samCowan.id,
            text: "Hey there, how's it going?",
          },
          {
            userId: alice.id,
            text: "Doing well, thanks for asking!",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: alice.id,
      personId: charlesCarter.id,
      messages: {
        create: [
          {
            personId: charlesCarter.id,
            text: "Hello there, do you have a minute to talk?",
          },
          {
            userId: alice.id,
            text: "Sure, what's on your mind?",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: alice.id,
      personId: lindaLane.id,
      messages: {
        create: [
          {
            personId: lindaLane.id,
            text: "Hi there, I was wondering if you could help me with something?",
          },
          {
            userId: alice.id,
            text: "Of course, how can I help?",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: alice.id,
      personId: florenceOlin.id,
      messages: {
        create: [
          {
            personId: florenceOlin.id,
            text: "I was wondering if you had any advice?",
          },
          {
            userId: alice.id,
            text: "I'd be happy to help if I can. What do you need advice about?",
          },
        ],
      },
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      email: "bob@prisma.io",
      password: "password",
    },
  });
  console.log({ alice, bob });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
