import { redirect } from "@remix-run/node";
import { authenticator, sessionStorage, type User } from "~/services/auth.server";

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
