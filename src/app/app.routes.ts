import { Routes } from '@angular/router';
import { BoardPageComponent } from './features/board/board.page';

export const routes: Routes = [
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: 'board', component: BoardPageComponent },
  { path: '**', redirectTo: 'board' }
];