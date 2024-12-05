declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      MONGO_URI: string;
      PREFIX: string;
      MOD_LOG: string;
      SABINE_TOKEN: string;
      MP_TOKEN: string;
      WEBHOOK_URL: string;
    }
  }
}
export {}