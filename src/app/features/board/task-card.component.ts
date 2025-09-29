import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../domain/types';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-task-card',
  imports: [NgIf, TranslatePipe],
  template: `
    <div class="card" role="article" [attr.aria-labelledby]="'t-' + task.id">
      <div style="display:flex;justify-content:space-between;gap:6px;align-items:center">
        <div>
          <strong id="{{'t-' + task.id}}">{{ task.title }}</strong>
          <div *ngIf="task.tags?.length"><small># {{ task.tags.join(', ') }}</small></div>
        </div>
        <span class="badge">{{ task.priority }}</span>
      </div>
      <p *ngIf="task.description">{{ task.description }}</p>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="ghost" (click)="edit.emit(task)">{{ 'board.edit' | translate }}</button>
        <button class="danger" (click)="remove.emit(task.id)">{{ 'board.delete' | translate }}</button>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() remove = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();
}
