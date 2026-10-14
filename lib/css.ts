import type { CSSProperties } from 'react';

/** Lets JSX pass CSS custom properties: style={v({ '--i': 2 })} */
export const v = (vars: Record<string, string | number>): CSSProperties => vars as CSSProperties;
