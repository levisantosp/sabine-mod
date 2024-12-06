import { TextChannel } from "oceanic.js"
import { createListener, Logger } from "../structures"
import { Blacklist, BlacklistSchemaInterface, Guild, GuildSchemaInterface, Key, KeySchemaInterface, User, UserSchemaInterface } from "../database"
import ms from "enhanced-ms"

export default createListener({
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`);
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
    const removeDefaultPremium = async() => {
      const users = await User.find({
        plans: { $ne: [] }
      }) as UserSchemaInterface[];
      for(const user of users) {
        for(const premium of user.plans.filter(p => p.expiresAt <= Date.now())) {
          const member = client.guilds.get("1233965003850125433")!.members.get(user.id);
          user.plans.shift();
          if(member) {
            if(premium.type === "LITE") {
              member.removeRole("1314272663316856863");
            }
            else if(premium.type === "PRO") {
              member.removeRole("1314272739917303888");
            }
            else if(premium.type === "ULTIMATE") {
              member.removeRole("1314272766891003945");
            }
            member.user.createDM().then(dm => dm.createMessage({
              content: `Seu premium \`${premium.type}\` expirou! Caso queira realizar uma renovação do plano, vá em https://canary.discord.com/channels/1233965003850125433/1313902950426345492 e selecione o plano desejado!`
            }))
            .catch();
          }
        }
        user.save();
      }
    }
    const sendPremiumWarn = async() => {
      const users = await User.find({
        premium: { $exists: true }
      }) as UserSchemaInterface[];
      for(const user of users) {
        if(user.warned) continue;
        user.warned = true;
        const member = client.guilds.get("1233965003850125433")!.members.get(user.id);
        for(const premium of user.plans.filter(p => p.expiresAt - Date.now() <= 2.592e+8)) {
          if(member) {
            member.user.createDM().then(dm => dm.createMessage({
              content: `Seu premium \`${premium.type}\` irá acabar <t:${(premium.expiresAt / 1000).toFixed(0)}:R>! Caso queria realizar uma renovação do plano, vá em https://canary.discord.com/channels/1233965003850125433/1313902950426345492 e selecione o plano desejado!`
            }))
            .catch();
          }
        }
        await user.save();
      }
    }
    const deleteInactiveThreads = async() => {
      const guild = client.guilds.get("1233965003850125433")!;
      const channel = guild.channels.get("1313902950426345492") as TextChannel;
      const threads = channel.threads.filter(t => Date.now() - new Date(t.createdAt).getTime() >= 1.2e+6);
      for(const thread of threads) await thread.delete();
    }
    const deleteKeys = async() => {
      const keys = await Key.find(
        {
          expiresAt: { $lte: Date.now() }
        }
      ) as KeySchemaInterface[];
      for(const key of keys) {
        if(key.activeIn.length) {
          for(const gid of key.activeIn) {
            const guild = await Guild.findById(gid) as GuildSchemaInterface;
            if(!guild || !guild.keys?.length) continue;
            let index = guild.keys.findIndex(k => k.id === key.id);
            if(index > -1) {
              guild.keys.splice(index, 1);
            }
            await guild.save();
          }
        }
        await key.deleteOne();
      }
    }
    const execTasks = async() => {
      try {
        await deleteKeys();
        await deleteInactiveThreads();
        await sendPremiumWarn();
        await removeDefaultPremium();
        await removeUserFromBlacklist();
        await removeGuildFromBlacklist();
      }
      catch(e) {
        new Logger(client).error(e as Error);
      }
      finally {
        setTimeout(execTasks, 15000);
      }
    }
    execTasks();
  }
});