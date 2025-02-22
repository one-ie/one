export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  
  return {
    r: parseInt(result[1] || '0', 16),
    g: parseInt(result[2] || '0', 16),
    b: parseInt(result[3] || '0', 16),
  };
}

export function getLuminance({ r, g, b }: RGB): number {
  const rs = r / 255;
  const gs = g / 255;
  const bs = b / 255;

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(foreground: RGB, background: RGB): number {
  const l1 = getLuminance(foreground) + 0.05;
  const l2 = getLuminance(background) + 0.05;
  return Math.max(l1, l2) / Math.min(l1, l2);
} 