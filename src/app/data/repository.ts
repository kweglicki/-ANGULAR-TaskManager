import { db } from './db';
import { Column, Task } from '../domain/types';

export class BoardRepository {
  async load(): Promise<{ columns: Column[]; tasks: Task[] }> {
    const [columns, tasks] = await Promise.all([db.columns.orderBy('index').toArray(), db.tasks.orderBy('updatedAt').reverse().toArray()]);
    return { columns, tasks };
  }
  async saveColumns(columns: Column[]) { await db.columns.bulkPut(columns); }
  async saveTasks(tasks: Task[]) { await db.tasks.bulkPut(tasks); }
  async deleteTask(id: string) { await db.tasks.delete(id); }
  async deleteColumn(id: string) {
    await db.transaction('rw', db.columns, db.tasks, async () => {
      await db.columns.delete(id);
      await db.tasks.where({ columnId: id }).delete();
    });
  }
}
export const boardRepo = new BoardRepository();
