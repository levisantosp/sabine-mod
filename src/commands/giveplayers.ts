import { User, UserSchemaInterface } from '../database'
import { createCommand, getPlayer } from '../structures'

export default createCommand({
  name: 'giveplayer',
  onlyDev: true,
  async run({ ctx, getUser }) {
    if(!ctx.args[0]) {
      return ctx.send('Provide a user.')
    }
    if(!ctx.args[1] || ctx.args[1] === '') {
      return ctx.send('Provide a player.')
    }
    const _user = await getUser(ctx.args[0])
    const player = await getPlayer(ctx.args[1])
    if(!_user) {
      return ctx.send('Invalid user.')
    }
    const user = (await User.findById(_user.id) ?? new User({ _id: _user.id })) as UserSchemaInterface
    if(!player) {
      return ctx.send('Invalid player.')
    }
    user.roster.reserve.push(player.id.toString())
    await user.save()
    await ctx.send(`${_user.mention} received **${player.name} (${player.collection})** sucessfully!`)
  }
})