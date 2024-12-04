import { CategoryChannel, ComponentInteraction, Constants, ModalSubmitInteraction, PrivateThreadChannel, TextChannel } from "oceanic.js"
import { createListener } from "../structures"
import { Guild, GuildSchemaInterface, Key, KeySchemaInterface } from "../database"

export default createListener({
  name: "interactionCreate",
  async run(client, interaction) {
    if(interaction instanceof ComponentInteraction) {
      if(!interaction.guild || !interaction.guildID || !interaction.member || !interaction.channel) return;
      const args = interaction.data.customID.split(";");
      if(interaction.data.customID === "ticket") {
        await interaction.defer(64);
        const category = interaction.guild.channels.get("1277285123070361673") as CategoryChannel;
        if(category.channels.some(ch => ch.name.includes(interaction.user.id))) {
          interaction.createFollowup({ content: "Você já tem um ticket criado. Espere um moderador deletar ou delete você mesmo." });
          return;
        }
        const channel = await interaction.guild.createChannel(
          Constants.ChannelTypes.GUILD_TEXT,
          {
            name: `ticket_${interaction.user.id}`,
            parentID: interaction.guild.channels.get(interaction.channelID)?.parentID,
            permissionOverwrites: [
              {
                id: interaction.guildID,
                deny: BigInt(1024),
                type: 0
              },
              {
                id: "1237457762502574130",
                allow: BigInt(52224),
                type: 0
              },
              {
                id: interaction.member.id,
                allow: BigInt(52224),
                type: 1
              }
            ]
          }
        );
        const msg = await channel.createMessage({
          content: `${interaction.user.mention} Ticket criado com sucesso! Alguém virá falar com você em breve.\n- Enquanto ninguém aparece, fala com o que você precisa de ajuda\n- Não mencione ninguém, apenas aguarde.`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: "Fechar ticket",
                  style: Constants.ButtonStyles.DANGER,
                  customID: "close-ticket",
                  emoji: {
                    name: "🔒"
                  }
                }
              ]
            }
          ]
        });
        await interaction.createFollowup({ content: `Ticket criado com sucesso!\n${msg.jumpLink}` });
      }
      else if(interaction.data.customID === "close-ticket") {
        await interaction.deferUpdate(64);
        await (interaction.channel as TextChannel).createMessage({ content: `Fechando ticket <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` });
        setTimeout(() => {
          interaction.channel!.delete();
        }, 10000)
      }
      else if(args[0] === "key") {
        await interaction.createModal({
          customID: `active-key;${args[1]}`,
          title: "Insira a chave que deseja ativar",
          components: [
            {
              type: 1,
              components: [
                {
                  type: 4,
                  customID: "response-modal",
                  label: "CHAVE DE ATIVAÇÃO",
                  style: 1,
                  minLength: 19,
                  maxLength: 19,
                  required: true,
                  placeholder: "ABCD-1234-AB12-abcdf"
                },
              ]
            }
          ]
        });
      }
    }
    else if(interaction instanceof ModalSubmitInteraction) {
      const args = interaction.data.customID.split(";");
      const value = interaction.data.components.getComponents()[0].value;
      if(!interaction.channel || interaction.channel.type !== 12) return;
      const guild = (await Guild.findById(args[1]) ?? new Guild({ _id: args[1] })) as GuildSchemaInterface;
      const key = (await Key.findById(value)) as KeySchemaInterface;
      if(!key) {
        await interaction.createMessage({ content: `Chave inexistente!\nFechando o tópico <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` });
        setTimeout(async() => {
          await (interaction.channel as PrivateThreadChannel).delete();
        }, 10000);
        return;
      }
      if(key.active) {
        await interaction.createMessage({ content: `Essa chave já foi ativada em outro servidor!\nFechando o tópico <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` });
        setTimeout(async() => {
          await (interaction.channel as PrivateThreadChannel).delete();
        }, 10000);
        return;
      }
      key.activeIn.push(args[1]);
      key.active = true;
      guild.key = value;
      await guild.save();
      await key.save();
      interaction.createMessage({ content: `Chave ativada com sucesso!\nFechando o tópico <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` });
      setTimeout(async() => {
        await (interaction.channel as PrivateThreadChannel).delete();
      }, 10000);
    }
  }
});