/**
 * Game State Management using Zustand
 */

import { create } from 'zustand';
import { GameState, createInitialGameState, makeMove as makeBoardMove } from '../core/board';
import { Color, Position, Move } from '../core/types';
import { getBestMove, Difficulty } from '../ai/engine';
import { getLegalMoves, evaluateGameStatus, isInCheck } from '../core/rules';

interface GameStore {
  // State
  gameState: GameState;
  selectedPosition: Position | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  inCheck: Position | null;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'pvp' | 'pvai' | 'aivai';

  // Actions
  selectPosition: (position: Position | null) => void;
  makeMove: (from: Position, to: Position) => boolean;
  resetGame: () => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  setGameMode: (mode: 'pvp' | 'pvai' | 'aivai') => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial State
  gameState: createInitialGameState(),
  selectedPosition: null,
  validMoves: [],
  lastMove: null,
  inCheck: null,
  difficulty: 'medium',
  gameMode: 'pvai',

  // Actions
  selectPosition: (position) => {
    const state = get();
    
    if (!position) {
      // Deselect
      set({ selectedPosition: null, validMoves: [] });
      return;
    }

    const piece = state.gameState.board.pieces.find(
      (p) => p.position.file === position.file && p.position.rank === position.rank
    );

    if (!piece) {
      // No piece at position, deselect
      set({ selectedPosition: null, validMoves: [] });
      return;
    }

    // Check if it's the player's turn
    if (piece.color !== state.gameState.board.turn) {
      // Try to capture
      if (state.selectedPosition) {
        const validMoves = getLegalMoves(state.gameState.board, state.selectedPosition);
        const canMoveTo = validMoves.some((m: Position) => m.file === position.file && m.rank === position.rank);
        
        if (canMoveTo) {
          const success = get().makeMove(state.selectedPosition, position);
          if (success) {
            set({ selectedPosition: null, validMoves: [] });
            return;
          }
        }
      }
      set({ selectedPosition: null, validMoves: [] });
      return;
    }

    // Select piece
    const validMoves = getLegalMoves(state.gameState.board, position);
    set({ selectedPosition: position, validMoves });
  },

  makeMove: (from, to) => {
    const state = get();
    const validMoves = getLegalMoves(state.gameState.board, from);
    const canMoveTo = validMoves.some((m: Position) => m.file === to.file && m.rank === to.rank);

    if (!canMoveTo) {
      return false;
    }

    // Make the move
    const piece = state.gameState.board.pieces.find(
      (p) => p.position.file === from.file && p.position.rank === from.rank
    );
    
    if (!piece) return false;

    const move: Move = { from, to, piece: piece.type };

    const newBoard = makeBoardMove(state.gameState.board, move);
    const gameStatus = evaluateGameStatus(newBoard);

    // Check for check
    const opponentColor = newBoard.turn === Color.Red ? Color.Black : Color.Red;
    const inCheckPos = isInCheck(newBoard, opponentColor)
      ? newBoard.pieces.find((p) => p.type === 'general' && p.color === opponentColor)?.position || null
      : null;

    set({
      gameState: {
        board: newBoard,
        status: gameStatus.status,
        winner: gameStatus.winner,
      },
      lastMove: { from, to },
      inCheck: inCheckPos,
    });

    return true;
  },

  resetGame: () => {
    set({
      gameState: createInitialGameState(),
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      inCheck: null,
    });
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
  },

  setGameMode: (mode) => {
    set({ gameMode: mode });
  },
}));

export default useGameStore;
