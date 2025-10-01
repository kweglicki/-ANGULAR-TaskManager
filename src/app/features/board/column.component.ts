import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Column, Task } from '../../domain/types';
import { BoardStore } from '../../state/board.store';
import { NgFor } from '@angular/common';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import type { CdkDrag as _CdkDrag, CdkDropList as _CdkDropList} from '@angular/cdk/drag-drop'; 
import { TaskCardComponent } from './task-card.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-column',
  imports: [NgFor, TaskCardComponent, CdkDropList, CdkDrag, TranslatePipe],
  template: `
    <div>
      <div class="col-header">
        <input id="col-name-{{column.id}}" name="col-name-{{column.id}}" class="input"
           [value]="column.name" (change)="rename(($any($event.target)).value)"
           aria-label="Column name"/>
          <div style="display:flex;gap:6px">
          <span class="badge">{{ tasks.length }}</span>
          <button class="primary" (click)="addTask.emit()">{{ 'board.addTask' | translate }}</button>
          <button class="danger" (click)="removeColumn.emit()">{{ 'board.delete' | translate }}</button>
        </div>
      </div>
      <div cdkDropList [id]="'list-'+column.id"
          [cdkDropListConnectedTo]="connectedIds"
          [cdkDropListData]="tasks"
          (cdkDropListDropped)="drop($event)" aria-label="Task list">
          <app-task-card *ngFor="let t of tasks; trackBy: trackTask" cdkDrag [cdkDragData]="t" [task]="t"
                (remove)="removeTask(t.id)" (edit)="requestEdit.emit($event)"></app-task-card>
      </div>
    </div>
  `
})
export class ColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input() connectedIds: string[] = [];
  @Output() requestEdit = new EventEmitter<Task>();
  @Output() addTask = new EventEmitter<void>();
  @Output() removeColumn = new EventEmitter<void>();
  @Output() renameColumn = new EventEmitter<string>();
  @Output() taskDropped = new EventEmitter<{ id: string; fromColumnId: string; toIndex: number }>();

  private store = inject(BoardStore);
  get tasks(): Task[] { return this.store.tasksByColumn()[this.column.id] ?? []; }

  trackTask = (_: number, t: Task) => t.id;

  rename(name: string) { if (name.trim() && name !== this.column.name) this.renameColumn.emit(name.trim()); }

  drop(ev: CdkDragDrop<Task[]>) {
    if (ev.previousContainer === ev.container) {
      moveItemInArray(ev.container.data, ev.previousIndex, ev.currentIndex);
      this.reindexLocal(ev.container.data);
      this.taskDropped.emit({ id: ev.container.data[ev.currentIndex].id, fromColumnId: this.column.id, toIndex: ev.currentIndex });
    } else {
      const dragged = ev.item.data as Task;
      const fromColumnId = dragged.columnId;
      transferArrayItem(ev.previousContainer.data, ev.container.data, ev.previousIndex, ev.currentIndex);
      this.reindexLocal(ev.previousContainer.data);
      this.reindexLocal(ev.container.data);
      this.taskDropped.emit({ id: dragged.id, fromColumnId, toIndex: ev.currentIndex });
    }
  }

  private reindexLocal(list: Task[]) { list.forEach((t, i) => (t.index = i)); } 

  removeTask(id: string) { this.store.removeTask(id); }
}
