import { drizzle } from "drizzle-orm/mysql2"
import { createPool } from "mysql2"
import { defineTables } from "../../src/lib/mysql"

export const {
  usersTable,
  accountsTable,
  sessionsTable,
  verificationTokensTable,
} = defineTables({})

const poolConnection = createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "next-auth",
})

export const db = drizzle(poolConnection)
