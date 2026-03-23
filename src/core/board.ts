/**
 * Board and GameState for Chinese Chess
 * 
 * Board: 9 files (0-8) × 10 ranks (0-9)
 */

import { Piece, Position, Color, PieceType, Move, createPiece, createPosition } from './types';

export { isValidPosition } from './types';

// ============================================================================
// Board - Current state of all pieces
// ============================================================================

export interface Board {
  readonly pieces: readonly Piece[];
  readonly turn: Color;
  readonly moveHistory: readonly Move[];
}

// ============================================================================
// GameStatus - Current game state
// ============================================================================

export const GameStatus = {
  Playing: 'playing' as const,
  Check: 'check' as const,
  Checkmate: 'checkmate' as const,
  Stalemate: 'stalemate' as const,
  Draw: 'draw' as const,
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

// ============================================================================
// GameState - Complete game state
// ============================================================================

export interface GameState {
  readonly board: Board;
  readonly status: GameStatus;
  readonly winner?: Color;
}

// ============================================================================
// Initial Board Setup (Standard Chinese Chess)
// ============================================================================

/**
 * Standard starting position:
 * - 9 files (0-8), 10 ranks (0-9)
 * - Red: ranks 0-4 (bottom)
 * - Black: ranks 5-9 (top)
 */
export function createInitialBoard(): Board {
  const pieces: Piece[] = [];

  // Black pieces (ranks 5-9, top)
  // Back rank (rank 9): Chariot-Horse-Elephant-Advisor-General-Advisor-Elephant-Horse-Chariot
  pieces.push(createPiece(PieceType.Chariot, Color.Black, createPosition(0, 9)));
  pieces.push(createPiece(PieceType.Horse, Color.Black, createPosition(1, 9)));
  pieces.push(createPiece(PieceType.Elephant, Color.Black, createPosition(2, 9)));
  pieces.push(createPiece(PieceType.Advisor, Color.Black, createPosition(3, 9)));
  pieces.push(createPiece(PieceType.General, Color.Black, createPosition(4, 9)));
  pieces.push(createPiece(PieceType.Advisor, Color.Black, createPosition(5, 9)));
  pieces.push(createPiece(PieceType.Elephant, Color.Black, createPosition(6, 9)));
  pieces.push(createPiece(PieceType.Horse, Color.Black, createPosition(7, 9)));
  pieces.push(createPiece(PieceType.Chariot, Color.Black, createPosition(8, 9)));

  // Cannons (rank 7)
  pieces.push(createPiece(PieceType.Cannon, Color.Black, createPosition(1, 7)));
  pieces.push(createPiece(PieceType.Cannon, Color.Black, createPosition(7, 7)));

  // Soldiers (rank 6)
  for (let file = 0; file <= 8; file += 2) {
    pieces.push(createPiece(PieceType.Soldier, Color.Black, createPosition(file, 6)));
  }

  // Red pieces (ranks 0-4, bottom)
  // Back rank (rank 0): Chariot-Horse-Elephant-Advisor-General-Advisor-Elephant-Horse-Chariot
  pieces.push(createPiece(PieceType.Chariot, Color.Red, createPosition(0, 0)));
  pieces.push(createPiece(PieceType.Horse, Color.Red, createPosition(1, 0)));
  pieces.push(createPiece(PieceType.Elephant, Color.Red, createPosition(2, 0)));
  pieces.push(createPiece(PieceType.Advisor, Color.Red, createPosition(3, 0)));
  pieces.push(createPiece(PieceType.General, Color.Red, createPosition(4, 0)));
  pieces.push(createPiece(PieceType.Advisor, Color.Red, createPosition(5, 0)));
  pieces.push(createPiece(PieceType.Elephant, Color.Red, createPosition(6, 0)));
  pieces.push(createPiece(PieceType.Horse, Color.Red, createPosition(7, 0)));
  pieces.push(createPiece(PieceType.Chariot, Color.Red, createPosition(8, 0)));

  // Cannons (rank 2)
  pieces.push(createPiece(PieceType.Cannon, Color.Red, createPosition(1, 2)));
  pieces.push(createPiece(PieceType.Cannon, Color.Red, createPosition(7, 2)));

  // Soldiers (rank 3)
  for (let file = 0; file <= 8; file += 2) {
    pieces.push(createPiece(PieceType.Soldier, Color.Red, createPosition(file, 3)));
  }

  return {
    pieces,
    turn: Color.Red,
    moveHistory: [],
  };
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    status: GameStatus.Playing,
    winner: undefined,
  };
}

// ============================================================================
// Board Operations
// ============================================================================

export function getPieceAt(board: Board, position: Position): Piece | undefined {
  return board.pieces.find(
    (p) => p.position.file === position.file && p.position.rank === position.rank
  );
}

export function getPiecesByColor(board: Board, color: Color): Piece[] {
  return board.pieces.filter((p) => p.color === color);
}

export function findGeneral(board: Board, color: Color): Position | undefined {
  const general = board.pieces.find(
    (p) => p.type === PieceType.General && p.color === color
  );
  return general?.position;
}

export function makeMove(board: Board, move: Move): Board {
  const movingPiece = getPieceAt(board, move.from);
  if (!movingPiece) {
    return board;
  }

  // Create new pieces array with moved piece
  const newPieces = board.pieces
    .filter(
      (p) =>
        !(p.position.file === move.to.file && p.position.rank === move.to.rank)
    )
    .map((p) => {
      if (p.position.file === move.from.file && p.position.rank === move.from.rank) {
        return { ...p, position: move.to };
      }
      return p;
    });

  return {
    pieces: newPieces,
    turn: board.turn === Color.Red ? Color.Black : Color.Red,
    moveHistory: [...board.moveHistory, move],
  };
}

