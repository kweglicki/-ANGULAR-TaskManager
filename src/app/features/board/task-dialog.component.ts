import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-task-dialog',
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div role="dialog" aria-modal="true" class="col" style="max-width:520px;position:fixed;inset:0;margin:auto;box-shadow:0 10px 30px rgba(0,0,0,.5)">
      <h3>{{ 'dialog.title' | translate }}</h3>
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

        <hr />
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <button type="button" class="ghost" (click)="close.emit()">{{ 'dialog.cancel' | translate }}</button>
          <button type="submit" class="primary" [disabled]="form.invalid">{{ 'dialog.save' | translate }}</button>
        </div>
      </form>
    </div>
  `
})
export class TaskDialogComponent {
  @Input({ required: true }) columnId!: string;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ columnId: string; title: string; description?: string; priority: 'low'|'medium'|'high'; tags: string[] }>();

  private fb = new FormBuilder();
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    priority: ['medium' as 'low'|'medium'|'high'],
    tags: ['']
  });

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const tags = v.tags.split(',').map(s => s.trim()).filter(Boolean);
    this.save.emit({ columnId: this.columnId, title: v.title.trim(), description: v.description?.trim(), priority: v.priority, tags });
  }
}