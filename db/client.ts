import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// For server-side usage (Next.js Server Components, Route Handlers, etc.)
// We use a single connection for migrations/seed scripts and a pool for the app.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
