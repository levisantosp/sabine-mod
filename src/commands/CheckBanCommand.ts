import { Blacklist, BlacklistSchemaInterface } from '../database'
import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'

export default class CheckBanCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'checkban'
    })
  }
  public async run(ctx: CommandContext) {
    const args = {
      user: async() => {
        const u = await this.getUser(ctx.args[1])
        if(!u) return ctx.send('Enter a valid user ID.')
        const blacklist = await Blacklist.findById('blacklist') as BlacklistSchemaInterface
        const ban = blacklist.users.find(user => user.id === u.id)
        if(!ban) return ctx.send(`\`${u.tag}\` is not banned from the bot.`)
        ctx.send(`\`${u.tag}\` is banned from the bot.\n**Reason:** \`${ban.reason}\`\n**Date:** <t:${ban.when}:f> | <t:${ban.when}:R>\n**Ends at:** ${ban.endsAt === Infinity ? 'Never' : `<t:${ban.endsAt}:F> | <t:${ban.endsAt}:R>`}`)
      },
      guild: async() => {
        if(!ctx.args[1]) return ctx.send('Enter a valid guild ID.')
        const blacklist = await Blacklist.findById('blacklist') as BlacklistSchemaInterface
        const ban = blacklist.guilds.find(guild => guild.id === ctx.args[1])
        if(!ban) return ctx.send(`\`${ctx.args[1]}\` is not banned from the bot.`)
        ctx.send(`\`${ban.name}\` is banned from the bot.\n**Reason:** \`${ban.reason}\`\n**Date:** <t:${ban.when}:f> | <t:${ban.when}:R>\n**Ends at:** ${ban.endsAt === Infinity ? 'Never' : `<t:${ban.endsAt}:F> | <t:${ban.endsAt}:R>`}`)
      }
    }
    if(!ctx.args[0] || !Object.keys(args).some(key => key === ctx.args[0])) {
      ctx.send(`Missing arguments! Try \`${process.env.PREFIX}checkban user [id]\` or \`${process.env.PREFIX}checkban guild [id]\``)
      return
    }
    args[ctx.args[0] as 'user' | 'guild']()
  }
}