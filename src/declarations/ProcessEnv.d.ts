/**
 * These should only be of type "string" or "string | undefined". If a key
 * exists in the base .env file, the type can be "string". Otherwise, it's best
 * practice to set the type to "string | undefined".
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Set on start or defaulted to development
    NODE_ENV: string;

    // Loaded from package.json
    PACKAGE_NAME: string;
    PACKAGE_VERSION: string;

    // App config
    LOGGING_ENABLED: string;
  }
}
