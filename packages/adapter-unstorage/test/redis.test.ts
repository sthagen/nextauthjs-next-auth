import { createStorage } from "unstorage"
import { runBasicTests } from "utils/adapter"
import { hydrateDates, UnstorageAdapter } from "../src"
import redisDriver from "unstorage/drivers/redis"

const storage = createStorage({
  driver: redisDriver({ username: "default" }),
})

runBasicTests({
  adapter: UnstorageAdapter(storage, { baseKeyPrefix: "testApp:" }),
  db: {
    disconnect: storage.dispose,
    async user(id: string) {
      const data = await storage.getItem<object>(`testApp:user:${id}`)
      if (!data) return null
      return hydrateDates(data)
    },
    async account({ provider, providerAccountId }) {
      const data = await storage.getItem<object>(
        `testApp:user:account:${provider}:${providerAccountId}`
      )
      if (!data) return null
      return hydrateDates(data)
    },
    async session(sessionToken) {
      const data = await storage.getItem<object>(
        `testApp:user:session:${sessionToken}`
      )
      if (!data) return null
      return hydrateDates(data)
    },
    async verificationToken(where) {
      const data = await storage.getItem<object>(
        `testApp:user:token:${where.identifier}:${where.token}`
      )
      if (!data) return null
      return hydrateDates(data)
    },
  },
})
