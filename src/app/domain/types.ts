export type ID = string;

export interface Column {
  id: ID;
  name: string;
  index: number;
}

export interface Task {
  id: ID;
  title: string;
  description?: string;
  columnId: ID;
  index: number;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export type PatchOp =
  | { t: 'addColumn'; column: Column }
  | { t: 'renameColumn'; id: ID; name: string }
  | { t: 'removeColumn'; id: ID }
  | { t: 'addTask'; task: Task }
  | { t: 'editTask'; task: Task }
  | { t: 'removeTask'; id: ID }
  | { t: 'moveTask'; id: ID; toColumnId: ID; toIndex: number }
  | { t: 'reindexColumn'; id: ID; index: number };

export interface BoardPatch {
  id: string;
  ts: number;
  ops: PatchOp[];
  author?: string;
}
