import { createAction, props } from '@ngrx/store';
import { ThemeMode } from '../theme/colors';

export const setTheme = createAction(
  '[Theme] Set Theme',
  props<{ theme: ThemeMode }>()
);

export const toggleTheme = createAction(
  '[Theme] Toggle Theme'
);