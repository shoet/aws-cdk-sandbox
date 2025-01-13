import * as dotenv from "dotenv";
import { z } from "zod";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export type Config = {
  db_host: string;
  db_port: number;
  db_user: string;
  db_password: string;
  db_database: string;
};

const DBConfigZodType = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
});

export async function getConfig(): Promise<Config> {
  let dbConfig: any;

  if (process.env.NODE_ENV == "production") {
    const secretsID = process.env.DB_SECRETS_ID;
    const secretsManager = new SecretsManagerClient();
    const getCommand = new GetSecretValueCommand({
      SecretId: secretsID,
    });
    const result = await secretsManager.send(getCommand);
    if (result.SecretString == undefined) {
      throw new Error("Failed to load secrets");
    }
    dbConfig = JSON.parse(result.SecretString);
  } else {
    console.log("Loading .env file");
    const { error } = dotenv.config();
    if (error) {
      throw new Error("Failed to load .env file");
    }
    dbConfig = process.env;
  }

  const result = DBConfigZodType.safeParse(dbConfig);
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
