import { Constants, TextChannel } from 'oceanic.js'
import { App, Listener } from '../structures'
import { Blacklist } from '../database'

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
  }
}