import { Component, computed, inject } from '@angular/core';
import { BoardStore } from '../../state/board.store';
import { NgFor, NgIf } from '@angular/common';
import { ColumnComponent } from './column.component';
import { TaskDialogComponent } from './task-dialog.component';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslatePipe } from '@ngx-translate/core';
import type { Column } from '../../domain/types';
import { Task } from '../../domain/types';

@Component({
  standalone: true,
  selector: 'app-board-page',
  imports: [NgFor, NgIf, ColumnComponent, TaskDialogComponent, CdkDropList, CdkDrag, TranslatePipe],

  template: `
    <div class="container" aria-live="polite">
      <div class="cols" cdkDropList cdkDropListOrientation="horizontal"
                [cdkDropListData]="store.columns()"
                (cdkDropListDropped)="dropCol($event)">
          <app-column class="col" *ngFor="let col of store.columns(); trackBy: trackCol"
              cdkDrag [cdkDragData]="col" cdkDragLockAxis="x"
              [column]="col"
              [connectedIds]="connectedIdsFor(col.id)"
              (addTask)="openDialog(col.id)"
              (removeColumn)="store.removeColumn(col.id)"
              (renameColumn)="store.renameColumn(col.id, $event)"
              (requestEdit)="openEditDialog($event)"></app-column>
        <div class="col" style="min-width:240px;display:flex;align-items:center;justify-content:center">
      <button class="ghost" (click)="addColumn()">{{ 'board.addColumn' | translate }}</button>
    </div>
  </div>
      <app-task-dialog *ngIf="dialogOpen"
                  [mode]="dialogMode"
                  [initial]="dialogTask"
                  [columns]="store.columns()"
                  [columnId]="dialogColId!"
                  (close)="dialogOpen=false"
                  (save)="saveTask($event)"></app-task-dialog>
  `
})
export class BoardPageComponent {
  store = inject(BoardStore);
  dialogOpen = false;
  dialogColId?: string;
  dialogMode: 'create' | 'edit' = 'create';
  dialogTask?: Task;

  colIds = computed(() => this.store.columns().map(c => c.id));

  trackCol = (_: number, c: any) => c.id;

  addColumn() {
    const name = prompt('Column name');
    if (name?.trim()) this.store.addColumn(name.trim());
  }

  openDialog(colId: string) {
    this.dialogMode = 'create';
    this.dialogTask = undefined;
    this.dialogColId = colId;
    this.dialogOpen = true;
  }
  
  saveTask(e: { id?: string; columnId: string; title: string; description?: string; priority: 'low'|'medium'|'high'; tags: string[] }) {
    if (e.id && this.dialogTask) {
      const current = this.dialogTask;
      const updated: Task = {
        ...current,
        title: e.title.trim(),
        description: e.description?.trim() ?? '',
        priority: e.priority,
        tags: e.tags
      };
      if (current.columnId !== e.columnId) {
        const toIndex = (this.store.tasksByColumn()[e.columnId]?.length ?? 0);
        this.store.moveTask(current.id, e.columnId, toIndex);
        updated.columnId = e.columnId;
        updated.index = toIndex;
      }
      this.store.editTask(updated);
    } else {
      this.store.addTask(e.columnId, e);
    }
    this.dialogOpen = false;
    this.dialogTask = undefined;
    this.dialogMode = 'create';
  }

  onTaskDrop(e: { id: string; fromColumnId: string; toIndex: number }, toColumnId: string) {
    this.store.moveTask(e.id, toColumnId, e.toIndex);
  }

  dropCol(ev: CdkDragDrop<Column[]>) {
   if (ev.previousIndex === ev.currentIndex) return;
    const cols = [...this.store.columns()];
    moveItemInArray(cols, ev.previousIndex, ev.currentIndex);
    this.store.reorderColumns(cols.map(c => c.id));
  }

  connectedIdsFor(colId: string): string[] {
    const all = this.store.columns().map(c => 'list-' + c.id);
    return all.filter(id => id !== 'list-' + colId);
  }

  openEditDialog(task: Task) {
    this.dialogMode = 'edit';
    this.dialogTask = task;
    this.dialogColId = task.columnId;
    this.dialogOpen = true;
  }
}
