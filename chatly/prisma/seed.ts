import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

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

  const bosco = await prisma.company.create({
    data: {
      ownerId: alice.id,
      name: "Bosco",
      domain: "bosco.com",
    },
  });

  const hellerGroup = await prisma.company.create({
    data: {
      ownerId: alice.id,
      name: "Heller Group",
      domain: "hellergroup.com",
    },
  });

  const purdyLLC = await prisma.company.create({
    data: {
      ownerId: alice.id,
      name: "Purdy LLC",
      domain: "purdy.com",
    },
  });

  const martinMcDonald = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Martin McDonald",
      email: "martin@example.com",
      phone: "555-123-4567",
      companyId: bosco.id,
    },
  });

  const samCowan = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Sam Cowan",
      email: "same@example.com",
      phone: "555-456-7890",
      companyId: hellerGroup.id,
    },
  });

  const charlesCarter = await prisma.person.create({
    data: {
      ownerId: alice.id,
      name: "Charles Carter",
      email: "charles@example.com",
      phone: "555-987-6543",
      companyId: purdyLLC.id,
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

  const unitedWidgets = await prisma.company.create({
    data: {
      ownerId: bob.id,
      name: "United Widgets",
      domain: "unitedwidgets.com",
    },
  });

  const winmart = await prisma.company.create({
    data: {
      ownerId: bob.id,
      name: "Winmart",
      domain: "winmart.com",
    },
  });

  const stevensonAndCo = await prisma.company.create({
    data: {
      ownerId: bob.id,
      name: "Stevenson and Co.",
      domain: "stevensonandco.com",
    },
  });

  const moniqueJMastin = await prisma.person.create({
    data: {
      ownerId: bob.id,
      name: "Monique Mastin",
      email: "monique@example.com",
      phone: "555-123-4567",
      companyId: unitedWidgets.id,
    },
  });

  const debraCouey = await prisma.person.create({
    data: {
      ownerId: bob.id,
      name: "Debra Couey",
      email: "debra@example.com",
      phone: "555-456-7890",
      companyId: winmart.id,
    },
  });

  const homerMarch = await prisma.person.create({
    data: {
      ownerId: bob.id,
      name: "Homer March",
      email: "homer@example.com",
      phone: "555-987-6543",
      companyId: stevensonAndCo.id,
    },
  });

  const dawnFord = await prisma.person.create({
    data: {
      ownerId: bob.id,
      name: "Dawn Ford",
      email: "dawn@example.com",
      phone: "555-123-4567",
      companyId: unitedWidgets.id,
    },
  });

  const jamesGreen = await prisma.person.create({
    data: {
      ownerId: bob.id,
      name: "James Green",
      email: "james@example.com",
      phone: "555-321-4321",
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: bob.id,
      personId: moniqueJMastin.id,
      messages: {
        create: [
          {
            personId: moniqueJMastin.id,
            text: "I have a question",
          },
          {
            userId: bob.id,
            text: "Here is the answer",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: bob.id,
      personId: debraCouey.id,
      messages: {
        create: [
          {
            personId: debraCouey.id,
            text: "Hey there, how's it going?",
          },
          {
            userId: bob.id,
            text: "Doing well, thanks for asking!",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: bob.id,
      personId: homerMarch.id,
      messages: {
        create: [
          {
            personId: homerMarch.id,
            text: "Hello there, do you have a minute to talk?",
          },
          {
            userId: bob.id,
            text: "Sure, what's on your mind?",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: bob.id,
      personId: dawnFord.id,
      messages: {
        create: [
          {
            personId: dawnFord.id,
            text: "Hi there, I was wondering if you could help me with something?",
          },
          {
            userId: bob.id,
            text: "Of course, how can I help?",
          },
        ],
      },
    },
  });

  await prisma.thread.create({
    data: {
      ownerId: bob.id,
      personId: jamesGreen.id,
      messages: {
        create: [
          {
            personId: jamesGreen.id,
            text: "I was wondering if you had any advice?",
          },
          {
            userId: bob.id,
            text: "I'd be happy to help if I can. What do you need advice about?",
          },
        ],
      },
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
