import { Key, KeySchemaInterface } from "../database"
import { createCommand } from "../structures"

export default createCommand({
  name: "genkey",
  onlyBooster: true,
  async run({ ctx }) {
    const keys = await Key.find({
      type: { $eq: "BOOSTER" }
    }) as KeySchemaInterface[];
    if(keys.some(key => key.user === ctx.message.member.id)) return ctx.message.createReaction("error:1300882259078938685");
    let keyId = ""
    do {
      const pattern = "@@@@-####-@@##-&&&&"
      const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz"
      const digits = "0123456789"
      for(const char of pattern) {
        if(char === "@") {
          keyId += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));
        } 
        else if(char === "#") {
          keyId += digits.charAt(Math.floor(Math.random() * digits.length));
        } 
        else if(char === "&") {
          keyId += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
        } 
        else {
          keyId += char;
        }
      }
    }
    while (keys.some(key => key.id === keyId));
    await new Key(
      {
        _id: keyId,
        type: "BOOSTER",
        user: ctx.message.member.id,
        active: false,
        activeIn: []
      }
    ).save();
    ctx.message.author.createDM().then(dm => dm.createMessage({
      content: `Your Key Booster is \`${keyId}\`.\nDo not share with ANYONE.`
    }))
    .catch(() => ctx.send("Open your DM for this server."))
    .then(() => {
      ctx.message.createReaction("success:1300882212190945292");
    });
  }
});