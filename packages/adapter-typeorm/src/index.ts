/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px"}}>
 *  <p style={{fontWeight: "normal"}}>Official <a href="https://typeorm.io">TypeORM</a> adapter for Auth.js / NextAuth.js.</p>
 *  <a href="https://typeorm.io">
 *   <img style={{display: "block" }} width="56" src="/img/adapters/typeorm.svg" />
 *  </a>
 * </div>
 *
 * ## Installation
 *
 * ```bash npm2yarn
 * npm install @auth/typeorm-adapter typeorm
 * ```
 *
 * @module @auth/typeorm-adapter
 */

import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from "@auth/core/adapters"
import { DataSourceOptions, DataSource, EntityManager } from "typeorm"
import * as defaultEntities from "./entities.js"
import { parseDataSourceConfig, updateConnectionEntities } from "./utils.js"

export const entities = defaultEntities

export type Entities = typeof entities

/** This is the interface for the TypeORM adapter options. */
export interface TypeORMAdapterOptions {
  /**
   * The {@link https://orkhan.gitbook.io/typeorm/docs/entities TypeORM entities} to create the database tables from.
   */
  entities?: Entities
}

let _dataSource: DataSource | undefined

export async function getManager(options: {
  dataSource: string | DataSourceOptions
  entities: Entities
}): Promise<EntityManager> {
  if (!_dataSource) {
    const { dataSource, entities } = options
    const config = {
      ...parseDataSourceConfig(dataSource),
      entities: Object.values(entities),
    }
    _dataSource = new DataSource(config)
  }

  const manager = _dataSource?.manager

  if (!manager.connection.isInitialized) {
    await manager.connection.initialize()
  }

  if (process.env.NODE_ENV !== "production") {
    await updateConnectionEntities(_dataSource, Object.values(options.entities))
  }
  return manager
}

/**
 * ## Setup
 *
 * Configure Auth.js to use the TypeORM Adapter:
 *
 * ```ts title="pages/api/auth/[...nextauth].ts"
 * import NextAuth from "next-auth"
 * import { TypeORMAdapter } from "@auth/typeorm-adapter"
 *
 * export default NextAuth({
 *   adapter: TypeORMAdapter("yourconnectionstring"),
 * })
 * ```
 *
 * `TypeORMAdapter` takes either a connection string, or a [`ConnectionOptions`](https://github.com/typeorm/typeorm/blob/master/docs/connection-options.md) object as its first parameter.
 *
 * ## Advanced usage
 *
 * ### Custom models
 *
 * The TypeORM adapter uses [`Entity` classes](https://github.com/typeorm/typeorm/blob/master/docs/entities.md) to define the shape of your data.
 *
 * If you want to override the default entities (for example to add a `role` field to your `UserEntity`), you will have to do the following:
 *
 * 1. Create a file containing your modified entities:
 *
 * (The file below is based on the [default entities](https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-typeorm/src/entities.ts))
 *
 * ```ts title="lib/entities.ts" {37-38}
 * import {
 *   Entity,
 *   PrimaryGeneratedColumn,
 *   Column,
 *   ManyToOne,
 *   OneToMany,
 *   ValueTransformer,
 * } from "typeorm"
 *
 * const transformer: Record<"date" | "bigint", ValueTransformer> = {
 *   date: {
 *     from: (date: string | null) => date && new Date(parseInt(date, 10)),
 *     to: (date?: Date) => date?.valueOf().toString(),
 *   },
 *   bigint: {
 *     from: (bigInt: string | null) => bigInt && parseInt(bigInt, 10),
 *     to: (bigInt?: number) => bigInt?.toString(),
 *   },
 * }
 *
 * @Entity({ name: "users" })
 * export class UserEntity {
 *   @PrimaryGeneratedColumn("uuid")
 *   id!: string
 *
 *   @Column({ type: "varchar", nullable: true })
 *   name!: string | null
 *
 *   @Column({ type: "varchar", nullable: true, unique: true })
 *   email!: string | null
 *
 *   @Column({ type: "varchar", nullable: true, transformer: transformer.date })
 *   emailVerified!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   image!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   role!: string | null
 *
 *   @OneToMany(() => SessionEntity, (session) => session.userId)
 *   sessions!: SessionEntity[]
 *
 *   @OneToMany(() => AccountEntity, (account) => account.userId)
 *   accounts!: AccountEntity[]
 * }
 *
 * @Entity({ name: "accounts" })
 * export class AccountEntity {
 *   @PrimaryGeneratedColumn("uuid")
 *   id!: string
 *
 *   @Column({ type: "uuid" })
 *   userId!: string
 *
 *   @Column()
 *   type!: string
 *
 *   @Column()
 *   provider!: string
 *
 *   @Column()
 *   providerAccountId!: string
 *
 *   @Column({ type: "varchar", nullable: true })
 *   refresh_token!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   access_token!: string | null
 *
 *   @Column({
 *     nullable: true,
 *     type: "bigint",
 *     transformer: transformer.bigint,
 *   })
 *   expires_at!: number | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   token_type!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   scope!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   id_token!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   session_state!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   oauth_token_secret!: string | null
 *
 *   @Column({ type: "varchar", nullable: true })
 *   oauth_token!: string | null
 *
 *   @ManyToOne(() => UserEntity, (user) => user.accounts, {
 *     createForeignKeyConstraints: true,
 *   })
 *   user!: UserEntity
 * }
 *
 * @Entity({ name: "sessions" })
 * export class SessionEntity {
 *   @PrimaryGeneratedColumn("uuid")
 *   id!: string
 *
 *   @Column({ unique: true })
 *   sessionToken!: string
 *
 *   @Column({ type: "uuid" })
 *   userId!: string
 *
 *   @Column({ transformer: transformer.date })
 *   expires!: string
 *
 *   @ManyToOne(() => UserEntity, (user) => user.sessions)
 *   user!: UserEntity
 * }
 *
 * @Entity({ name: "verification_tokens" })
 * export class VerificationTokenEntity {
 *   @PrimaryGeneratedColumn("uuid")
 *   id!: string
 *
 *   @Column()
 *   token!: string
 *
 *   @Column()
 *   identifier!: string
 *
 *   @Column({ transformer: transformer.date })
 *   expires!: string
 * }
 * ```
 *
 * 2. Pass them to `TypeORMAdapter`
 *
 * ```js title="pages/api/auth/[...nextauth].js"
 * import NextAuth from "next-auth"
 * import { TypeORMAdapter } from "@auth/typeorm-adapter"
 * import * as entities from "lib/entities"
 *
 * export default NextAuth({
 *   adapter: TypeORMAdapter("yourconnectionstring", { entities })
 * })
 * ```
 *
 * :::tip Synchronize your database
 * The `synchronize: true` option in TypeORM will generate SQL that exactly matches the entities. This will automatically apply any changes it finds in the entity model. This is a useful option in development.
 * :::
 *
 * :::warning Using synchronize in production
 * The option `synchronize: true` should not be enabled against production databases as it may cause data loss if the configured schema does not match the expected schema! We recommend that you synchronize/migrate your production database at build-time.
 * :::
 *
 * ### Naming Conventions
 *
 * If mixed snake_case and camelCase column names are an issue for you and/or your underlying database system, we recommend using TypeORM's naming strategy feature to change the target field names. There is a package called `typeorm-naming-strategies` which includes a `snake_case` strategy which will translate the fields from how Auth.js expects them, to snake_case in the actual database.
 *
 * For example, you can add the naming convention option to the connection object in your NextAuth config.
 *
 * ```js title="pages/api/auth/[...nextauth].js"
 * import NextAuth from "next-auth"
 * import { TypeORMAdapter } from "@auth/typeorm-adapter"
 * import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
 * import { ConnectionOptions } from "typeorm"
 *
 * const connection: ConnectionOptions = {
 *   type: "mysql",
 *   host: "localhost",
 *   port: 3306,
 *   username: "test",
 *   password: "test",
 *   database: "test",
 *   namingStrategy: new SnakeNamingStrategy()
 * }
 *
 * export default NextAuth({
 *   adapter: TypeORMAdapter(connection)
 * })
 * ```
 *
 */
export function TypeORMAdapter(
  dataSource: string | DataSourceOptions,
  options?: TypeORMAdapterOptions
): Adapter {
  const entities = options?.entities
  const c = {
    dataSource,
    entities: {
      UserEntity: entities?.UserEntity ?? defaultEntities.UserEntity,
      SessionEntity: entities?.SessionEntity ?? defaultEntities.SessionEntity,
      AccountEntity: entities?.AccountEntity ?? defaultEntities.AccountEntity,
      VerificationTokenEntity:
        entities?.VerificationTokenEntity ??
        defaultEntities.VerificationTokenEntity,
    },
  }

  const UserEntityName = c.entities.UserEntity.name
  const AccountEntityName = c.entities.AccountEntity.name
  const SessionEntityName = c.entities.SessionEntity.name
  const VerificationTokenEntityName = c.entities.VerificationTokenEntity.name

  return {
    /**
     * Method used in testing. You won't need to call this in your app.
     * @internal
     */
    async __disconnect() {
      const m = await getManager(c)
      await m.connection.close()
    },
    createUser: async (data) => {
      const m = await getManager(c)
      const user = await m.save(UserEntityName, data)
      return user
    },
    // @ts-expect-error
    async getUser(id) {
      const m = await getManager(c)
      const user = await m.findOne(UserEntityName, { where: { id } })
      if (!user) return null
      return { ...user }
    },
    // @ts-expect-error
    async getUserByEmail(email) {
      const m = await getManager(c)
      const user = await m.findOne(UserEntityName, { where: { email } })
      if (!user) return null
      return { ...user }
    },
    async getUserByAccount(provider_providerAccountId) {
      const m = await getManager(c)
      // @ts-expect-error
      const account = await m.findOne<AdapterAccount & { user: AdapterUser }>(
        AccountEntityName,
        // @ts-expect-error
        { where: provider_providerAccountId, relations: ["user"] }
      )
      if (!account) return null
      return account.user ?? null
    },
    // @ts-expect-error
    async updateUser(data) {
      const m = await getManager(c)
      const user = await m.save(UserEntityName, data)
      return user
    },
    async deleteUser(id) {
      const m = await getManager(c)
      await m.transaction(async (tm) => {
        await tm.delete(AccountEntityName, { userId: id })
        await tm.delete(SessionEntityName, { userId: id })
        await tm.delete(UserEntityName, { id })
      })
    },
    async linkAccount(data) {
      const m = await getManager(c)
      const account = await m.save(AccountEntityName, data)
      return account
    },
    async unlinkAccount(providerAccountId) {
      const m = await getManager(c)
      await m.delete<AdapterAccount>(AccountEntityName, providerAccountId)
    },
    async createSession(data) {
      const m = await getManager(c)
      const session = await m.save(SessionEntityName, data)
      return session
    },
    async getSessionAndUser(sessionToken) {
      const m = await getManager(c)
      const sessionAndUser = await m.findOne<
        AdapterSession & { user: AdapterUser }
      >(SessionEntityName, { where: { sessionToken }, relations: ["user"] })

      if (!sessionAndUser) return null
      const { user, ...session } = sessionAndUser
      return { session, user }
    },
    async updateSession(data) {
      const m = await getManager(c)
      await m.update(
        SessionEntityName,
        { sessionToken: data.sessionToken },
        data
      )
      // TODO: Try to return?
      return null
    },
    async deleteSession(sessionToken) {
      const m = await getManager(c)
      await m.delete(SessionEntityName, { sessionToken })
    },
    async createVerificationToken(data) {
      const m = await getManager(c)
      const verificationToken = await m.save(VerificationTokenEntityName, data)
      // @ts-expect-error
      delete verificationToken.id
      return verificationToken
    },
    // @ts-expect-error
    async useVerificationToken(identifier_token) {
      const m = await getManager(c)
      const verificationToken = await m.findOne(VerificationTokenEntityName, {
        where: identifier_token,
      })
      if (!verificationToken) {
        return null
      }
      await m.delete(VerificationTokenEntityName, identifier_token)
      // @ts-expect-error
      delete verificationToken.id
      return verificationToken
    },
  }
}
