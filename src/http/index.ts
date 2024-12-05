import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox"
import fastify from "fastify"
import { EmbedBuilder } from "../structures"
import { Key, KeySchemaInterface } from "../database"

const webhook_route: FastifyPluginAsyncTypebox = async(fastify, opts) => {
  fastify.post("/webhook", {
    schema: {
      body: Type.Object({
        type: Type.String(),
        data: Type.Object({
          id: Type.String()
        })
      })
    }
  }, async(req, res) => {
    if(req.body.type === "payment") {
      const details = await fetch(
        `https://api.mercadopago.com/v1/payments/${req.body.data.id}`,
        {
          headers: {
            Authorization: "Bearer " + process.env.MP_TOKEN
          }
        }
      ).then(res => res.json());
      console.log("halo");
      if(details.status === "approved") {
        const args = details.external_reference.split(";");
        console.log(args);
        const keys = await Key.find() as KeySchemaInterface[];
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
        // await new Key(
        //   {
        //     _id: keyId,
        //     type: args[2].replace("PREMIUM_", ""),
        //     user: args[1],
        //     active: false,
        //     activeIn: []
        //   }
        // ).save();
        // const embed = new EmbedBuilder()
        // .setTitle("Pagamento aprovado")
        // .setDesc(`Sua compra de **${details.total_paid_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}** foi aprovada e você já pode aproveitar seus benefícios!\n\nSua chave de ativação é \`${keyId}\`\nNão compartilhe com NINGUÉM!`)
        // .setFooter({ text: "O tópico será deletado automaticamente após 20 minutos de inatividade" });
        await fetch(
          `https://discord.com/api/v10/channels/${args[0]}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: "Bot " + process.env.BOT_TOKEN,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              embeds: [
                {
                  title: "Pagamento aprovado",
                  description: `Sua compra de **${details.total_paid_amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}** foi aprovada e você já pode aproveitar seus benefícios!\n\nSua chave de ativação é \`${keyId}\`\nNão compartilhe com NINGUÉM!`,
                  footer: {
                    text: "O tópico será deletado automaticamente após 20 minutos de inatividade"
                  }
                }
              ]
            })
          }
        );
      }
    }
  });
}
const server = fastify();
server.register(webhook_route);
server.listen({ host: "0.0.0.0", port: 3000 }, () => console.log("server running at", 3000));