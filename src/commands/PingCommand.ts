import { App } from '../structures'
import Command from '../structures/command/Command'
import CommandContext from '../structures/command/CommandContext'

export default class PingCommand extends Command {
  public constructor(client: App) {
    super({
      client,
      name: 'ping'
    })
  }
  public async run(ctx: CommandContext) {
    ctx.send(`Pong! \`${ctx.guild.shard.latency}ms\``)
  }
}