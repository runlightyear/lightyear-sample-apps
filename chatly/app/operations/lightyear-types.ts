import { FromSchema } from "json-schema-to-ts";

export const CrmAccountSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    domain: { type: ["string", "null"] },
  },
  required: ["name", "domain"],
  additionalProperties: false,
} as const;

export type CrmAccountModel = FromSchema<typeof CrmAccountSchema>;

export const CrmContactSchema = {
  type: "object",
  properties: {
    firstName: { type: ["string", "null"] },
    lastName: { type: ["string", "null"] },
    primaryEmail: { type: ["string", "null"] },
    primaryPhone: { type: ["string", "null"] },
    accountId: {
      anyOf: [{ type: "string", references: "account" }, { type: "null" }],
    },
  },
  additionalProperties: false,
} as const;

export type CrmContactModel = FromSchema<typeof CrmContactSchema>;
