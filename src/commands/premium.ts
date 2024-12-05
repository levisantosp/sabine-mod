import { createCommand, EmbedBuilder, SelectMenuBuilder } from "../structures"

export default createCommand({
  name: "premium",
  onlyDev: true,
  async run({ ctx }) {
    await ctx.message.delete();
    const menu = new SelectMenuBuilder()
    .setPlaceholder("Pagamento com BRL")
    .setOptions(
      {
        label: "Premium Booster",
        value: "premium_booster",
        description: "Consiga o Premium Booster apenas impulsionando o servidor!"
      },
      {
        label: "Premium Lite",
        value: "premium_lite",
        description: "Compre o Premium Lite por apenas R$ 2,99 durante 30 dias!"
      },
      {
        label: "Premium Pro",
        value: "premium_pro",
        description: "Compre o Premium Pro por apenas R$ 5,99 durante 30 dias!"
      },
      {
        label: "Premium Ultimate",
        value: "premium_ultimate",
        description: "Compre o Premium Ultimate por apenas R$ 9,99 durante 30 dias!"
      }
    )
    .setCustomId("premium")
    const embed = new EmbedBuilder()
    .setTitle("SEJA PREMIUM")
    .setDesc("Use este painel para adquirir um de nossos planos e ganhar vantagens exclusivas para o seu servidor!")
    .setFields(
      [
        {
          name: "Premium Booster",
          value: "- 1x Key Booster\n  - Pode adicionar até 10 campeonatos\n  - Dura enquanto o impulso estiver ativo"
        },
        {
          name: "Premium Lite",
          value: "- 1x Key Lite\n  - Pode adicionar até 15 campeonatos\n  - Funcionalidade de notícias liberada"
        },
        {
          name: "Premium Pro",
          value: "- 2x Key Pro\n  - Pode ser ativada em até 2 servidores diferentes\n  - Pode adicionar até 20 campeonatos\n  - Funcionalidade de notícias liberada\n  - Funcionalidade de acompanhar jogos ao vivo liberada"
        },
        {
          name: "Premium Ultimate",
          value: "- 3x Key Ultimate\n  - Pode ser ativada em até 3 servidores diferentes\n  - Pode adicionar até 25 campeonatos\n  - Funcionalidade de notícias liberada\n  - Funcionalidade de acompanhar jogos ao vivo liberada"
        }
      ]
    )
    ctx.send(menu.build(embed.build()));
  }
});