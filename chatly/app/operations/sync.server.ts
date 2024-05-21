import { prisma } from "~/db.server";
import {
  LightyearSdk,
  ModelSync,
  ObjectMetaData,
} from "./lightyear-sdk.server";
import { CrmAccountModel, CrmContactModel } from "./lightyear-types";
import { Company } from "@prisma/client";

const lightyear = new LightyearSdk({ apiKey: process.env.LIGHTYEAR_API_KEY! });

export async function sync() {
  const companyToModel = (
    company: Company
  ): ObjectMetaData<CrmAccountModel> => ({
    id: company.id.toString(),
    userId: company.ownerId.toString(),
    updatedAt: company.updatedAt.toISOString(),
    isDeleted: company.isDeleted,
    data: {
      name: company.name,
      domain: company.domain,
    },
  });

  await lightyear.syncCollection({
    collection: "crm",
    models: {
      account: new ModelSync<CrmAccountModel>({
        list: async () => {
          const companies = await prisma.company.findMany({
            orderBy: {
              updatedAt: "asc",
            },
          });
          return companies.map((company) => companyToModel(company));
        },
        get: async (id) => {
          const company = await prisma.company.findUniqueOrThrow({
            where: { id: parseInt(id) },
          });
          return companyToModel(company);
        },
        create: async (object) => {
          const newCompany = await prisma.company.create({
            data: {
              ownerId: parseInt(object.userId),
              name: object.data.name,
              domain: object.data.domain,
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
              domain: object.data.domain,
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
      contact: new ModelSync<CrmContactModel>({
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
              primaryEmail: person.email,
              primaryPhone: person.phone,
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
              primaryEmail: person.email,
              primaryPhone: person.phone,
              accountId: person.companyId?.toString() || null,
            },
          };
        },
        create: async (object) => {
          const newPerson = await prisma.person.create({
            data: {
              ownerId: parseInt(object.userId),
              name: `${object.data.firstName} ${object.data.lastName}`,
              email: object.data.primaryEmail,
              phone: object.data.primaryPhone,
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
              email: object.data.primaryEmail,
              phone: object.data.primaryPhone,
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
