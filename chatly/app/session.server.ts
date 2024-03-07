import { createCookieSessionStorage, redirect } from "@remix-run/node";

const USER_ID = "userId";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: ["1234567890"],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function createUserSession({
  request,
  userId,
  remember,
}: {
  request: Request;
  userId: string;
  remember: boolean;
}) {
  const session = await getSession(request);
  session.set(USER_ID, userId);
  return redirect("/leads", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function getUserId(request: Request) {
  const session = await getSession(request);
  const userId = session.get(USER_ID);

  return parseInt(userId);
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}
