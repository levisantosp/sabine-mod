declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      MONGO_URI: string;
      PREFIX: string;
      MOD_LOG: string;
      SABINE_TOKEN: string;
      MP_TOKEN: string;
      MP_WEBHOOK_URL: string;
      PAYPAL_WEBHOOK_URL: string;
      ERROR_LOG: string;
      USERS_LOG: string;
      PAYPAL_TOKEN: string;
      PAYPAL_CLIENT_ID: string;
    }
  }
}
export {}