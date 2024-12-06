import { Guild } from "oceanic.js"
import { Key, KeySchemaInterface } from "../database"
import { ButtonBuilder, createCommand } from "../structures"

export default createCommand({
  name: "ativarchave",
  onlyBoosterAndPremium: true,
  async run({ ctx }) {
    if(ctx.message.channel.id !== "1313588710637568030") return;
    if(!ctx.args[0]) {
      ctx.send("Informe o ID de um servidor");
      return;
    }
    const keys = (await Key.find(
      {
        user: ctx.message.author.id
      }
    )) as KeySchemaInterface[];
    if(!keys.length) {
      ctx.send("Você não possui nenhuma chave para ativar");
      return;
    }
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      method: "GET",
      headers: {
        Authorization: "Bot " + process.env.SABINE_TOKEN,
        "Content-Type": "application/json"
      }
    });
    if(!res.ok) {
      ctx.send("Não foi possível completar a ação. Tente novamente mais tarde.");
      return;
    }
    const guilds = await res.json() as Guild[];
    const guild = guilds.find(guild => guild.id === ctx.args[0]);
    if(!guild) {
      ctx.send("Servidor inválido.");
      return;
    }
    await ctx.message.createReaction("success:1300882212190945292");
    const thread = await ctx.message.channel.startThreadWithoutMessage({
      name: `ACTIVE_KEY_${ctx.message.author.id}`,
      type: 12,
      invitable: false
    });
    await thread.addMember(ctx.message.author.id);
    const button = new ButtonBuilder()
    .setLabel("Ativar")
    .setStyle("red")
    .setCustomId(`key;${ctx.args[0]}`);
    thread.createMessage(button.build(`Você está prestes a ativar uma chave em \`${guild.name}\`. Deseja prosseguir?`));
  }
});