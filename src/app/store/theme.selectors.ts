import { createFeatureSelector } from '@ngrx/store';
import { ThemeState } from './theme.reducer';

export const selectTheme = createFeatureSelector<ThemeState>('theme');