import * as dotenv from "dotenv";
import { z } from "zod";

export type Config = {
  db_host: string;
  db_port: number;
  db_user: string;
  db_password: string;
  db_database: string;
};

const ConfigZodType = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
});

export function getConfig(): Config {
  if (process.env.NODE_ENV != "production") {
    console.log("Loading .env file");
    const { error } = dotenv.config();
    if (error) {
      throw new Error("Failed to load .env file");
    }
  }
  const result = ConfigZodType.safeParse(process.env);
  if (!result.success) {
    console.log("Invalid configuration", result.error.format());
    throw new Error("Invalid configuration");
  }
  return {
    db_host: result.data.DB_HOST,
    db_port: parseInt(result.data.DB_PORT),
    db_user: result.data.DB_USER,
    db_password: result.data.DB_PASSWORD,
    db_database: result.data.DB_DATABASE,
  };
}
