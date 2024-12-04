import { createCommand } from "../structures"

export default createCommand({
  name: "ping",
  async run({ ctx }) {
    ctx.send(`Pong! \`${ctx.guild.shard.latency}ms\``);
  }
});