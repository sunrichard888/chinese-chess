/**
 * Move Generation for Chinese Chess
 * 
 * Implements movement rules for all 7 piece types
 */

import { Board, Position, Color, PieceType, Move } from './types';
import { getPieceAt, getPiecesByColor, findGeneral, isValidPosition } from './board';

// ============================================================================
// Helper Functions
// ============================================================================

function addPosition(pos: Position, offset: { file: number; rank: number }): Position {
  return {
    file: pos.file + offset.file,
    rank: pos.rank + offset.rank,
  };
}

function canMoveTo(board: Board, _from: Position, to: Position, color: Color): boolean {
  const targetPiece = getPieceAt(board, to);
  return !targetPiece || targetPiece.color !== color;
}

function scanLine(
  board: Board,
  from: Position,
  direction: { file: number; rank: number },
  captureOnly: boolean = false
): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, from);
  if (!piece) return moves;

  let current = addPosition(from, direction);

  while (isValidPosition(current)) {
    const targetPiece = getPieceAt(board, current);

    if (!targetPiece) {
      if (!captureOnly) {
        moves.push(current);
      }
    } else {
      // Found a piece
      if (targetPiece.color !== piece.color) {
        moves.push(current); // Can capture
      }
      break; // Blocked
    }

    current = addPosition(current, direction);
  }

  return moves;
}

// ============================================================================
// Chariot (车) Move Generation
// ============================================================================

export function getChariotMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.Chariot) return moves;

  const directions = [
    { file: 0, rank: -1 }, // Up
    { file: 0, rank: 1 },  // Down
    { file: -1, rank: 0 }, // Left
    { file: 1, rank: 0 },  // Right
  ];

  for (const dir of directions) {
    moves.push(...scanLine(board, position, dir));
  }

  return moves;
}

// ============================================================================
// Horse (马) Move Generation
// ============================================================================

const HORSE_MOVES = [
  // { moveOffset, hobbleOffset } - move is the L-shape, hobble is the blocking position
  { move: { file: -1, rank: -2 }, hobble: { file: 0, rank: -1 } },  // Up-left
  { move: { file: 1, rank: -2 }, hobble: { file: 0, rank: -1 } },   // Up-right
  { move: { file: -2, rank: -1 }, hobble: { file: -1, rank: 0 } },  // Left-up
  { move: { file: -2, rank: 1 }, hobble: { file: -1, rank: 0 } },   // Left-down
  { move: { file: -1, rank: 2 }, hobble: { file: 0, rank: 1 } },    // Down-left
  { move: { file: 1, rank: 2 }, hobble: { file: 0, rank: 1 } },     // Down-right
  { move: { file: 2, rank: -1 }, hobble: { file: 1, rank: 0 } },    // Right-up
  { move: { file: 2, rank: 1 }, hobble: { file: 1, rank: 0 } },     // Right-down
];

export function getHorseMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.Horse) return moves;

  for (const { move, hobble } of HORSE_MOVES) {
    // Check hobbling leg position
    const hobblePos = addPosition(position, hobble);

    // If hobble position has any piece, this direction is blocked
    if (getPieceAt(board, hobblePos)) {
      continue;
    }

    // Check target position
    const targetPos = addPosition(position, move);

    // Validate board boundaries
    if (!isValidPosition(targetPos)) {
      continue;
    }

    // Check if target has own piece (cannot capture own)
    if (canMoveTo(board, position, targetPos, piece.color)) {
      moves.push(targetPos);
    }
  }

  return moves;
}

// ============================================================================
// Cannon (炮) Move Generation
// ============================================================================

export function getCannonMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.Cannon) return moves;

  const directions = [
    { file: 0, rank: -1 }, // Up
    { file: 0, rank: 1 },  // Down
    { file: -1, rank: 0 }, // Left
    { file: 1, rank: 0 },  // Right
  ];

  for (const dir of directions) {
    let screenFound = false;
    let current = addPosition(position, dir);

    while (isValidPosition(current)) {
      const targetPiece = getPieceAt(board, current);

      if (!screenFound) {
        // Moving: stop at first piece
        if (targetPiece) {
          screenFound = true;
        } else {
          moves.push(current);
        }
      } else {
        // Capturing: can capture first enemy piece
        if (targetPiece) {
          if (targetPiece.color !== piece.color) {
            moves.push(current);
          }
          break;
        }
      }
      current = addPosition(current, dir);
    }
  }

  return moves;
}

// ============================================================================
// Advisor (士) Move Generation
// ============================================================================

function isInPalace(pos: Position, color: Color): boolean {
  const palaceRange = color === Color.Red
    ? { fileMin: 3, fileMax: 5, rankMin: 0, rankMax: 2 }
    : { fileMin: 3, fileMax: 5, rankMin: 7, rankMax: 9 };

  return (
    pos.file >= palaceRange.fileMin &&
    pos.file <= palaceRange.fileMax &&
    pos.rank >= palaceRange.rankMin &&
    pos.rank <= palaceRange.rankMax
  );
}

export function getAdvisorMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.Advisor) return moves;

  const diagonals = [
    { file: -1, rank: -1 },
    { file: -1, rank: 1 },
    { file: 1, rank: -1 },
    { file: 1, rank: 1 },
  ];

  for (const diag of diagonals) {
    const target = addPosition(position, diag);
    if (isInPalace(target, piece.color) && canMoveTo(board, position, target, piece.color)) {
      moves.push(target);
    }
  }

  return moves;
}

// ============================================================================
// Elephant (象) Move Generation
// ============================================================================

const ELEPHANT_MOVES = [
  { move: { file: -2, rank: -2 }, eye: { file: -1, rank: -1 } },
  { move: { file: -2, rank: 2 }, eye: { file: -1, rank: 1 } },
  { move: { file: 2, rank: -2 }, eye: { file: 1, rank: -1 } },
  { move: { file: 2, rank: 2 }, eye: { file: 1, rank: 1 } },
];

export function getElephantMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.Elephant) return moves;

  // Elephant cannot cross river
  const maxRank = piece.color === Color.Red ? 4 : 5;
  const minRank = piece.color === Color.Red ? 0 : 5;

  for (const { move, eye } of ELEPHANT_MOVES) {
    // Check eye position (blocking point)
    const eyePos = addPosition(position, eye);
    if (getPieceAt(board, eyePos)) {
      continue; // Eye is blocked
    }

    // Check target position
    const targetPos = addPosition(position, move);

    // Validate board boundaries
    if (!isValidPosition(targetPos)) {
      continue;
    }

    // Check river constraint
    if (targetPos.rank < minRank || targetPos.rank > maxRank) {
      continue; // Crossed river
    }

    // Check if target has own piece
    if (canMoveTo(board, position, targetPos, piece.color)) {
      moves.push(targetPos);
    }
  }

  return moves;
}

// ============================================================================
// General (将/帅) Move Generation
// ============================================================================

export function getGeneralMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.General) return moves;

  const orthogonals = [
    { file: 0, rank: -1 },
    { file: 0, rank: 1 },
    { file: -1, rank: 0 },
    { file: 1, rank: 0 },
  ];

  for (const orth of orthogonals) {
    const target = addPosition(position, orth);
    if (isInPalace(target, piece.color) && canMoveTo(board, position, target, piece.color)) {
      // Check flying general rule
      if (!wouldCauseFlyingGeneral(board, position, target, piece.color)) {
        moves.push(target);
      }
    }
  }

  return moves;
}

function wouldCauseFlyingGeneral(
  board: Board,
  from: Position,
  to: Position,
  color: Color
): boolean {
  // Simulate move
  const simulatedBoard: Board = {
    ...board,
    pieces: board.pieces.map(p => {
      if (p.position.file === from.file && p.position.rank === from.rank) {
        return { ...p, position: to };
      }
      return p;
    }),
  };

  const opponentColor = color === Color.Red ? Color.Black : Color.Red;
  const opponentGeneral = findGeneral(simulatedBoard, opponentColor);

  if (!opponentGeneral) return false;

  // Check if generals face each other directly (same file, no pieces between)
  if (to.file !== opponentGeneral.file) return false;

  // Check if there are pieces between the two generals
  const minRank = Math.min(to.rank, opponentGeneral.rank);
  const maxRank = Math.max(to.rank, opponentGeneral.rank);

  for (let rank = minRank + 1; rank < maxRank; rank++) {
    if (getPieceAt(simulatedBoard, { file: to.file, rank })) {
      return false; // There's a piece between
    }
  }

  return true; // Flying general!
}

// ============================================================================
// Soldier (兵/卒) Move Generation
// ============================================================================

export function getSoldierMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const piece = getPieceAt(board, position);
  if (!piece || piece.type !== PieceType.Soldier) return moves;

  const forward = piece.color === Color.Red ? 1 : -1;
  const crossedRiver = piece.color === Color.Red
    ? position.rank >= 5
    : position.rank <= 4;

  // Forward move (always allowed)
  const forwardPos = addPosition(position, { file: 0, rank: forward });
  if (isValidPosition(forwardPos) && canMoveTo(board, position, forwardPos, piece.color)) {
    moves.push(forwardPos);
  }

  // Horizontal moves (only after crossing river)
  if (crossedRiver) {
    const leftPos = addPosition(position, { file: -1, rank: 0 });
    if (isValidPosition(leftPos) && canMoveTo(board, position, leftPos, piece.color)) {
      moves.push(leftPos);
    }

    const rightPos = addPosition(position, { file: 1, rank: 0 });
    if (isValidPosition(rightPos) && canMoveTo(board, position, rightPos, piece.color)) {
      moves.push(rightPos);
    }
  }

  return moves;
}

// ============================================================================
// Unified Move Generation
// ============================================================================

export function getValidMoves(board: Board, position: Position): Position[] {
  const piece = getPieceAt(board, position);
  if (!piece) return [];

  switch (piece.type) {
    case PieceType.Chariot:
      return getChariotMoves(board, position);
    case PieceType.Horse:
      return getHorseMoves(board, position);
    case PieceType.Cannon:
      return getCannonMoves(board, position);
    case PieceType.Advisor:
      return getAdvisorMoves(board, position);
    case PieceType.Elephant:
      return getElephantMoves(board, position);
    case PieceType.General:
      return getGeneralMoves(board, position);
    case PieceType.Soldier:
      return getSoldierMoves(board, position);
    default:
      return [];
  }
}

export function getAllLegalMoves(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  const pieces = getPiecesByColor(board, color);

  for (const piece of pieces) {
    const validMoves = getValidMoves(board, piece.position);
    for (const to of validMoves) {
      const captured = getPieceAt(board, to);
      moves.push({ from: piece.position, to, piece: piece.type, captured: captured?.type });
    }
  }

  return moves;
}
