import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { z } from "zod";
import { pool } from "./db.js";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const dishInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(500).default("")
});

const idSchema = z.coerce.number().int().positive();

export const app = express();

app.use(express.json());

app.get("/health", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.json({ ok: true, service: "dishoom", db: "reachable" });
  } catch (error) {
    next(error);
  }
});

app.get("/dishes", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, notes, created_at, updated_at FROM dishes ORDER BY id"
    );
    response.json({ ok: true, dishes: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post("/dishes", async (request, response, next) => {
  try {
    const input = dishInputSchema.parse(request.body);
    const result = await pool.query(
      "INSERT INTO dishes (name, notes) VALUES ($1, $2) RETURNING id, name, notes, created_at, updated_at",
      [input.name, input.notes]
    );
    response.status(201).json({ ok: true, dish: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.get("/dishes/:id", async (request, response, next) => {
  try {
    const id = idSchema.parse(request.params.id);
    const result = await pool.query(
      "SELECT id, name, notes, created_at, updated_at FROM dishes WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ ok: false, error: "dish_not_found" });
      return;
    }

    response.json({ ok: true, dish: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.put("/dishes/:id", async (request, response, next) => {
  try {
    const id = idSchema.parse(request.params.id);
    const input = dishInputSchema.parse(request.body);
    const result = await pool.query(
      `
        UPDATE dishes
        SET name = $1, notes = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, name, notes, created_at, updated_at
      `,
      [input.name, input.notes, id]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ ok: false, error: "dish_not_found" });
      return;
    }

    response.json({ ok: true, dish: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.delete("/dishes/:id", async (request, response, next) => {
  try {
    const id = idSchema.parse(request.params.id);
    const result = await pool.query(
      "DELETE FROM dishes WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      response.status(404).json({ ok: false, error: "dish_not_found" });
      return;
    }

    response.json({ ok: true, deletedId: result.rows[0].id });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(projectRoot));

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction
  ) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({
        ok: false,
        error: "validation_error",
        issues: error.issues
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    response.status(500).json({ ok: false, error: message });
  }
);
