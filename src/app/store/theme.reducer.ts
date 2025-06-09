import { createReducer, on } from '@ngrx/store';
import * as ThemeActions from './theme.actions';
import { ThemeMode } from '../theme/colors';

export interface ThemeState {
  theme: ThemeMode;
}

export const initialState: ThemeState = {
  theme: 'light', // Valeur par défaut
};

export const themeReducer = createReducer(
  initialState,
  on(ThemeActions.setTheme, (state, { theme }) => {
    // Vérifier que la valeur est bien 'light' ou 'dark'
    const validTheme = theme === 'light' || theme === 'dark' ? theme : state.theme;
    return { ...state, theme: validTheme };
  }),
  on(ThemeActions.toggleTheme, (state) => ({ 
    ...state, 
    theme: state.theme === 'light' ? ('dark' as ThemeMode) : ('light' as ThemeMode) 
  }))
);