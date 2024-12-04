import { TextChannel } from "oceanic.js"
import { createCommand } from "../structures"

export default createCommand({
  name: "ban",
  aliases: ["b"],
  onlyMod: true,
  async run({ ctx, getUser, client }) {
    await ctx.message.delete();
    const user = await getUser(ctx.args[0]);
    if(!user) {
      ctx.send("Informe um usuário válido");
      return;
    }
    let reason = ctx.args.slice(1).join(" ");
    if(!reason) {
      ctx.send("Informe o motivo");
      return;
    }
    switch(reason) {
      case "div": reason = "Divulgação não autorizada em canais de texto ou voz."
      break
      case "divdm": reason = "Divulgação não autorizada via mensagem direta."
      break
      case "toxic": reason = "Comportamento desrespeitoso em canais de texto ou voz."
      break
      case "owo": reason = "1, 2, 3 testando... OwO"
      break
      case "nsfw": reason = "Compartilhamento de conteúdo NSFW nos canais de texto ou voz."
    }
    await user.createDM().then(dm => dm.createMessage({
      content: `Você foi banido do \`${ctx.guild.name}\` por \`${reason}\``
    }))
    .catch(() => {});
    await ctx.guild.createBan(user.id, {
      reason
    });
    ctx.send(`\`${user.tag}\` (\`${user.id}\`) foi banido do servidor por \`${reason}\``);
    const channel = client.getChannel(process.env.MOD_LOG) as TextChannel;
    channel.createMessage({
      content: `\`${user.tag}\` (\`${user.id}\`) foi banido do servidor por \`${reason}\``
    })
    .then(msg => {
      msg.startThread({
        name: `Ban ${user.tag} (${user.id})`
      })
      .then(t => t.createMessage({
        content: `${ctx.message.author.mention}, envie as provas da punição aqui.`
      }));
    });
  }
});