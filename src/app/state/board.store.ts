import { Injectable, computed, signal } from '@angular/core';
import { Column, ID, Task, BoardPatch, PatchOp } from '../domain/types';
import { boardRepo } from '../data/repository';
import { CollabService } from '../core/collab.service';
import { now, uid } from '../core/uid';

@Injectable({ providedIn: 'root' })
export class BoardStore {
  columns = signal<Column[]>([]);
  tasks = signal<Task[]>([]);
  loading = signal(true);

  tasksByColumn = computed(() => {
    const by: Record<ID, Task[]> = {};
    for (const c of this.columns()) by[c.id] = [];
    for (const t of this.tasks()) (by[t.columnId] ??= []).push(t);
    for (const k of Object.keys(by)) by[k].sort((a, b) => a.index - b.index);
    return by;
  });

  constructor(private collab: CollabService) {
    this.init();
    this.collab.onPatch((p) => this.applyPatch(p, false));
  }

  private async init() {
    const { columns, tasks } = await boardRepo.load();
    if (columns.length === 0) {
      const seedCols: Column[] = [
        { id: uid(), name: 'Todo', index: 0 },
        { id: uid(), name: 'In Progress', index: 1 },
        { id: uid(), name: 'Done', index: 2 }
      ];
      await boardRepo.saveColumns(seedCols);
      this.columns.set(seedCols);
    } else {
      this.columns.set(columns);
    }
    this.tasks.set(tasks);
    this.loading.set(false);
  }

  private commit(ops: PatchOp[], broadcast = true) {
    const patch: BoardPatch = { id: uid(), ts: now(), ops };
    this.applyPatch(patch, broadcast);
  }

  applyPatch(patch: BoardPatch, broadcast: boolean) {
    let changedCols = false, changedTasks = false;
    for (const op of patch.ops) {
      switch (op.t) {
        case 'addColumn':
          this.columns.update((cs) => [...cs, op.column].sort((a, b) => a.index - b.index)); changedCols = true; break;
        case 'renameColumn':
          this.columns.update((cs) => cs.map(c => c.id === op.id ? { ...c, name: op.name } : c)); changedCols = true; break;
        case 'removeColumn':
          this.columns.update((cs) => cs.filter(c => c.id !== op.id)); changedCols = true;
          this.tasks.update((ts) => ts.filter(t => t.columnId !== op.id)); changedTasks = true;
          void boardRepo.deleteColumn(op.id); // <-- DODAJ
          break;
          case 'addTask':
          this.tasks.update((ts) => [...ts, op.task]); changedTasks = true; break;
        case 'editTask':
          this.tasks.update((ts) => ts.map(t => t.id === op.task.id ? op.task : t)); changedTasks = true; break;
        case 'removeTask':
          this.tasks.update((ts) => ts.filter(t => t.id !== op.id)); changedTasks = true;
          void boardRepo.deleteTask(op.id);  // <-- DODAJ
          break;
          case 'moveTask':
          this.tasks.update((ts) => {
            const t = ts.find(x => x.id === op.id);
            if (!t) return ts;
            const updated: Task = { ...t, columnId: op.toColumnId, index: op.toIndex, updatedAt: now() };
            const rest = ts.filter(x => x.id !== t.id);
            return [...rest, updated];
          }); changedTasks = true; break;
        case 'reindexColumn':
          this.columns.update((cs) => cs.map(c => c.id === op.id ? { ...c, index: op.index } : c).sort((a, b) => a.index - b.index)); changedCols = true; break;
      }
    }
    if (changedCols) boardRepo.saveColumns(this.columns());
    if (changedTasks) boardRepo.saveTasks(this.tasks());
    if (broadcast) this.collab.broadcast(patch);
  }

  addColumn(name: string) {
    const index = this.columns().length;
    this.commit([{ t: 'addColumn', column: { id: uid(), name, index } }]);
  }
  renameColumn(id: ID, name: string) { this.commit([{ t: 'renameColumn', id, name }]); }
  removeColumn(id: ID) { this.commit([{ t: 'removeColumn', id }]); }
  addTask(columnId: ID, input: { title: string; description?: string; tags?: string[]; priority?: Task['priority'] }) {
    const topIndex = (this.tasks().filter(t => t.columnId === columnId).sort((a, b) => b.index - a.index)[0]?.index ?? -1) + 1;
    const task: Task = {
      id: uid(), title: input.title, description: input.description ?? '', columnId, index: topIndex,
      tags: input.tags ?? [], priority: input.priority ?? 'medium', createdAt: now(), updatedAt: now(), mode: 'create'
    };
    this.commit([{ t: 'addTask', task }]);
  }
  editTask(task: Task) { this.commit([{ t: 'editTask', task: { ...task, updatedAt: now(), mode: 'edit' } }]); }
  removeTask(id: ID) { this.commit([{ t: 'removeTask', id }]); }
  moveTask(id: ID, toColumnId: ID, toIndex: number) { this.commit([{ t: 'moveTask', id, toColumnId, toIndex }]); }
  reorderColumns(idsInOrder: ID[]) {
    const ops: PatchOp[] = idsInOrder.map((id, i) => ({ t: 'reindexColumn', id, index: i }));
    this.commit(ops);
  }
}
