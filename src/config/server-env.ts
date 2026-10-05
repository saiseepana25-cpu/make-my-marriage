import "server-only";

type RequiredServerEnv =
  | "MONGODB_URI" | "AWS_REGION" | "AWS_S3_BUCKET"
  | "AWS_ACCESS_KEY_ID" | "AWS_SECRET_ACCESS_KEY" | "CRON_SECRET" | "AUTH_RATE_LIMIT_SECRET";

export class ConfigurationError extends Error {
  constructor(public readonly variable: RequiredServerEnv) {
    super(`Missing required server configuration: ${variable}.`);
    this.name = "ConfigurationError";
  }
}

export function requiredServerEnv(name: RequiredServerEnv): string {
  const value = process.env[name]?.trim();
  if (!value) throw new ConfigurationError(name);
  return value;
}
