import { TextChannel } from "oceanic.js"
import ms from "enhanced-ms"
import createListener from "../structures/client/createListener.ts"
import Logger from "../structures/util/Logger.ts"
import { SabineGuild, SabineUser } from "../database/index.ts"

export default createListener({
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`)
    const removeUserFromBlacklist = async() => {
      const blacklist = await client.prisma.blacklist.findMany({
        where: {
          endsAt: {
            not: null
          },
          type: "USER"
        }
      })
      for(const user of blacklist) {
        if(!user.endsAt) continue
        if(user.endsAt < new Date()) {
          await client.prisma.blacklist.delete({
            where: {
              id: user.id,
              type: "USER"
            }
          })
          const channel = client.getChannel("1237496064580386917") as TextChannel
          await channel.createMessage({ content: `[Auto] - \`${(await client.rest.users.get(user.id)).tag}\` (\`${user.id}\`) has been unbanned from the bot.` })
        }
      }
    }
    const removeGuildFromBlacklist = async() => {
      const blacklist = await client.prisma.blacklist.findMany({
        where: {
          endsAt: {
            not: null
          },
          type: "GUILD"
        }
      })
      for(const guild of blacklist) {
        if(!guild.endsAt) continue
        if(guild.endsAt < new Date()) {
          await client.prisma.blacklist.delete({
            where: {
              id: guild.id,
              type: "GUILD"
            }
          })
          const channel = client.getChannel("1237496064580386917") as TextChannel
          await channel.createMessage({ content: `[Auto] - \`${guild.id}\` has been unbanned from the bot.` })
        }
      }
    }
    const removePremium = async() => {
      const users = await client.prisma.users.findMany({
        where: {
          plan: {
            isNot: null
          }
        }
      })
      if(!users.length) return
      for(const user of users) {
        if(!user.plan) continue
        if(user.plan.expiresAt > new Date()) continue
        const member = client.guilds.get("1233965003850125433")!.members.get(user.id)
        if(member) {
          await member.removeRole("1314272663316856863")
          member.user.createDM().then(dm => dm.createMessage({
            content: `Your premium has expired! If you want to renew your plan, go to https://canary.discord.com/channels/1233965003850125433/1313902950426345492 and select a plan!`
          }))
          .catch()
          user.warned = false
        }
        await client.prisma.users.update({
          where: {
            id: user.id
          },
          data: {
            plan: {
              unset: true
            }
          }
        })
      }
    }
    const sendPremiumWarn = async() => {
      const users = await client.prisma.users.findMany({
        where: {
          plan: {
            isNot: null
          },
          warned: false
        }
      })
      for(const user of users) {
        if(user.warned) continue
        if(!user.plan) continue
        user.warned = true
        const member = client.guilds.get("1233965003850125433")!.members.get(user.id)
        if((user.plan.expiresAt.getTime() - Date.now()) <= 2.592e+8) {
          if(member) {
            member.user.createDM().then(dm => dm.createMessage({
              content: `Your premium will expires <t:${(user.plan!.expiresAt.getTime() / 1000).toFixed(0)}:R>! If you want to renew your plan, go to https://canary.discord.com/channels/1233965003850125433/1313902950426345492 and select a plan!`
            }))
            .catch(() => {})
          }
        }
        await client.prisma.users.update({
          where: {
            id: user.id
          },
          data: {
            warned: true
          }
        })
      }
    }
    const deleteInactiveThreads = async() => {
      const guild = client.guilds.get("1233965003850125433")!
      const channels = guild.channels.filter(c => ["1313902950426345492", "1313588710637568030"].includes(c.id)) as TextChannel[]
      for(const channel of channels) {
        const threads = channel.threads.filter(t => Date.now() - new Date(t.createdAt).getTime() >= 1.2e+6)
        for(const thread of threads) await thread.delete()
      }
    }
    const deleteKeys = async() => {
      const keys = await client.prisma.keys.findMany({
        where: {
          expiresAt: {
            lte: new Date()
          },
          type: "PREMIUM"
        }
      })
      for(const key of keys) {
        if(key.activeIn.length) {
          for(const gid of key.activeIn) {
            const guild = await SabineGuild.fetch(gid)
            if(!guild || !guild.key) continue
            guild.tournamentsLength = 5
            guild.key = null
            await guild.save()
          }
        }
        await client.prisma.keys.delete({
          where: {
            id: key.id
          }
        })
      }
    }
    const verifyKeyBooster = async() => {
      const keys = await client.prisma.keys.findMany({
        where: {
          type: "BOOSTER"
        }
      })
      for(const key of keys) {
        const member = client.guilds.get("1233965003850125433")!.members.get(key.user)
        if(!member || (member && !member.premiumSince)) {
          const guild = await SabineGuild.fetch(key.activeIn[0])
          if(!guild || !guild.key) continue
          guild.key = null
          await guild.save()
        }
        await client.prisma.keys.delete({
          where: {
            id: key.id
          }
        })
      }
    }
    const verifyPartners = async() => {
      const channel = client.getChannel("1346170715165950086") as TextChannel
      const message = (await channel.getMessages({
        filter: (message) => message.author.id === client.user.id
      }))[0]
      if(!message) {
        const guilds = await client.prisma.guilds.findMany({
          where: {
            partner: true,
            invite: {
              not: null
            }
          }
        })
        if(!guilds.length) return
        let content = "## Our official Partners\n"
        for(const guild of guilds) {
          content += `- ${guild.invite}\n`
        }
        await channel.createMessage({ content })
      }
      else {
        const guilds = await client.prisma.guilds.findMany({
          where: {
            partner: true,
            invite: {
              not: null
            }
          }
        })
        let content = "## Our official Partners\n"
        for(const guild of guilds) {
          content += `- ${guild.invite}\n`
        }
        message.edit({ content })
      }
    }
    const runTasks = async() => {
      await deleteKeys().catch(e => new Logger(client).error(e))
      await verifyKeyBooster().catch(e => new Logger(client).error(e))
      await deleteInactiveThreads().catch(e => new Logger(client).error(e))
      await sendPremiumWarn().catch(e => new Logger(client).error(e))
      await removePremium().catch(e => new Logger(client).error(e))
      await removeUserFromBlacklist().catch(e => new Logger(client).error(e))
      await removeGuildFromBlacklist().catch(e => new Logger(client).error(e))
      await verifyPartners().catch(e => new Logger(client).error(e))
      setTimeout(runTasks, process.env.INTERVAL ?? 60 * 1000)
    }
    await runTasks()
  }
})