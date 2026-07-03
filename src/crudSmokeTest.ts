import { app } from "./app.js";
import { closePool } from "./db.js";
import { migrate } from "./migrate.js";

type JsonResponse = Record<string, unknown>;

async function requestJson(
  baseUrl: string,
  path: string,
  init?: RequestInit
): Promise<JsonResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {})
    }
  });
  const body = (await response.json()) as JsonResponse;

  console.log(`${init?.method || "GET"} ${path} -> ${response.status}`);
  console.log(JSON.stringify(body, null, 2));

  if (!response.ok) {
    throw new Error(`Request failed: ${init?.method || "GET"} ${path}`);
  }

  return body;
}

async function main() {
  await migrate();

  const server = app.listen(0);
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Could not bind test server");
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Dishoom smoke test server: ${baseUrl}`);

  try {
    await requestJson(baseUrl, "/health");
    await requestJson(baseUrl, "/dishes");

    const createBody = await requestJson(baseUrl, "/dishes", {
      method: "POST",
      body: JSON.stringify({
        name: `Sandbox Dish ${Date.now()}`,
        notes: "Created by E2B/Vercel env POC"
      })
    });
    const dish = createBody.dish as { id: number };

    await requestJson(baseUrl, `/dishes/${dish.id}`);
    await requestJson(baseUrl, `/dishes/${dish.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: `Updated Sandbox Dish ${dish.id}`,
        notes: "Updated during CRUD smoke test"
      })
    });
    await requestJson(baseUrl, `/dishes/${dish.id}`, { method: "DELETE" });
    await requestJson(baseUrl, "/dishes");
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await closePool();
  }
}

main().catch((error) => {
  console.error("CRUD smoke test failed");
  console.error(error);
  process.exitCode = 1;
});
