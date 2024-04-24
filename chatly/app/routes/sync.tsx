import { ActionFunction } from "@remix-run/node";
import { sync } from "~/operations/sync.server";

export const action: ActionFunction = async () => {
  await sync();
  return null;
};
