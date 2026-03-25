/**
 * Animation system for Chinese Chess
 */

// Easing functions
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const p = 0.3;
  return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// Animation durations (ms)
export const ANIM_DURATION = {
  move: 280,
  capture: 450,
  checkmate: 1500,
  announcement: 1800,   // total time for text announcement
  announceFadeIn: 300,   // scale up + fade in
  announceHold: 1200,    // hold visible
  announceFadeOut: 300,  // fade out
} as const;

/** Announcement overlay state */
export interface Announcement {
  text: string;
  subText?: string;
  color: string;       // main text color
  glowColor: string;   // glow/shadow color
  startTime: number;
  duration: number;
}
