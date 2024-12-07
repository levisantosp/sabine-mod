import { User, UserSchemaInterface } from "../database"
import { createCommand } from "../structures"

export default createCommand({
  name: "addpremium",
  onlyDev: true,
  async run({ ctx, getUser }) {
    if(!ctx.args[0]) {
      ctx.send("You need to enter the premium type.");
      return;
    }
    const duser = await getUser(ctx.args[1]);
    if(!duser) {
      ctx.send("Invalid user.");
      return;
    }
    const user = (await User.findById(duser.id) || new User({ _id: duser.id })) as UserSchemaInterface;
    const options = {
      pro: async() => {
        await user.addPremium("PRO", "ADD_PREMIUM_BY_COMMAND");
        ctx.send(`Premium Pro activated for ${duser.mention}`);
      },
      lite: async() => {
        await user.addPremium("LITE", "ADD_PREMIUM_BY_COMMAND");
        ctx.send(`Premium Lite activated for ${duser.mention}`);
      },
      ultimate: async() => {
        await user.addPremium("ULTIMATE", "ADD_PREMIUM_BY_COMMAND");
        ctx.send(`Premium Ultimate activated for ${duser.mention}`);
      }
    }
    options[ctx.args[0] as "pro" | "lite" | "ultimate"]();
  }
});