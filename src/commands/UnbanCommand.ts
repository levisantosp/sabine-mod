import { TextChannel } from 'oceanic.js'
import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'

export default class UnbanCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'unban',
      aliases: ['unb']
    })
  }
  public async run(ctx: CommandContext) {
    await ctx.message.delete()
    const user = await this.getUser(ctx.args[0])
    if(!user) {
      ctx.send('commands.ban.missing_user')
      return
    }
    await ctx.guild.removeBan(user.id)
    ctx.send('commands.unban.res2', {
      user: user.tag,
      id: user.id
    })
    const channel = this.client?.getChannel(process.env.MOD_LOG) as TextChannel
    channel.createMessage({
      content: this.locale('commands.unban.res', {
        user: user.tag,
        id: user.id,
        author: ctx.message.author.mention
      })
    })
  }
}