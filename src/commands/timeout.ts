import { TextChannel } from "oceanic.js"
import ms from "enhanced-ms"
import translate from "@iamtraction/google-translate"
import createCommand from "../structures/command/createCommand.ts"

export default createCommand({
  name: "timeout",
  aliases: ["t"],
  onlyMod: true,
  async run({ ctx, getMember, client }) {
    await ctx.message.delete()
    const member = getMember(ctx.args[0])
    const time = ctx.args[1]
    let reason = ctx.args.slice(2).join(" ")
    if(!member) {
      await ctx.send("Informe um membro válido")
      return
    }
    if(!time || !ms(time)) {
      await ctx.send("Informe o tempo (`30m`, `1h`, `1d`)")
      return
    }
    if(!reason) {
      await ctx.send("Informe o motivo")
      return
    }
    switch(reason) {
      case "div": reason = "Unauthorized promotion in text or voice channels."
      break
      case "divdm": reason = "Unauthorized promotion via direct message."
      break
      case "toxic": reason = "Disrespectful behavior in text or voice channels."
      break
      case "owo": reason = "1, 2, 3 testing... OwO"
      break
      case "nsfw": reason = "Sharing NSFW content in text or voice channels."
    }
    await member.user.createDM().then(dm => dm.createMessage({
      content: `You have been muted **${ms(ms(time))}** in \`${ctx.guild.name}\` for \`${reason}\``
    }))
    .catch(() => {})
    await member.edit({
      communicationDisabledUntil: new Date(Date.now() + ms(time)).toISOString()
    })
    const t = (await translate(ms(ms(time))!, {
      to: "pt"
    })).text
    await ctx.send(`\`${member.tag}\` (\`${member.id}\`) has been muted for **${t}** for \`${reason}\``)
    const channel = client.getChannel(process.env.MOD_LOG) as TextChannel
    await channel.createMessage({
      content: `\`${member.tag}\` (\`${member.id}\`) has been muted for **${t}** for \`${reason}\``
    })
    .then(msg => {
      msg.startThread({
        name: `Timeout ${member.tag} (${member.id})`
      })
      .then(t => t.createMessage({
        content: `${ctx.message.author.mention}, send the evidence of the punishment here.`
      }))
    })
  }
})