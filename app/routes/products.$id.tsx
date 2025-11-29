import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { productService } from "~/services/product.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.product.name || "제품 상세" }];
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    marginBottom: "1rem",
    display: "inline-block" as const,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginTop: "1rem",
  },
  imagePlaceholder: {
    width: "100%",
    height: "400px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: "2rem",
    padding: "1rem 2rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) {
    throw new Response("Not Found", { status: 404 });
  }

  const product = await productService.getById(params.id);

  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ product });
}

export default function ProductDetail() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div style={styles.container}>
      <Link to="/products" style={styles.link}>
        ← 목록으로 돌아가기
      </Link>

      <div style={styles.grid}>
        <div>
          {product.images[0] ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
          ) : (
            <div style={styles.imagePlaceholder}>
              이미지 없음
            </div>
          )}

          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              {product.images.slice(1).map((image) => (
                <img
                  key={image.id}
                  src={image.url}
                  alt={product.name}
                  style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "4px" }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1>{product.name}</h1>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#007bff", marginTop: "1rem" }}>
            ₩{product.price.toLocaleString()}
          </p>
          <p style={{ marginTop: "1rem", lineHeight: "1.6", color: "#333" }}>
            {product.description}
          </p>

          <button style={styles.button}>
            장바구니 추가
          </button>
        </div>
      </div>
    </div>
  );
}
