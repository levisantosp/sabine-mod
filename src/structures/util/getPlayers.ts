export type Player = {
  id: number
  name: string
  collection: string
  team: string
  country: string
  role: string
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
}
export default async function<T extends Player[]>() {
  return await (await fetch(process.env.API_URL + "/players")).json() as Promise<T>
}