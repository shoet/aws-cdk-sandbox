import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

type Payload = {
  config: {
    secretID: string;
  };
};

type DBConfig = {
  password: string;
  dbname: string;
  port: number;
  host: string;
  username: string;
};

async function getSecrets(secretArn: string): Promise<DBConfig> {
  const client = new SecretsManagerClient();
  const getCommand = new GetSecretValueCommand({
    SecretId: secretArn,
  });

  const result = await client.send(getCommand);
  const secretString = result.SecretString;
  if (!secretString) {
    throw new Error("Failed to get secret");
  }

  try {
    const dbConfig: DBConfig = JSON.parse(secretString);
    return dbConfig;
  } catch (e) {
    throw new Error("Failed to parse secret");
  }
}

export async function handler(payload: Payload): Promise<any> {
  const { secretID } = payload.config;
  try {
    const dbConfig = await getSecrets(secretID);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to get secret",
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello, world!",
    }),
  };
}
