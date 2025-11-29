import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getUser } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "로그인" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  return json({
    user,
    redirectTo,
    // 소셜 로그인 활성화 여부
    googleEnabled: !!process.env.GOOGLE_CLIENT_ID,
    githubEnabled: !!process.env.GITHUB_CLIENT_ID,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  try {
    return await authenticator.authenticate("user-pass", request, {
      successRedirect: redirectTo,
      failureRedirect: "/login",
      throwOnError: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "로그인에 실패했습니다." }, { status: 400 });
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const isSubmitting = navigation.state === "submitting";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "2rem",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#333", marginBottom: "0.5rem" }}>
            로그인
          </h1>
          <p style={{ color: "#666" }}>계정에 로그인하세요</p>
        </div>

        {actionData?.error && (
          <div style={{
            padding: "1rem",
            backgroundColor: "#fee",
            color: "#c00",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #fcc"
          }}>
            {actionData.error}
          </div>
        )}

        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="user@example.com"
              defaultValue="a@a.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#333" }}>
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              defaultValue="test123"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "1rem",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: isSubmitting ? "#999" : "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              marginTop: "0.5rem"
            }}
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#5568d3")}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#667eea")}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </Form>

        {(loaderData.googleEnabled || loaderData.githubEnabled) && (
          <>
            <div style={{ marginTop: "1.5rem", textAlign: "center", position: "relative" }}>
              <div style={{
                borderTop: "1px solid #e0e0e0",
                position: "relative",
                margin: "1.5rem 0"
              }}>
                <span style={{
                  position: "absolute",
                  top: "-0.6rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "white",
                  padding: "0 1rem",
                  color: "#999",
                  fontSize: "0.875rem"
                }}>
                  또는
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {loaderData.googleEnabled && (
                <Form action="/auth/google" method="post">
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: "white",
                      color: "#333",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                      e.currentTarget.style.borderColor = "#667eea";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                      e.currentTarget.style.borderColor = "#e0e0e0";
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google로 계속하기
                  </button>
                </Form>
              )}

              {loaderData.githubEnabled && (
                <Form action="/auth/github" method="post">
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: "#24292e",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1a1e22"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#24292e"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub로 계속하기
                  </button>
                </Form>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <Link
            to="/"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
          >
            홈으로 돌아가기
          </Link>
        </div>

        <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem", color: "#666" }}>
          <p>테스트 계정: a@a.com / test123</p>
        </div>
      </div>
    </div>
  );
}
