import { TextChannel } from 'oceanic.js'
import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'
import ms from 'enhanced-ms'
import translate from '@iamtraction/google-translate'

export default class TimeoutCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'timeout',
      aliases: ['t']
    })
  }
  public async run(ctx: CommandContext) {
    await ctx.message.delete()
    const member = this.getMember(ctx.args[0])
    const time = ctx.args[1]
    let reason = ctx.args.slice(2).join(' ')
    if(!member) {
      ctx.send('commands.ban.missing_user')
      return
    }
    if(!time || !ms(time)) {
      ctx.send('commands.timeout.time')
      return
    }
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
    await member.user.createDM().then(dm => dm.createMessage({
      content: `You have been timed out for ${ms(ms(time))} in \`${ctx.guild.name}\` for \`${reason}\``
    }))
    .catch(() => {})
    await member.edit({
      communicationDisabledUntil: new Date(Date.now() + ms(time)).toISOString()
    })
    const t = ctx.db.user.get().lang == 'en' ? ms(ms(time)) as string : (await translate(ms(ms(time) as string), {
      to: 'pt'
    })).text
    ctx.send('commands.timeout.res', {
      user: member.tag,
      id: member.id,
      reason,
      time: t
    })
    const channel = this.client?.getChannel(process.env.MOD_LOG) as TextChannel
    channel.createMessage({
      content: this.locale('commands.timeout.res', {
        user: member.tag,
        id: member.id,
        reason,
        time: t
      })
    })
    .then(msg => {
      msg.startThread({
        name: `Timeout ${member.tag} (${member.id})`
      })
      .then(t => t.createMessage({
        content: `${ctx.message.author.mention} Send the punishment evidence here.`
      }))
    })
  }
}