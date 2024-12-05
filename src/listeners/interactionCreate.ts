import { CategoryChannel, ComponentInteraction, Constants, ModalSubmitInteraction, PrivateThreadChannel, TextChannel, User } from "oceanic.js"
import { ButtonBuilder, createListener, EmbedBuilder } from "../structures"
import { Guild, GuildSchemaInterface, Key, KeySchemaInterface } from "../database"
import transcript from "oceanic-transcripts"
import MercadoPago, { Preference } from "mercadopago"
const mpClient = new MercadoPago({ accessToken: process.env.MP_TOKEN });

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
          interaction.createFollowup({ content: "Você já tem um ticket criado. Espere até que um moderador delete o ticket." });
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
          content: `${interaction.user.mention} Ticket criado com sucesso! Alguém virá falar com você em breve.\n- Enquanto ninguém aparece, fale com o que você precisa de ajuda.\n- Não mencione ninguém, apenas aguarde.`,
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
        if(!["1237458600046104617", "1237458505196114052", "1237457762502574130"].some(r => interaction.member!.roles.includes(r))) return;
        await interaction.deferUpdate(64);
        await (interaction.channel as TextChannel).createMessage({ content: `Fechando ticket <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` });
        const attach = await transcript.createTranscript(interaction.channel as TextChannel, {
          poweredBy: false,
          saveImages: true,
          hydrate: true,
          filename: `transcript-${(interaction.channel as TextChannel).name.replace("ticket_", "")}.html`
        });
        setTimeout(async() => {
          await interaction.channel!.delete();
          client.rest.channels.createMessage("1313845851998781562", {
            content: `Ticket requisitado por: <@${(interaction.channel as TextChannel).name.replace("ticket_", "")}>`,
            allowedMentions: {
              users: false
            },
            files: [attach]
          })
        }, 10000);
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
      else if(args[0] === "premium" && interaction) {
        if(!interaction.guild || !interaction.guildID || !interaction.channel || !interaction.member) return;
        switch((interaction as ComponentInteraction<Constants.SelectMenuTypes>).data.values.raw[0]) {
          case "premium_booster": {
            if(interaction.member.premiumSince) {
              interaction.createMessage({
                content: `Você já é um Premium Booster!\nCaso queira gerar e/ou ativar sua chave, siga o passo a passo:\n- Usar o comando \`${process.env.PREFIX}gerarchave\` em https://canary.discord.com/channels/1233965003850125433/1313588710637568030\n- Usar \`${process.env.PREFIX}ativarchave <servidor>\` no mesmo canal\n - Seguir o passo a passo no tópico que será criado`,
                flags: 64
              });
              break;
            }
            interaction.createMessage({
              content: `Para conseguir o Premium Booster, você precisa seguir os seguintes passos:\n- Impulsionar o servidor\n- Usar o comando \`${process.env.PREFIX}gerarchave\` em https://canary.discord.com/channels/1233965003850125433/1313588710637568030 (o canal só libera depois que você impulsiona o servidor)\n- Usar \`${process.env.PREFIX}ativarchave <servidor>\` no mesmo canal\n - Seguir o passo a passo no tópico que será criado`,
              flags: 64
            });
          }
          break;
          case "premium_lite": {
            interaction.createMessage({
              content: "<a:carregando:809221866434199634> Preparando o ambiente para a sua compra...",
              flags: 64
            });
            const thread = await (interaction.channel as TextChannel)
            .startThreadWithoutMessage({
              name: "PREMIUM_LITE_" + interaction.user.id,
              type: 12,
              invitable: false
            });
            const preference = new Preference(mpClient);
            const res = await preference.create(
              {
                body: {
                  items: [
                    {
                      title: "PREMIUM LITE - SABINE PAYMENTS",
                      quantity: 1,
                      currency_id: "BRL",
                      unit_price: 2.99,
                      id: "PREMIUM_LITE"
                    }
                  ],
                  notification_url: process.env.WEBHOOK_URL,
                  external_reference: `${thread.id};${interaction.user.id};PREMIUM_LITE`,
                  date_of_expiration: new Date(Date.now() + 600000).toISOString()
                }
              }
            );
            if(!res.init_point) {
              thread.createMessage({ content: `Não foi possível gerar o link de pagamento e a sua compra não pôde ser concluída.\nO tópico será excluído <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` });
              setTimeout(() => thread.delete(), 10000);
              return;
            }
            await thread.addMember(interaction.user.id);
            const embed = new EmbedBuilder()
            .setTitle("Plano Premium Lite")
            .setDesc(`Clique no botão abaixo para ser redirecionado para a página de pagamento do Mercado Pago <:mercadopago:1313901326744293427>\nRealize o pagamento <t:${((Date.now() + 600000) / 1000).toFixed(0)}:R>, caso contrário, o link expirará.`);
            const button = new ButtonBuilder()
            .setStyle("link")
            .setLabel("Link de pagamento")
            .setURL(res.init_point)
            await thread.createMessage(embed.build({
              components: [
                {
                  type: 1,
                  components: [button]
                }
              ]
            }));
            await interaction.editOriginal({ content: `Ambiente criado! Continue com a compra em ${thread.mention}` });
          }
          break;
          case "premium_pro": {

          }
          break;
          case "premium_ultimate": {

          }
        }
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