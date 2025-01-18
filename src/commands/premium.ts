import { createCommand, EmbedBuilder, SelectMenuBuilder } from "../structures"

export default createCommand({
  name: "premium",
  onlyDev: true,
  async run({ ctx }) {
    await ctx.message.delete();
    const menu = new SelectMenuBuilder()
    .setPlaceholder("Selecione um plano")
    .setOptions(
      {
        label: "Premium Booster",
        value: "premium_booster",
        description: "Consiga o Premium Booster apenas impulsionando o servidor!"
      },
      {
        label: "Premium",
        value: "premium",
        description: "Compre o Premium por apenas R$ 5,99 durante 30 dias!"
      }
    )
    .setCustomId("premium")
    const embed = new EmbedBuilder()
    .setTitle("SEJA PREMIUM")
    .setDesc("Use este painel para adquirir um de nossos planos e ganhar vantagens exclusivas para o seu servidor!")
    .setFields(
      {
        name: "Premium Booster",
        value: "- 1x Chave Booster\n  - Chave gerada manualmente\n  - Pode ser ativada em até um servidor\n  - Pode adicionar até 10 campeonatos\n  - Dura enquanto o impulso estiver ativo"
      },
      {
        name: "Premium",
        value: "- 2x Chave Premium\n  - Chave gerada automaticamente\n  - Pode ser ativada em até 2 servidores diferentes\n  - Pode adicionar até 20 campeonatos\n  - Funcionalidade de notícias liberada\n  - Funcionalidade de acompanhar jogos ao vivo liberada"
      },
      {
        name: "Métodos de pagamento",
        value: "- <:mercadopago:1313901326744293427> Mercado Pago\n- <:pix:1314231636883406939> Pix\n- 💳 Cartão de crédito"
      }
    );
    ctx.send(menu.build(embed.build()));
  }
});