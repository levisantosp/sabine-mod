import { Client, ClientOptions } from 'oceanic.js'
import mongoose from 'mongoose'
import { readdirSync } from 'fs'
import path from 'path'
import Command from '../command/Command'

export default class App extends Client {
  public commands: Map<string, Command> = new Map()
  public aliases: Map<string, string> = new Map()
  public constructor(options?: ClientOptions) {
    super(options)
  }
  public async start() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Database connected')
    for(const listen of readdirSync(path.join(__dirname, '../../listeners'))) {
      const Listener = await import(`../../listeners/${listen}`)
      const listener = Listener.default.default ? new Listener.default.default(this) : new Listener.default(this)
      if(listener.name === 'ready') this.once(listener.name, (...args) => listener.run(...args).catch((e: Error) => console.error(e)))
      else this.on(listener.name, (...args) => listener.run(...args).catch((e: Error) => console.error(e)))
    }
    for(const cmd of readdirSync(path.join(__dirname, '../../commands'))) {
      const Command = await import(`../../commands/${cmd}`)
      const command = Command.default.default ? new Command.default.default(this) : new Command.default(this)
      this.commands.set(command.name, command)
      if(command.aliases) {
        command.aliases.forEach((alias: string) => {
          this.aliases.set(alias, command.name)
        })
      }
    }
    await this.connect()
  }
}