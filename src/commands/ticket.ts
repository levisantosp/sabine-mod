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
        content: "## Central de antedimento\nNessa área, você pode tirar suas dúvidas e resolver problemas com o bot entrando em contato com a equipe da Sabine."
      });
    }
    else {
      const button = new ButtonBuilder()
      .setStyle("blue")
      .setLabel("Criar ticket")
      .setEmoji("🤝")
      .setCustomId("ticket");
      message.edit(button.build("## Central de antedimento\nNessa área, você pode tirar suas dúvidas e resolver problemas com o bot entrando em contato com a equipe da Sabine através de um ticket de suporte totalmente privado."));
    }
  }
});