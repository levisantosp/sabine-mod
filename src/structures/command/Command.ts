import { Constants, Member, User } from 'oceanic.js'
import { Args } from '../../locales'
import CommandContext from './CommandContext'
import App from '../client/App'

type CommandOptions = {
  name: string
  aliases?: string[]
  onlyDev?: boolean
  client?: App
}
export default class Command {
  public name: string
  public aliases?: string[]
  public onlyDev?: boolean
  public client?: App
  public locale!: (content: string, args?: Args) => string
  public getUser!: (user: string) => Promise<User | undefined>
  public getMember!: (member: string) => Member | undefined
  public constructor(options: CommandOptions) {
    this.name = options.name
    this.aliases = options.aliases
    this.onlyDev = options.onlyDev
    this.client = options.client
  }
  async run(ctx: CommandContext) {}
}