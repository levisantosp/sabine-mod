import { CreateMessageOptions, Guild, Message } from 'oceanic.js'
import { UserSchemaInterface } from '../../database'
import locales, { Args } from '../../locales'

type Database = {
  user: {
    get: () => UserSchemaInterface
    getById: (id: string) => Promise<UserSchemaInterface>
  }
}
type CommandContextOptions = {
  guild: Guild
  db: Database
  message: Message
  locale: string
}
export default class CommandContext {
  public guild: Guild
  public db: Database
  public message: Message
  public locale: string
  public args: string[] = []
  public constructor(options: CommandContextOptions) {
    this.guild = options.guild
    this.db = options.db
    this.message = options.message
    this.locale = options.locale
  }
  public async send(content: string | CreateMessageOptions, args?: Args) {
    switch(typeof content) {
      case 'string': {
        return this.message.channel?.createMessage({
          content: locales(this.locale, content, args)
        })
      }
      case 'object': {
        this.message.channel?.createMessage(content)
      }
    }
  }
}