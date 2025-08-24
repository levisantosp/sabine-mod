import createCommand from "../structures/command/createCommand.ts"

export default createCommand({
  name: "genkey",
  aliases: ["gerarchave"],
  onlyBooster: true,
  async run({ ctx, client }) {
    const keys = await client.prisma.keys.findMany()
    if(keys.some(key => key.user === ctx.message.member.id)) return await ctx.message.createReaction("error:1300882259078938685")
    let keyId = ""
    do {
      const pattern = "@@@@-####-@@##-&&&&"
      const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz"
      const digits = "0123456789"
      for(const char of pattern) {
        if(char === "@") {
          keyId += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length))
        } 
        else if(char === "#") {
          keyId += digits.charAt(Math.floor(Math.random() * digits.length))
        } 
        else if(char === "&") {
          keyId += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length))
        } 
        else {
          keyId += char
        }
      }
    }
    while (keys.some(key => key.id === keyId))
    await client.prisma.keys.create({
      data: {
        id: keyId,
        type: "BOOSTER",
        user: ctx.message.member.id
      }
    })
    ctx.message.author.createDM().then(dm => dm.createMessage({
      content: `Your Key Booster is \`${keyId}\`.\nDo not share with ANYONE.`
    }))
    .catch(() => ctx.send("Open your DM for this server."))
    .then(() => {
      ctx.message.createReaction("success:1300882212190945292")
    })
  }
})