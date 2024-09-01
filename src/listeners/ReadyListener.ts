import { Constants, TextChannel } from 'oceanic.js'
import { App, Listener } from '../structures'
import { Blacklist, BlacklistSchemaInterface } from '../database'
import ms from 'enhanced-ms'

export default class ReadyListener extends Listener {
  public constructor(client: App) {
    super({
      client,
      name: 'ready'
    })
  }
  public async run() {
    console.log(`${this.client.user.tag} online!`)
    this.client.application.bulkEditGlobalCommands([])
    if(!(await Blacklist.findById('blacklist'))) {
      new Blacklist({ _id: 'blacklist' }).save()
    }
    // const channel = this.client.getChannel('1277285687074357313') as TextChannel
    // channel.createMessage({
    //   content: '🇧🇷 Para criar um ticket em português, clique no botão `Criar ticket em português`\n\n🇺🇸 To create a ticket in english, click in the button `Create a ticket in english`',
    //   components: [
    //     {
    //       type: 1,
    //       components: [
    //         {
    //           type: 2,
    //           style: Constants.ButtonStyles.PRIMARY,
    //           label: 'Criar ticket em português',
    //           customID: 'ticket-pt',
    //           emoji: {
    //             name: '🇧🇷'
    //           }
    //         },
    //         {
    //           type: 2,
    //           style: Constants.ButtonStyles.PRIMARY,
    //           label: 'Create a ticket in english',
    //           customID: 'ticket-en',
    //           emoji: {
    //             name: '🇺🇸'
    //           }
    //         }
    //       ]
    //     }
    //   ]
    // })
    const removeUserFromBlacklist = async() => {
      const blacklist = await Blacklist.findById('blacklist') as BlacklistSchemaInterface
      for(const user of blacklist.users.filter(user => user.endsAt !== Infinity)) {
        if((user.endsAt * 1000) < ms(ms(Date.now())!)) {
          let index = blacklist.users.findIndex(u => u.id === user.id)
          blacklist.users.splice(index, 1)
          await blacklist.save()
          const channel = this.client.getChannel('1237496064580386917') as TextChannel
          channel.createMessage({ content: `[Auto] - \`${(await this.client.rest.users.get(user.id)).tag}\` (\`${user.id}\`) has been unbanned from the bot.` })
        }
      }
    }
    const removeGuildFromBlacklist = async() => {
      const blacklist = await Blacklist.findById('blacklist') as BlacklistSchemaInterface
      for(const guild of blacklist.guilds) {
        if((guild.endsAt * 1000) < ms(ms(Date.now())!)) {
          let index = blacklist.guilds.findIndex(g => g.id === guild.id)
          blacklist.guilds.splice(index, 1)
          await blacklist.save()
          const channel = this.client.getChannel('1237496064580386917') as TextChannel
          channel.createMessage({ content: `[Auto] - \`${guild.id}\` has been unbanned from the bot.` })
        }
      }
    }
    setInterval(async() => {
      await removeUserFromBlacklist()
      await removeGuildFromBlacklist()
    }, 15000)
  }
}