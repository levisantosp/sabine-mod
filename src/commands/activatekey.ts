import { Guild } from "oceanic.js"
import { Key, KeySchemaInterface } from "../database"
import { ButtonBuilder, createCommand } from "../structures"

export default createCommand({
  name: "activatekey",
  onlyBoosterAndPremium: true,
  async run({ ctx }) {
    if(ctx.message.channel.id !== "1313588710637568030") return;
    if(!ctx.args[0]) {
      ctx.send("Enter a server ID");
      return;
    }
    const keys = (await Key.find(
      {
        user: ctx.message.author.id
      }
    )) as KeySchemaInterface[];
    if(!keys.length) {
      ctx.send("You do not have a key to activate");
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
      ctx.send("The action could not be completed. Please try again later.");
      return;
    }
    const guilds = await res.json() as Guild[];
    const guild = guilds.find(guild => guild.id === ctx.args[0]);
    if(!guild) {
      ctx.send("Invalid server.");
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
    .setLabel("Activate")
    .setStyle("red")
    .setCustomId(`key;${ctx.args[0]}`);
    thread.createMessage(button.build(`You are about to activate a key in \`${guild.name}\`. Would you like to continue?`));
  }
});