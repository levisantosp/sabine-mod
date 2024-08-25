import { CategoryChannel, ComponentInteraction, Constants, TextChannel } from 'oceanic.js'
import { App, Listener } from '../structures'

export default class InteractionCreateListener extends Listener {
  public constructor(client: App) {
    super({
      client,
      name: 'interactionCreate'
    })
  }
  public async run(interaction: ComponentInteraction) {
    if(interaction instanceof ComponentInteraction) {
      if(interaction.data.customID === 'ticket-pt') {
        await interaction.defer(64)
        const category = interaction.guild!.channels.get('1277285123070361673') as CategoryChannel
        if(category.channels.some(ch => ch.name.includes(interaction.user.id))) return interaction.createFollowup({ content: 'Você já tem um ticket criado. Espere um moderador deletar ou delete você mesmo.' })
        const channel = await interaction.guild!.createChannel(
          Constants.ChannelTypes.GUILD_TEXT,
          {
            name: `ticket_${interaction.user.id}`,
            parentID: interaction.guild!.channels.get(interaction.channelID)?.parentID,
            permissionOverwrites: [
              {
                id: interaction.guildID!,
                deny: BigInt(1024),
                type: 0
              },
              {
                id: '1237457762502574130',
                allow: BigInt(52224),
                type: 0
              },
              {
                id: interaction.member!.id,
                allow: BigInt(52224),
                type: 1
              }
            ]
          }
        )
        const msg = await channel.createMessage({
          content: `${interaction.user.mention} Ticket criado com sucesso! Alguém virá falar com você em breve.\nNão mencione ninguém, apenas aguarde.`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Fechar ticket',
                  style: Constants.ButtonStyles.DANGER,
                  customID: 'close-ticket',
                  emoji: {
                    name: '🔒'
                  }
                }
              ]
            }
          ]
        })
        await interaction.createFollowup({ content: `Ticket criado com sucesso!\n${msg.jumpLink}` })
      }
      else if(interaction.data.customID === 'ticket-en') {
        await interaction.defer(64)
        const category = interaction.guild!.channels.get('1277285123070361673') as CategoryChannel
        if(category.channels.some(ch => ch.name.includes(interaction.user.id))) return interaction.createFollowup({ content: 'You already have a ticket created. Wait for a moderator to delete it or do it yourself.' })
        const channel = await interaction.guild!.createChannel(
          Constants.ChannelTypes.GUILD_TEXT,
          {
            name: `ticket_${interaction.user.id}`,
            parentID: interaction.guild!.channels.get(interaction.channelID)?.parentID,
            permissionOverwrites: [
              {
                id: interaction.guildID!,
                deny: BigInt(1024),
                type: 0
              },
              {
                id: '1237457762502574130',
                allow: BigInt(52224),
                type: 0
              },
              {
                id: interaction.member!.id,
                allow: BigInt(52224),
                type: 1
              }
            ]
          }
        )
        const msg = await channel.createMessage({
          content: `${interaction.user.mention} Ticket created successfully! Someone will come to talk to you soon.\nDon't mention anyone, just wait.`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'Close ticket',
                  style: Constants.ButtonStyles.DANGER,
                  customID: 'close-ticket',
                  emoji: {
                    name: '🔒'
                  }
                }
              ]
            }
          ]
        })
        await interaction.createFollowup({ content: `Ticket created sucessfully!\n${msg.jumpLink}` })
      }
      else if(interaction.data.customID === 'close-ticket') {
        await interaction.deferUpdate(64)
        await (interaction.channel as TextChannel).createMessage({ content: `Closing ticket <t:${((Date.now() + 10000) / 1000).toFixed(0)}:R>` })
        setTimeout(() => {
          (interaction.channel as TextChannel).delete()
        }, 10000)
      }
    }
  }
}