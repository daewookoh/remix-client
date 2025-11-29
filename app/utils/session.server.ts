import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { authenticator, type User } from "~/services/auth.server";

const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-in-production";

// Session Storage 생성 (Remix Auth와 공유)
export const sessionStorage = createCookieSessionStorage<{
  user: User;
}>({
  cookie: {
    name: "__session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

// 사용자 정보 가져오기 (Remix Auth 사용)
export async function getUser(request: Request): Promise<User | null> {
  return await authenticator.isAuthenticated(request);
}

// 로그인 필수
export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const user = await getUser(request);
  if (!user) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return user;
}

// 로그아웃
export async function logout(request: Request) {
  return await authenticator.logout(request, { redirectTo: "/login" });
}
