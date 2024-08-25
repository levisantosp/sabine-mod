import 'dotenv/config'
import { App } from './structures'
new App({
  auth: 'Bot ' + process.env.BOT_TOKEN,
  gateway: {
    intents: ['ALL'],
    autoReconnect: true
  }
}).start()