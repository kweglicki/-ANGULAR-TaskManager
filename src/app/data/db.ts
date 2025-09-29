import Dexie, { Table } from 'dexie';
import { Column, Task } from '../domain/types';

export class DexieBoardDB extends Dexie {
  columns!: Table<Column, string>;
  tasks!: Table<Task, string>;

  constructor() {
    super('TaskManagerDB');
    this.version(1).stores({
      columns: 'id,index',
      tasks: 'id,columnId,index,updatedAt'
    });
  }
}

export const db = new DexieBoardDB();
