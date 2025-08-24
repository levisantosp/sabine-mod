import { Member, User } from "oceanic.js"
import App from "../client/App.ts"
import CommandContext from "./CommandContext.ts"

type CommandOptions = {
  ctx: CommandContext
  client: App
  getMember: (member: string) => Member | undefined
  getUser: (user: string) => Promise<User | undefined>
}
type CreateComponentInteractionOptions = {
  ctx: CommandContext
  client: App
}
export type Command = {
  name: string
  aliases?: string[]
  client?: App
  onlyDev?: boolean
  onlyMod?: boolean
  onlyBooster?: boolean
  onlyPremium?: boolean
  onlyBoosterAndPremium?: boolean
  run: (options: CommandOptions) => Promise<any>
  createInteraction?: (options: CreateComponentInteractionOptions) => Promise<any>
}
export default function(
  command: Command
): Command {
  return command
}