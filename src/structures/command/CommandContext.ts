import { CommandInteraction, ComponentInteraction, EditInteractionContent, File, Guild, InitialInteractionContent, Message, ModalSubmitInteraction, TextChannel } from "oceanic.js"
import App from "../client/App"
import { GuildSchemaInterface, UserSchemaInterface } from "../../database"

type Database = {
  user: {
    get: () => UserSchemaInterface;
    getById: (id: string) => Promise<UserSchemaInterface>;
  },
  guild: {
    get: () => GuildSchemaInterface;
    getById: (id: string) => Promise<GuildSchemaInterface>;
  }
}
type CommandContextOptions = {
  client: App;
  guild: Guild;
  message: Message<TextChannel>;
  db: Database;
  args: string[];
}
export default class CommandContext {
  public client: App;
  public guild: Guild;
  public message: Message<TextChannel>;
  public db: Database;
  public args: string[];
  public constructor(options: CommandContextOptions) {
    this.client = options.client;
    this.guild = options.guild;
    this.message = options.message;
    this.db = options.db;
    this.args = options.args;
  }
  public async send(content: string | InitialInteractionContent, files?: File[]) {
    switch(typeof content) {
      case "string": {
        if(files) {
          return this.message.channel.createMessage(
            {
              content,
              files
            }
          );
        }
        else {
          return this.message.channel.createMessage(
            {
              content: content
            }
          );
        }
      }
      case "object": {
        if(files) {
          return this.message.channel.createMessage(Object.assign(content, { files }));
        }
        else {
          return this.message.channel.createMessage(content);
        }
      }
    }
  }
}