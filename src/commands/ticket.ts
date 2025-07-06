import { TextChannel } from "oceanic.js"
import { ButtonBuilder, createCommand } from "../structures"

export default createCommand({
  name: "ticket",
  onlyDev: true,
  async run({ ctx, client }) {
    await ctx.message.delete();
    const channel = client.getChannel("1277285687074357313") as TextChannel;
    const messages = await channel.getMessages();
    const message = messages.filter(m => m.author.id === client.user.id)[0];
    if(!message) {
      channel.createMessage({
        content: "## Customer Support Center\nIn this area, you can ask questions and solve issues with the bot by contacting the Sabine team."
      });
    }
    else {
      const button = new ButtonBuilder()
      .setStyle("blue")
      .setLabel("Criar ticket")
      .setEmoji("🤝")
      .setCustomId("ticket");
      message.edit(button.build("## Customer Support Center\nIn this area, you can ask questions and solve issues with the bot by contacting the Sabine team."));
    }
  }
});