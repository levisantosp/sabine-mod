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
    const removePremium = async() => {
      const users = await User.find({
        "plan.expiresAt": { $lte: Date.now() }
      }) as UserSchemaInterface[];
      if(!users.length) return;
      for(const user of users) {
        const member = client.guilds.get("1233965003850125433")!.members.get(user.id);
        if(member) {
          member.removeRole("1314272663316856863");
          member.user.createDM().then(dm => dm.createMessage({
            content: `Your premium has expired! If you want to renew your plan, go to https://canary.discord.com/channels/1233965003850125433/1313902950426345492 and select a plan!`
          }))
          .catch();
          user.warned = false;
        }
        user.removePremium("REMOVE_PREMIUM_BY_AUTO");
        await user.save();
      }
    }
    const sendPremiumWarn = async() => {
      const users = await User.find({
        plan: { $exists: true },
        warned: {
          $eq: false
        }
      }) as UserSchemaInterface[];
      for(const user of users) {
        if(user.warned) continue;
        user.warned = true;
        const member = client.guilds.get("1233965003850125433")!.members.get(user.id);
        if((user.plan!.expiresAt - Date.now()) <= 2.592e+8) {
          if(member) {
            member.user.createDM().then(dm => dm.createMessage({
              content: `Your premium will expires <t:${(user.plan!.expiresAt / 1000).toFixed(0)}:R>! If you want to renew your plan, go to https://canary.discord.com/channels/1233965003850125433/1313902950426345492 and select a plan!`
            }))
            .catch(() => {});
          }
        }
        await user.save();
      }
    }
    const deleteInactiveThreads = async() => {
      const guild = client.guilds.get("1233965003850125433")!;
      const channels = guild.channels.filter(c => ["1313902950426345492", "1313588710637568030"].includes(c.id)) as TextChannel[];
      for(const channel of channels) {
        const threads = channel.threads.filter(t => Date.now() - new Date(t.createdAt).getTime() >= 1.2e+6);
        for(const thread of threads) await thread.delete();
      }
    }
    const deleteKeys = async() => {
      const keys = await Key.find(
        {
          expiresAt: { $lte: Date.now() },
          type: { $ne: "BOOSTER" }
        }
      ) as KeySchemaInterface[];
      for(const key of keys) {
        if(key.activeIn.length) {
          for(const gid of key.activeIn) {
            const guild = await Guild.findById(gid) as GuildSchemaInterface;
            if(!guild || !guild.key) continue;
            guild.tournamentsLength = 5;
            await guild.save();
            await guild.updateOne({
              $unset: { key: "" }
            });
          }
        }
        await key.deleteOne();
      }
    }
    const verifyKeyBooster = async() => {
      const keys = await Key.find(
        {
          type: { $eq: "BOOSTER" }
        }
      ) as KeySchemaInterface[];
      for(const key of keys) {
        const member = client.guilds.get("1233965003850125433")!.members.get(key.user);
        if(!member || (member && !member.premiumSince)) {
          const guild = await Guild.findById(key.activeIn[0]) as GuildSchemaInterface;
          await guild.updateOne({
            $unset: { key: "" }
          });
          await guild.save();
          await key.deleteOne();
        }
      }
    }
    const verifyPartners = async() => {
      const channel = client.getChannel("1346170715165950086") as TextChannel;
      const message = (await channel.getMessages({
        filter: (message) => message.author.id === client.user.id
      }))[0];
      if(!message) {
        const guilds = await Guild.find({
          partner: {
            $eq: true
          },
          invite: {
            $exists: true
          }
        }) as GuildSchemaInterface[];
        if(!guilds.length) return;
        let content = "## Our official Partners\n"
        for(const guild of guilds) {
          content += `- ${guild.invite}\n`
        }
        channel.createMessage({ content });
      }
      else {
        const guilds = await Guild.find({
          partner: {
            $eq: true
          },
          invite: {
            $exists: true
          }
        }) as GuildSchemaInterface[];
        let content = "## Our official Partners\n"
        for(const guild of guilds) {
          content += `- ${guild.invite}\n`
        }
        message.edit({ content });
      }
    }
    setInterval(async() => {
      await deleteKeys().catch(e => new Logger(client).error(e));
      await verifyKeyBooster().catch(e => new Logger(client).error(e));
      await deleteInactiveThreads().catch(e => new Logger(client).error(e));
      await sendPremiumWarn().catch(e => new Logger(client).error(e));
      await removePremium().catch(e => new Logger(client).error(e));
      await removeUserFromBlacklist().catch(e => new Logger(client).error(e));
      await removeGuildFromBlacklist().catch(e => new Logger(client).error(e));
      await verifyPartners().catch(e => new Logger(client).error(e));
    }, process.env.INTERVAL ?? 30000);
  }
});