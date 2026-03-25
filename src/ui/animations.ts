/**
 * Animation system for Chinese Chess
 * 
 * Provides animation state management for:
 * - Piece move (slide from → to)
 * - Capture (burst particles at capture position)
 * - Check (pulsing red glow on general)
 * - Checkmate (dramatic full-board effect)
 */

export interface MoveAnimation {
  type: 'move';
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startTime: number;
  duration: number; // ms
}

export interface CaptureAnimation {
  type: 'capture';
  x: number;
  y: number;
  startTime: number;
  duration: number;
}

export interface CheckAnimation {
  type: 'check';
  x: number;
  y: number;
}

export interface CheckmateAnimation {
  type: 'checkmate';
  x: number;
  y: number;
  startTime: number;
  duration: number;
  winner: 'red' | 'black';
}

export type BoardAnimation = MoveAnimation | CaptureAnimation | CheckAnimation | CheckmateAnimation;

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

// Animation durations (ms)
export const ANIM_DURATION = {
  move: 280,
  capture: 450,
  checkmate: 1500,
} as const;
