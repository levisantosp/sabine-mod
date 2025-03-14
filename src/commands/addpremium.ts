import { User, UserSchemaInterface } from "../database"
import { createCommand } from "../structures"

export default createCommand({
  name: "addpremium",
  onlyDev: true,
  async run({ ctx, getUser }) {
    const duser = await getUser(ctx.args[0]);
    if(!duser) {
      ctx.send("Invalid user.");
      return;
    }
    const user = (await User.findById(duser.id) || new User({ _id: duser.id })) as UserSchemaInterface;
    await user.addPremium("ADD_PREMIUM_BY_COMMAND");
    ctx.send(`Premium activated for ${duser.mention}`);
  }
});