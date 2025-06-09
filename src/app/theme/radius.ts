export const Radius = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  } as const;
  
export type RadiusKey = keyof typeof Radius;

export function getRadiusClass(key: RadiusKey): string {
    return Radius[key];
}