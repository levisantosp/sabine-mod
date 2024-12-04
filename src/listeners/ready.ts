import { Constants, TextChannel } from "oceanic.js"
import { App, createListener } from "../structures"
import { Blacklist, BlacklistSchemaInterface } from "../database"
import ms from "enhanced-ms"

export default createListener({
  name: "ready",
  async run(client) {
    console.log(`${client.user.tag} online!`);
    client.application.bulkEditGlobalCommands([]);
    if(!(await Blacklist.findById("blacklist"))) {
      new Blacklist({ _id: "blacklist" }).save();
    }
    const removeUserFromBlacklist = async() => {
      const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface;
      for(const user of blacklist.users.filter(user => user.endsAt !== Infinity)) {
        if((user.endsAt * 1000) < ms(ms(Date.now())!)) {
          let index = blacklist.users.findIndex(u => u.id === user.id);
          blacklist.users.splice(index, 1);
          await blacklist.save();
          const channel = client.getChannel("1237496064580386917") as TextChannel;
          channel.createMessage({ content: `[Auto] - \`${(await client.rest.users.get(user.id)).tag}\` (\`${user.id}\`) has been unbanned from the bot.` });
        }
      }
    }
    const removeGuildFromBlacklist = async() => {
      const blacklist = await Blacklist.findById("blacklist") as BlacklistSchemaInterface;
      for(const guild of blacklist.guilds) {
        if((guild.endsAt * 1000) < ms(ms(Date.now())!)) {
          let index = blacklist.guilds.findIndex(g => g.id === guild.id);
          blacklist.guilds.splice(index, 1);
          await blacklist.save();
          const channel = client.getChannel("1237496064580386917") as TextChannel;
          channel.createMessage({ content: `[Auto] - \`${guild.id}\` has been unbanned from the bot.` });
        }
      }
    }
    const execTasks = async() => {
      try {
        await removeUserFromBlacklist();
        await removeGuildFromBlacklist();
      }
      catch(e) {
        console.error(e);
      }
      finally {
        setTimeout(execTasks, 15000);
      }
    }
    execTasks();
  }
});