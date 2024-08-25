import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'

export default class LangCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'language',
      aliases: ['lang']
    })
  }
  public async run(ctx: CommandContext) {
    if(!['pt', 'en'].some(x => ctx.args[0] === x)) {
      ctx.send('commands.lang.missing_arg', {
        prefix: process.env.PREFIX
      })
      return
    }
    const args = {
      pt: async() => {
        ctx.db.user.get().lang = 'pt'
        await ctx.db.user.get().save()
        ctx.send('Agora eu irei interagir em português com você!')
      },
      en: async() => {
        ctx.db.user.get().lang = 'en'
        await ctx.db.user.get().save()
        ctx.send('Now I will interact in english with you!')
      }
    }
    args[ctx.args[0] as 'pt' | 'en']()
  }
}