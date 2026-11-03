import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), owner: text('owner').notNull(),
  title: text('title').notNull(), description: text('description').notNull(),
  priority: text('priority').notNull(), dueDate: text('due_date').notNull(),
  status: text('status').notNull(), version: integer('version').notNull().default(1),
  createdAt: text('created_at').notNull()
}, (t) => [index('tasks_owner_idx').on(t.owner),
  check('priority_valid', sql`${t.priority} IN ('baixa','media','alta')`),
  check('status_valid', sql`${t.status} IN ('pendente','concluida')`),
  check('title_length', sql`length(trim(${t.title})) BETWEEN 1 AND 100`)]);
