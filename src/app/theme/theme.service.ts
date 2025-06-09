import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectTheme } from '../store/theme.selectors';
import * as ThemeActions from '../store/theme.actions';
import { ThemeMode } from './colors';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(private store: Store) {
    // Écoute le changement de thème système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
      const newTheme: ThemeMode = event.matches ? 'dark' : 'light';
      this.setTheme(newTheme);
    });
  }

  theme$ = this.store.select(selectTheme);

  setTheme(theme: ThemeMode) {
    this.store.dispatch(ThemeActions.setTheme({ theme }));
    // document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  toggleTheme() {
    this.store.dispatch(ThemeActions.toggleTheme());
  }
}
