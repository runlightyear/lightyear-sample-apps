import { json } from "@remix-run/node";
import { prisma } from "./db.server";

export async function requireAuth(request: Request) {
  const header = request.headers.get("Authorization");

  if (!header) {
    throw json({ message: "Missing Authorization header" }, { status: 401 });
  }

  const base64 = header.replace("Basic ", "");
  const [username, password] = Buffer.from(base64, "base64")
    .toString()
    .split(":");

  const user = await prisma.user.findFirst({
    where: {
      email: username,
      password: password,
    },
  });

  if (!user) {
    throw json({ message: "Invalid username or password" }, { status: 401 });
  }

  return user.id;
}
