import { Component, computed, inject } from '@angular/core';
import { BoardStore } from '../../state/board.store';
import { NgFor, NgIf } from '@angular/common';
import { ColumnComponent } from './column.component';
import { TaskDialogComponent } from './task-dialog.component';
import { CdkDropList, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-board-page',
  imports: [NgFor, NgIf, ColumnComponent, TaskDialogComponent, CdkDropList, TranslatePipe],
  template: `
    <div class="container" aria-live="polite">
      <div class="cols" cdkDropList (cdkDropListDropped)="dropCol($event)" [cdkDropListData]="colIds()">
        <div class="col" *ngFor="let col of store.columns(); trackBy: trackCol" cdkDropList [cdkDropListData]="col.id">
          <app-column [column]="col"
                      (addTask)="openDialog(col.id)"
                      (removeColumn)="store.removeColumn(col.id)"
                      (renameColumn)="store.renameColumn(col.id, $event)"
                      (taskDropped)="onTaskDrop($event, col.id)"></app-column>
        </div>
        <div class="col" style="min-width:240px;display:flex;align-items:center;justify-content:center">
          <button class="ghost" (click)="addColumn()">{{ 'board.addColumn' | translate }}</button>
        </div>
      </div>

      <app-task-dialog *ngIf="dialogOpen" [columnId]="dialogColId!" (close)="dialogOpen=false" (save)="saveTask($event)"></app-task-dialog>
    </div>
  `
})
export class BoardPageComponent {
  store = inject(BoardStore);
  dialogOpen = false;
  dialogColId?: string;

  colIds = computed(() => this.store.columns().map(c => c.id));

  trackCol = (_: number, c: any) => c.id;

  addColumn() {
    const name = prompt('Column name');
    if (name?.trim()) this.store.addColumn(name.trim());
  }

  openDialog(colId: string) { this.dialogColId = colId; this.dialogOpen = true; }
  saveTask(e: { columnId: string; title: string; description?: string; priority: 'low'|'medium'|'high'; tags: string[] }) {
    this.store.addTask(e.columnId, e);
    this.dialogOpen = false;
  }

  dropCol(ev: CdkDragDrop<string[]>) {
    // kolumny: przekładamy po ID; dlaczego: stabilne identyfikatory minimalizują konflikty
    const ids = [...this.colIds()];
    moveItemInArray(ids, ev.previousIndex, ev.currentIndex);
    this.store.reorderColumns(ids);
  }

  onTaskDrop(e: { id: string; fromColumnId: string; toIndex: number }, toColumnId: string) {
    this.store.moveTask(e.id, toColumnId, e.toIndex);
  }
}
