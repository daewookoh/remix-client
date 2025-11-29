import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Catch-all route to handle Chrome DevTools and other unmatched routes silently
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Silently handle Chrome DevTools requests
  if (url.pathname.includes(".well-known/appspecific/com.chrome")) {
    return new Response(null, { status: 204 });
  }

  // For other 404s, you can return a proper 404 page
  throw new Response("Not Found", { status: 404 });
}

export default function CatchAll() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ color: "#007bff", textDecoration: "none" }}>
        Go back home
      </a>
    </div>
  );
}
