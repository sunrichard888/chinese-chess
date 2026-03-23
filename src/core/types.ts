/**
 * Domain Types for Chinese Chess (象棋)
 * Based on docs/glossary.md
 */

// ============================================================================
// Color - Which side a piece belongs to
// ============================================================================

export const Color = {
  Red: 'red' as const,
  Black: 'black' as const,
} as const;

export type Color = (typeof Color)[keyof typeof Color];

export function isColor(value: string): value is Color {
  return value === Color.Red || value === Color.Black;
}

// ============================================================================
// PieceType - Type of chess piece (7 types)
// ============================================================================

export const PieceType = {
  General: 'general' as const,   // 将/帅
  Advisor: 'advisor' as const,   // 士/仕
  Elephant: 'elephant' as const, // 象/相
  Horse: 'horse' as const,       // 马/馬
  Chariot: 'chariot' as const,   // 车/車
  Cannon: 'cannon' as const,     // 炮/砲
  Soldier: 'soldier' as const,   // 卒/兵
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

export function isPieceType(value: string): value is PieceType {
  return Object.values(PieceType).includes(value as PieceType);
}

// ============================================================================
// Position - Board coordinate (file: 0-8, rank: 0-9)
// ============================================================================

export interface Position {
  readonly file: number;  // 0-8 (9 files)
  readonly rank: number;  // 0-9 (10 ranks)
}

export function createPosition(file: number, rank: number): Position {
  return { file, rank };
}

export function isValidPosition(pos: Position): boolean {
  return (
    typeof pos.file === 'number' &&
    typeof pos.rank === 'number' &&
    pos.file >= 0 &&
    pos.file <= 8 &&
    pos.rank >= 0 &&
    pos.rank <= 9
  );
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.file === b.file && a.rank === b.rank;
}

export function addPosition(pos: Position, offset: { file: number; rank: number }): Position {
  return {
    file: pos.file + offset.file,
    rank: pos.rank + offset.rank,
  };
}

// ============================================================================
// Piece - A chess piece on the board
// ============================================================================

export interface Piece {
  readonly type: PieceType;
  readonly color: Color;
  readonly position: Position;
}

export function createPiece(
  type: PieceType,
  color: Color,
  position: Position
): Piece {
  return { type, color, position };
}

// Board type for AI engine
export interface Board {
  readonly pieces: readonly Piece[];
  readonly turn: Color;
  readonly moveHistory: readonly Move[];
}

export function isPiece(value: unknown): value is Piece {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'color' in value &&
    'position' in value &&
    isPieceType((value as Piece).type) &&
    isColor((value as Piece).color) &&
    isValidPosition((value as Piece).position)
  );
}

// ============================================================================
// Move - A move from one position to another
// ============================================================================

export interface Move {
  readonly from: Position;
  readonly to: Position;
  readonly piece: PieceType;
  readonly captured?: PieceType;
}

export function createMove(
  from: Position,
  to: Position,
  piece: PieceType,
  captured?: PieceType
): Move {
  return { from, to, piece, captured };
}

// ============================================================================
// Utility Types
// ============================================================================

export type File = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Rank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export function fileToFileChar(file: number): string {
  return String.fromCharCode('a'.charCodeAt(0) + file);
}

export function rankToRankString(rank: number): string {
  return (rank + 1).toString();
}

export function positionToString(pos: Position): string {
  return `${fileToFileChar(pos.file)}${rankToRankString(pos.rank)}`;
}
