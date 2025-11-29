import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { GoogleStrategy } from "remix-auth-google";
import { GitHubStrategy } from "remix-auth-github";
import bcrypt from "bcryptjs";
import { prisma } from "~/lib/prisma.server";
import { createCookieSessionStorage } from "@remix-run/node";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "user";
}

const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-in-production";

// Session Storage 생성
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

// Authenticator 인스턴스 생성
export const authenticator = new Authenticator<User>(sessionStorage);

// Form Strategy (Email/Password) - User용
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    console.log('[Auth] Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('[Auth] Missing credentials');
      throw new Error("이메일과 비밀번호를 입력해주세요.");
    }

    // User 테이블에서 먼저 검색
    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log('[Auth] User found:', !!user);

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log('[Auth] Password valid:', isValid);

      if (!isValid) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user" as const,
      };
    }

    // Admin 테이블에서 검색
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    console.log('[Auth] Admin found:', !!admin);

    if (admin) {
      const isValid = await bcrypt.compare(password, admin.password);
      console.log('[Auth] Admin password valid:', isValid);

      if (!isValid) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      }

      return {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "admin" as const,
      };
    }

    console.log('[Auth] No user or admin found');
    throw new Error("계정을 찾을 수 없습니다.");
  }),
  "user-pass"
);

// Google Strategy (선택적 - 환경변수가 있을 때만 활성화)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authenticator.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
      },
      async ({ profile }) => {
        // Google 로그인으로 User 찾거나 생성
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          // 새 사용자 생성 (소셜 로그인이므로 비밀번호 없음)
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              name: profile.displayName,
              password: await bcrypt.hash(Math.random().toString(36), 10), // 임의 비밀번호
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "user" as const,
        };
      }
    ),
    "google"
  );
}

// GitHub Strategy (선택적 - 환경변수가 있을 때만 활성화)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  authenticator.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback",
      },
      async ({ profile }) => {
        const email = profile.emails[0].value;

        // GitHub 로그인으로 User 찾거나 생성
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              password: await bcrypt.hash(Math.random().toString(36), 10), // 임의 비밀번호
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "user" as const,
        };
      }
    ),
    "github"
  );
}
