import { Constants, Message } from 'oceanic.js'
import { App, Listener } from '../structures'
import locales, { Args } from '../locales'
import { User, UserSchemaInterface } from '../database'
import CommandContext from '../structures/command/CommandContext'

export default class MessageCreateListener extends Listener {
  public constructor(client: App) {
    super({
      client,
      name: 'messageCreate'
    })
  }
  public async run(message: Message) {
    if(message.author.bot) return
    if(message.channel?.type !== Constants.ChannelTypes.GUILD_TEXT) return
    if(!message.content.toLowerCase().startsWith(process.env.PREFIX)) return
    let messageArray = message.content.split(' ')
    let command = messageArray.shift()!.toLowerCase()
    let args = messageArray.slice(0)
    let cmd = this.client.commands.get(command.slice(process.env.PREFIX.length)) || this.client.commands.get(this.client.aliases.get(command.slice(process.env.PREFIX.length))!)
    if(!cmd) return
    if(cmd.onlyDev && message.author.id !== '441932495693414410') return
    if(!['1237458600046104617', '1237458505196114052', '1237457762502574130'].some(r => message.member?.roles.includes(r))) return
    const user = await User.findById(message.author.id) ?? new User({ _id: message.author.id })
    const ctx = new CommandContext({
      db: {
        user: {
          get: () => {
            return user as unknown as UserSchemaInterface
          },
          getById: async(id: string) => {
            return await User.findById(id) as unknown as Promise<UserSchemaInterface>
          }
        }
      },
      guild: message.guild!,
      locale: user.lang ?? 'en',
      message
    })
    ctx.args = args
    cmd.locale = (content: string, args?: Args) => {
      return locales(user.lang ?? 'en', content, args)
    }
    cmd.getUser = async(user: string) => {
      try {
        return await this.client.rest.users.get(user.replace(/[<@!>]/g, ''))
      }
      catch(e) {
        console.error(e)
      }
    }
    cmd.getMember = (member: string) => {
      return ctx.guild.members.get(member.replace(/[<@!>]/g, ''))
    }
    cmd.run(ctx)
    .catch(e => {
      console.error(e)
      ctx.send('helper.error', { e })
    })
  }
}