import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  return await authenticator.authenticate("github", request, {
    successRedirect: redirectTo,
    failureRedirect: "/login",
  });
}

export async function loader() {
  return redirect("/login");
}
