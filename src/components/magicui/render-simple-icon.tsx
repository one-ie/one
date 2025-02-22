"use client";

import type { HTMLAttributes } from "react";
import { getContrastRatio, hexToRgb } from "./utils";

export interface Icon {
  title: string;
  slug: string;
  svg: string;
  hex: string;
  source: string;
}

interface RenderSimpleIconProps {
  icon: Icon;
  bgHex?: string;
  fallbackHex?: string;
  minContrastRatio?: number;
  size?: number;
  aProps?: HTMLAttributes<HTMLAnchorElement>;
  imgProps?: HTMLAttributes<HTMLImageElement>;
}

export function renderSimpleIcon({
  icon,
  bgHex = "#fff",
  fallbackHex = "#000",
  minContrastRatio = 1,
  size = 42,
  aProps,
  imgProps,
}: RenderSimpleIconProps) {
  const iconColor = `#${icon.hex}`;
  const iconRgb = hexToRgb(iconColor);
  if (!iconRgb) {
    return fallbackHex;
  }

  const bgRgb = hexToRgb(bgHex);
  if (!bgRgb) {
    return fallbackHex;
  }

  const contrast = getContrastRatio(iconRgb, bgRgb);
  const color = contrast >= minContrastRatio ? iconColor : fallbackHex;

  return (
    <a
      key={icon.slug}
      href={icon.source}
      target="_blank"
      rel="noopener noreferrer"
      {...aProps}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(
          icon.svg.replace(/currentColor/g, color)
        )}`}
        alt={icon.title}
        width={size}
        height={size}
        loading="lazy"
        {...imgProps}
      />
    </a>
  );
} 