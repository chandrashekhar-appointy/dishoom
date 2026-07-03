import { closePool, pool } from "./db.js";

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dishes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log("Migration complete: dishes table is ready");
    })
    .finally(closePool)
    .catch((error) => {
      console.error("Migration failed");
      console.error(error);
      process.exitCode = 1;
    });
}
