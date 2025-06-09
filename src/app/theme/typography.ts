export const FontSize = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
  } as const;
  
  export const FontWeight = {
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
    semibold: 'font-semibold',
  } as const;
  
  export const FontFamily = {
    default: 'font-sans',
    mono: 'font-mono',
    serif: 'font-serif',
  } as const;
  
  export type FontSizeKey = keyof typeof FontSize;
  export type FontWeightKey = keyof typeof FontWeight;
  export type FontFamilyKey = keyof typeof FontFamily;

export function getFontSizeClass(key: FontSizeKey): string {
    return FontSize[key];
}
export function getFontWeightClass(key: FontWeightKey): string {
    return FontWeight[key];
}
export function getFontFamilyClass(key: FontFamilyKey): string {
    return FontFamily[key];
}
export function getFontClass(size?: FontSizeKey, weight?: FontWeightKey, family?: FontFamilyKey): string {
    return `${getFontSizeClass(size!)} ${getFontWeightClass(weight!)} ${getFontFamilyClass(family!)}`;
}