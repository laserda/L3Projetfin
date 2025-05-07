import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env" });
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}
// export const db = drizzle(process.env.DATABASE_URL);
export const db = drizzle<typeof schema>(process.env.DATABASE_URL, { schema });
