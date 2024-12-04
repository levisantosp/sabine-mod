import { TextChannel } from "oceanic.js"
import { createCommand } from "../structures"

export default createCommand({
  name: "unban",
  aliases: ["unb"],
  onlyMod: true,
  async run({ ctx, getUser, client }) {
    await ctx.message.delete();
    const user = await getUser(ctx.args[0]);
    if(!user) {
      ctx.send("Informe um usuário válido");
      return;
    }
    await ctx.guild.removeBan(user.id);
    ctx.send(`\`${user.tag}\` (\`${user.id}\`) foi desbanido do servidor por ${ctx.message.author.mention}`);
    const channel = client?.getChannel(process.env.MOD_LOG) as TextChannel;
    channel.createMessage({
      content: `\`${user.tag}\` (\`${user.id}\`) foi desbanido do servidor por ${ctx.message.author.mention}`
    });
  }
});