import { prisma } from "~/db.server";
import { Lightyear, ModelSynchronizer } from "@runlightyear/node";
import { LIGHTYEAR_BASE_URL } from "~/contants";

const lightyear = new Lightyear({
  apiKey: process.env.LIGHTYEAR_API_KEY!,
  baseUrl: LIGHTYEAR_BASE_URL,
  env: process.env.LIGHTYEAR_ENV!,
});

export async function sync() {
  await lightyear.syncCollection({
    collection: "crm",
    models: {
      account: new ModelSynchronizer({
        list: async () => {
          const companies = await prisma.company.findMany({
            orderBy: {
              updatedAt: "asc",
            },
          });
          return companies.map((company) => ({
            id: company.id.toString(),
            userId: company.ownerId.toString(),
            updatedAt: company.updatedAt.toISOString(),
            isDeleted: company.isDeleted,
            data: {
              name: company.name,
              website: company.domain,
            },
          }));
        },
        get: async (id) => {
          const company = await prisma.company.findUniqueOrThrow({
            where: { id: parseInt(id) },
          });
          return {
            id: company.id.toString(),
            userId: company.ownerId.toString(),
            updatedAt: company.updatedAt.toISOString(),
            isDeleted: company.isDeleted,
            data: {
              name: company.name,
              website: company.domain,
            },
          };
        },
        create: async (object) => {
          const newCompany = await prisma.company.create({
            data: {
              ownerId: parseInt(object.userId),
              name: object.data.name,
              domain: object.data.website,
            },
          });
          return newCompany.id.toString();
        },
        update: async (object) => {
          await prisma.company.update({
            where: {
              id: parseInt(object.id),
            },
            data: {
              name: object.data.name,
              domain: object.data.website,
            },
          });
        },
        delete: async (id) => {
          await prisma.company.update({
            where: {
              id: parseInt(id),
            },
            data: {
              isDeleted: true,
            },
          });
        },
      }),
      contact: new ModelSynchronizer({
        list: async () => {
          const people = await prisma.person.findMany({
            orderBy: { updatedAt: "asc" },
          });
          return people.map((person) => ({
            id: person.id.toString(),
            userId: person.ownerId.toString(),
            updatedAt: person.updatedAt.toISOString(),
            isDeleted: person.isDeleted,
            data: {
              firstName: person.name?.split(" ")[0] || null,
              lastName: person.name?.split(" ")[1] || null,
              email: person.email,
              phone: person.phone,
              accountId: person.companyId?.toString() || null,
            },
          }));
        },
        get: async (id) => {
          const person = await prisma.person.findUniqueOrThrow({
            where: { id: parseInt(id) },
          });
          return {
            id: person.id.toString(),
            userId: person.ownerId.toString(),
            updatedAt: person.updatedAt.toISOString(),
            isDeleted: person.isDeleted,
            data: {
              firstName: person.name?.split(" ")[0] || null,
              lastName: person.name?.split(" ")[1] || null,
              email: person.email,
              phone: person.phone,
              accountId: person.companyId?.toString() || null,
            },
          };
        },
        create: async (object) => {
          const newPerson = await prisma.person.create({
            data: {
              ownerId: parseInt(object.userId),
              name: `${object.data.firstName} ${object.data.lastName}`,
              email: object.data.email,
              phone: object.data.phone,
              companyId: object.data.accountId
                ? parseInt(object.data.accountId)
                : null,
            },
          });
          return newPerson.id.toString();
        },
        update: async (object) => {
          await prisma.person.update({
            where: {
              id: parseInt(object.id),
            },
            data: {
              name: `${object.data.firstName} ${object.data.lastName}`,
              email: object.data.email,
              phone: object.data.phone,
              companyId: object.data.accountId
                ? parseInt(object.data.accountId)
                : null,
            },
          });
        },
        delete: async (id) => {
          await prisma.person.update({
            where: {
              id: parseInt(id),
            },
            data: {
              isDeleted: true,
            },
          });
        },
      }),
    },
  });
}
