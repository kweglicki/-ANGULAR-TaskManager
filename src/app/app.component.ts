import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslatePipe],
  template: `
    <div class="toolbar" role="toolbar" aria-label="App Toolbar">
      <strong>TaskManager</strong>
      <div style="display:flex;gap:8px;align-items:center">
        <label for="lang">{{ 'lang.label' | translate }}</label>
        <select id="lang" class="select" [value]="lang()" (change)="setLang(($any($event.target)).value)">
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
    <router-outlet />
  `
})
export class AppComponent {
  private readonly i18n = inject(TranslateService);
  private readonly _lang = signal(this.i18n.currentLang || 'pl');
  lang = computed(() => this._lang());

  constructor() {
    this.i18n.addLangs(['pl', 'en']);
    this.i18n.setDefaultLang('pl');
    this.i18n.use(this._lang());
  }

  setLang(l: string) {
    this._lang.set(l);
    this.i18n.use(l);
  }
}
