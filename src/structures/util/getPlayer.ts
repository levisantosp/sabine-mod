import getPlayers from "./getPlayers"

export default async function(playerID: number | string) {
  return (await getPlayers()).find(p => p.id.toString() === playerID.toString())
}