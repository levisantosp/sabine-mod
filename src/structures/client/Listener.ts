import { ClientEvents } from 'oceanic.js'
import App from './App'

type ListenerOptions = {
  name: keyof ClientEvents
  client: App
}
export default class Listener {
  public name: keyof ClientEvents
  public client: App
  public constructor(options: ListenerOptions) {
    this.name = options.name
    this.client = options.client
  }
}