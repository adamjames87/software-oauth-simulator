const Dirty = require("dirty");
const db = Dirty("tokens.json");


function createTokenStore() {
  console.log("createTokenStore");
  return [];
}

export const tokenStoreServer: Array<{id: number, token: string}> = createTokenStore();

export function getToken(id: number) {
  console.log("getToken", id)
  return db.get(id);
}

export function setToken(id: number, token: string) {
  console.log(`Setting token for ${id} to ${token}`)
  db.set(id, token);
}
