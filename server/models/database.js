import { pgTable, serial, text, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './user.js';

export const databases = pgTable('databases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  host: varchar('host', { length: 255 }).notNull(),
  port: integer('port').notNull(),
  database: varchar('database', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  password: text('password').notNull(),
  isConnected: boolean('is_connected').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
