export const Colors = {
    light: {
      primary: 'bg-blue-600',
      secondary: 'bg-indigo-500',
      text: 'text-gray-900',
      inverseText: 'text-white',
      background: 'bg-white',
      surface: 'bg-gray-100',
      border: 'border-gray-300',
    },
    dark: {
      primary: 'bg-blue-400',
      secondary: 'bg-indigo-300',
      text: 'text-white',
      inverseText: 'text-gray-900',
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      border: 'border-gray-600',
    },
  } as const;
  
  export type ThemeMode = 'light' | 'dark';
  export type ColorKey = keyof typeof Colors.light; // same keys for light and dark
  
  export function getColorClass(theme: ThemeMode, key: ColorKey): string {
    return Colors[theme][key];
  }
  