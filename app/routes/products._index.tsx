import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { productApi } from "~/utils/api.client.server";
import { getToken } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [{ title: "제품 목록" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const token = await getToken(request);
  const { products } = await productApi.getAll(token || undefined);

  return json({ products });
}

export default function ProductsIndex() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>제품 목록</h1>

      {products.length === 0 ? (
        <p>등록된 제품이 없습니다.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "white",
                textDecoration: "none",
                color: "inherit",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {product.images[0] && (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px" }}
                />
              )}
              <h3 style={{ marginTop: "1rem" }}>{product.name}</h3>
              <p style={{ color: "#666", fontSize: "0.9rem" }}>{product.description}</p>
              <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#007bff" }}>
                ₩{product.price.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
