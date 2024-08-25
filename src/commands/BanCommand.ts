import { PrivateChannel, TextChannel } from 'oceanic.js'
import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'

export default class BanCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'ban',
      aliases: ['b']
    })
  }
  public async run(ctx: CommandContext) {
    await ctx.message.delete()
    const user = await this.getUser(ctx.args[0])
    if(!user) {
      ctx.send('commands.ban.missing_user')
      return
    }
    let reason = ctx.args.slice(1).join(' ')
    if(!reason) {
      ctx.send('commands.ban.reason')
      return
    }
    switch(reason) {
      case 'div': reason = ctx.db.user.get().lang === 'en' ? 'Unauthorized publicity on text or voice channels.' : 'Divulgação não autorizada em canais de texto ou voz.'
      break
      case 'divdm': reason = ctx.db.user.get().lang === 'en' ? 'Unauthorized publicity by direct message.' : 'Divulgação não autorizada via mensagem direta.'
      break
      case 'toxic': reason = ctx.db.user.get().lang === 'en' ? 'Disrespect behavior on text or voice channels.' : 'Comportamento desrespeitoso em canais de texto ou voz.'
      break
      case 'owo': reason = 'Just a test... OwO'
      break
      case 'nsfw': reason = ctx.db.user.get().lang === 'en' ? 'Publicity of NSFW content on text or voice channels.' : 'Divulgação de conteúdo NSFW nos canais de texto ou voz.'
    }
    await user.createDM().then(dm => dm.createMessage({
      content: `You have been banned from \`${ctx.guild.name}\` for \`${reason}\``
    }))
    .catch(() => {})
    await ctx.guild.createBan(user.id, {
      reason
    })
    ctx.send('commands.ban.res', {
      user: user.tag,
      id: user.id,
      reason
    })
    const channel = this.client?.getChannel(process.env.MOD_LOG) as TextChannel
    channel.createMessage({
      content: this.locale('commands.ban.res', {
        user: user.tag,
        id: user.id,
        reason
      })
    })
    .then(msg => {
      msg.startThread({
        name: `Ban ${user.tag} (${user.id})`
      })
      .then(t => t.createMessage({
        content: `${ctx.message.author.mention} Send the punishment evidence here.`
      }))
    })
  }
}