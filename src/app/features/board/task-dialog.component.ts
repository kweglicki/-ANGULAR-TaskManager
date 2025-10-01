import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Column, Task } from '../../domain/types';

@Component({
  standalone: true,
  selector: 'app-task-dialog',
  imports: [ReactiveFormsModule, NgFor, NgIf, TranslatePipe],
  template: `
    <div role="dialog" aria-modal="true" class="col" style="display:inline-table;max-width:520px;position:fixed;inset:0;margin:auto;box-shadow:0 10px 30px rgba(0,0,0,.5)">      <h3>{{ mode === 'edit' ? ('dialog.editTitle' | translate) : ('dialog.title' | translate) }}</h3>
    <form [formGroup]="form" (ngSubmit)="submit()">
        <label>{{ 'dialog.fields.title' | translate }}</label>
        <input class="input" formControlName="title" required />

        <label>{{ 'dialog.fields.desc' | translate }}</label>
        <textarea class="input" formControlName="description" rows="4"></textarea>

        <label>{{ 'dialog.fields.priority' | translate }}</label>
        <select class="select" formControlName="priority">
          <option value="low">{{ 'priority.low' | translate }}</option>
          <option value="medium">{{ 'priority.medium' | translate }}</option>
          <option value="high">{{ 'priority.high' | translate }}</option>
        </select>

        <label>{{ 'dialog.fields.tags' | translate }}</label>
        <input class="input" formControlName="tags" placeholder="design, api" />

        <ng-container *ngIf="mode == 'edit'">
          <label>{{ 'dialog.fields.moveTo' | translate }}</label>
          <select class="select" formControlName="columnId">
            <option *ngFor="let c of columns" [value]="c.id">{{ c.name }}</option>
          </select>
        </ng-container>

        <hr />
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button type="button" class="ghost" (click)="close.emit()">{{ 'dialog.cancel' | translate }}</button>
          <button type="submit" class="primary" [disabled]="form.invalid">{{ 'dialog.save' | translate }}</button>
        </div>
      </form>
    </div>
  `
})
export class TaskDialogComponent implements OnChanges {
  @Input({ required: true }) columnId!: string;
  @Input() columns: Column[] = [];
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initial?: Task;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id?: string; columnId: string; title: string; description?: string; priority: 'low'|'medium'|'high'; tags: string[] }>();

  private fb = new FormBuilder();
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    priority: ['medium' as 'low'|'medium'|'high'],
    tags: [''],
    columnId: ['']
  });

  ngOnChanges(changes: SimpleChanges): void {
    const t = this.initial;
    
    const columnId = this.mode === 'edit' && t ? t.columnId : this.columnId;
    
    this.form.patchValue({
      title: t?.title ?? '',
      description: t?.description ?? '',
      priority: t?.priority ?? 'medium',
      tags: (t?.tags ?? []).join(', '),
      columnId: columnId || this.columnId  // Dodaj fallback na this.columnId
    }, { emitEvent: false });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const tags = v.tags.split(',').map(s => s.trim()).filter(Boolean);
    
    const columnId = this.mode === 'create' ? this.columnId : v.columnId;
    
    this.save.emit({
      id: this.initial?.id,
      columnId: columnId,
      title: v.title.trim(),
      description: v.description?.trim(),
      priority: v.priority,
      tags
    });
  }
}