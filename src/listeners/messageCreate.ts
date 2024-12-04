import { Constants, Message, TextChannel } from "oceanic.js"
import { CommandContext, createListener } from "../structures"
import { Guild, GuildSchemaInterface, User, UserSchemaInterface } from "../database"

export default createListener({
  name: "messageCreate",
  async run(client, message) {
    if(message.author.bot) return;
    if(message.channel?.type !== Constants.ChannelTypes.GUILD_TEXT) return;
    if(!message.guild) return;
    if(!message.member) return;
    if(!message.content.toLowerCase().startsWith(process.env.PREFIX)) return;
    let messageArray = message.content.split(" ");
    let command = messageArray.shift()!.toLowerCase();
    let args = messageArray.slice(0);
    let cmd = client.commands.get(command.slice(process.env.PREFIX.length)) || client.commands.get(client.aliases.get(command.slice(process.env.PREFIX.length))!);
    if(!cmd) return;
    if(cmd.onlyDev && message.author.id !== "441932495693414410") return;
    if(cmd.onlyMod && !["1237458600046104617", "1237458505196114052", "1237457762502574130"].some(r => message.member?.roles.includes(r))) return;
    if(cmd.onlyBooster && !message.member.premiumSince) return;
    const user = (await User.findById(message.author.id) ?? new User({ _id: message.author.id })) as UserSchemaInterface;
    const guild = await Guild.findById(message.guild.id) as GuildSchemaInterface;
    const ctx = new CommandContext({
      db: {
        user: {
          get() {
            return user;
          },
          async getById(id: string) {
            return await User.findById(id) as unknown as Promise<UserSchemaInterface>
          }
        },
        guild: {
          get() {
            return guild;
          },
          async getById(id: string) {
            return await Guild.findById(id) as unknown as Promise<GuildSchemaInterface>
          }
        }
      },
      guild: message.guild,
      message: message as Message<TextChannel>,
      client,
      args
    });
    const getUser = async(user: string) => {
      try {
        return await client.rest.users.get(user.replace(/[<@!>]/g, ""));
      }
      catch(e) {
        console.error(e);
      }
    }
    const getMember = (member: string) => {
      return ctx.guild.members.get(member.replace(/[<@!>]/g, ""));
    }
    cmd.run({ ctx, getMember, getUser, client })
    .catch(e => {
      console.error(e)
      ctx.send(`Ocorreu um erro inesperado ao executar este comando...\n\`${e}\``);
    });
  }
});