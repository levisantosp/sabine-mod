import { Guild, GuildSchemaInterface } from "../database"
import { createCommand } from "../structures"

export default createCommand({
  name: "partner",
  onlyDev: true,
  async run({ ctx }) {
    const args = {
      add: async() => {
        const guild = await Guild.findById(ctx.args[1]) as GuildSchemaInterface | null;
        if(!guild) {
          ctx.send("This guild does not exists in database");
          return;
        }
        guild.partner = true;
        guild.invite = ctx.args[2];
        await guild.save();
        ctx.send("Guild added!");
      },
      remove: async() => {
        const guild = await Guild.findById(ctx.args[1]) as GuildSchemaInterface | null;
        if(!guild) {
          ctx.send("This guild does not exists in database");
          return;
        }
        await guild.updateOne({
          $unset: {
            partner: "",
            invite: ""
          }
        });
        ctx.send("Guild removed!");
      }
    }
    if(
      !["add", "remove"].includes(ctx.args[0])
      ||
      !args[ctx.args[0] as "add" | "remove"]
      ||
      !ctx.args[1]
      ||
      !ctx.args[2]
    ) {
      ctx.send(`Invalid argument! Use \`${process.env.PREFIX}partner add/remove [guild_id] [guild_invite]\``);
      return;
    }
    await args[ctx.args[0] as "add" | "remove"]();
  }
});