import { Blacklist, BlacklistSchemaInterface, Guild, User } from '../database'
import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'
import ms from 'enhanced-ms'

export default class BlacklistCommand extends Command {
  public constructor(client: App) {
    super({
      name: 'blacklist',
      onlyDev: true
    })
  }
  public async run(ctx: CommandContext) {
    let reason = ctx.args.slice(3).join(' ')
    let time = ms(ctx.args[3] ?? 'asd')
    if(time) reason = ctx.args.slice(4).join(' ')
    const blacklist = await Blacklist.findById('blacklist') as BlacklistSchemaInterface
    if(ctx.args[0] === 'add') {
      const args = {
        user: async() => {
          if(!ctx.args[2]) return ctx.send('Missing argument `[id]`')
          const user = await User.findById(ctx.args[2])
          if(blacklist.users.find(user => user.id === ctx.args[2])) return ctx.send('This user is already banned.')
          if(!reason) return ctx.send('Missing argument `[reason]`.')
          await user?.deleteOne()
          const u = await this.getUser(ctx.args[2])
          blacklist.users.push(
            {
              id: u!.id,
              reason,
              endsAt: time ? Number(((Date.now() + time) / 1000).toFixed(0)) : Infinity,
              when: Number((Date.now() / 1000).toFixed(0))
            }
          )
          await blacklist.save()
          ctx.send(`\`${u?.tag}\` (\`${u?.id}\`) has been banned from the bot ${time ? 'for ' + ms(time) : 'forever'} for \`${reason}\``)
        },
        guild: async() => {
          if(!ctx.args[2]) return ctx.send('Missing argument `[id]`')
          const guild = await Guild.findById(ctx.args[2])
          if(blacklist.guilds.find(guild => guild.id === ctx.args[2])) return ctx.send('This guild is already banned.')
          if(!reason) return ctx.send('Missing argument `[reason]`.')
          await guild?.deleteOne()
          const g = this.client?.guilds.get(guild?.id)
          blacklist.guilds.push(
            {
              name: g?.name,
              id: ctx.args[2],
              reason,
              endsAt: time ? Number(((Date.now() + time) / 1000).toFixed(0)) : Infinity,
              when: Number((Date.now() / 1000).toFixed(0))
            }
          )
          await blacklist.save()
          ctx.send(`\`${g?.name}\` (\`${ctx.args[2]}\`) has been banned from the bot ${time ? 'for ' + ms(time) : 'forever'} for \`${reason}\``)
        }
      }
      if(!Object.keys(args).some(key => key === ctx.args[1])) {
        ctx.send('Missing argument `user` or `guild`.')
        return
      }
      args[ctx.args[1] as 'user' | 'guild']()
    }
    else if(ctx.args[0] === 'remove') {
      const args = {
        user: async() => {
          if(!ctx.args[2]) return ctx.send('Missing argument `[id]`')
          if(!blacklist.users.find(user => user.id === ctx.args[2])) return ctx.send('This user is not banned.')
          const u = await this.getUser(ctx.args[2])
          let index = blacklist.users.findIndex(user => user.id === ctx.args[2])
          blacklist.users.splice(index, 1)
          await blacklist.save()
          ctx.send(`\`${u?.tag}\` (\`${u?.id}\`) has been unbanned from the bot.`)
        },
        guild: async() => {
          if(!ctx.args[2]) return ctx.send('Missing argument `[id]`')
          if(!blacklist.guilds.find(guild => guild.id === ctx.args[2])) return ctx.send('This guild is not banned.')
          let index = blacklist.guilds.findIndex(guild => guild.id === ctx.args[2])
          blacklist.guilds.splice(index, 1)
          await blacklist.save()
          ctx.send(`\`${ctx.args[2]}\` has been unbanned from the bot.`)
        }
      }
      if(!Object.keys(args).some(key => key === ctx.args[1])) {
        ctx.send('Missing argument `user` or `guild`.')
        return
      }
      args[ctx.args[1] as 'user' | 'guild']()
    }
    else ctx.send(`Missing arguments! Try \`${process.env.PREFIX}blacklist add/remove user/guild [id] [reason]\``)
  }
}