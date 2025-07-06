import { TextChannel } from "oceanic.js"
import { createCommand } from "../structures/index.js"
import ms from "enhanced-ms"
import translate from "@iamtraction/google-translate"

export default createCommand({
  name: "timeout",
  aliases: ["t"],
  onlyMod: true,
  async run({ ctx, getMember, client }) {
    await ctx.message.delete();
    const member = getMember(ctx.args[0]);
    const time = ctx.args[1];
    let reason = ctx.args.slice(2).join(" ");
    if(!member) {
      ctx.send("Informe um membro válido");
      return;
    }
    if(!time || !ms(time)) {
      ctx.send("Informe o tempo (`30m`, `1h`, `1d`)");
      return;
    }
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
    await member.user.createDM().then(dm => dm.createMessage({
      content: `Você foi silenciado por **${ms(ms(time))}** no \`${ctx.guild.name}\` por \`${reason}\``
    }))
    .catch(() => {});
    await member.edit({
      communicationDisabledUntil: new Date(Date.now() + ms(time)).toISOString()
    });
    const t = (await translate(ms(ms(time) as string), {
      to: "pt"
    })).text;
    ctx.send(`\`${member.tag}\` (\`${member.id}\`) foi silenciado por **${t}** por \`${reason}\``);
    const channel = client.getChannel(process.env.MOD_LOG) as TextChannel;
    channel.createMessage({
      content: `\`${member.tag}\` (\`${member.id}\`) foi silenciado por **${t}** por \`${reason}\``
    })
    .then(msg => {
      msg.startThread({
        name: `Timeout ${member.tag} (${member.id})`
      })
      .then(t => t.createMessage({
        content: `${ctx.message.author.mention}, envie as provas da punição aqui.`
      }));
    });
  }
});