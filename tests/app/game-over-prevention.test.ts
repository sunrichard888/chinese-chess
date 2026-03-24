/**
 * Game Over Prevention Tests - Issue #2 Fix
 * Verify that moves cannot be made when the game is already over
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { useGameStore } from '../../src/app/game-store';
import { Color } from '../../src/core/types';

describe('Game Over Prevention - Issue #2 Fix', () => {
  beforeEach(() => {
    // Reset the store before each test
    useGameStore.setState({
      gameState: useGameStore.getState().gameState,
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      inCheck: null,
      history: [],
      historyPosition: 0,
    });
  });

  describe('Prevent Moves After Game Over', () => {
    it('should prevent moves when status is checkmate', () => {
      // Manually set game state to checkmate
      const state = useGameStore.getState();
      const originalGameState = state.gameState;
      
      useGameStore.setState({
        gameState: {
          ...originalGameState,
          status: 'checkmate',
          winner: Color.Red,
        },
      });

      // Try to make a move (Red's initial soldier move)
      const success = useGameStore.getState().makeMove(
        { file: 0, rank: 3 },
        { file: 0, rank: 4 }
      );

      // Move should be rejected
      expect(success).toBe(false);
      
      // Clean up
      useGameStore.setState({ gameState: originalGameState });
    });

    it('should prevent moves when status is stalemate', () => {
      const state = useGameStore.getState();
      const originalGameState = state.gameState;
      
      useGameStore.setState({
        gameState: {
          ...originalGameState,
          status: 'stalemate',
          winner: undefined,
        },
      });

      const success = useGameStore.getState().makeMove(
        { file: 0, rank: 3 },
        { file: 0, rank: 4 }
      );

      expect(success).toBe(false);
      
      useGameStore.setState({ gameState: originalGameState });
    });

    it('should prevent moves when status is draw', () => {
      const state = useGameStore.getState();
      const originalGameState = state.gameState;
      
      useGameStore.setState({
        gameState: {
          ...originalGameState,
          status: 'draw',
          winner: undefined,
        },
      });

      const success = useGameStore.getState().makeMove(
        { file: 0, rank: 3 },
        { file: 0, rank: 4 }
      );

      expect(success).toBe(false);
      
      useGameStore.setState({ gameState: originalGameState });
    });

    it('should allow moves when game is still playing', () => {
      const state = useGameStore.getState();
      
      // Reset to initial state (playing)
      useGameStore.setState({
        gameState: {
          ...state.gameState,
          status: 'playing',
          winner: undefined,
        },
      });

      // Try a valid initial move (Red soldier forward)
      const success = useGameStore.getState().makeMove(
        { file: 0, rank: 3 },
        { file: 0, rank: 4 }
      );

      // Move should be accepted
      expect(success).toBe(true);
    });
  });

  describe('Game State After Checkmate', () => {
    it('should maintain game over status after attempted move', () => {
      const state = useGameStore.getState();
      const originalGameState = state.gameState;
      
      // Set to checkmate
      useGameStore.setState({
        gameState: {
          ...originalGameState,
          status: 'checkmate',
          winner: Color.Red,
        },
      });

      // Try to make a move
      useGameStore.getState().makeMove(
        { file: 0, rank: 3 },
        { file: 0, rank: 4 }
      );

      // Game state should still be checkmate
      const currentState = useGameStore.getState().gameState;
      expect(currentState.status).toBe('checkmate');
      expect(currentState.winner).toBe(Color.Red);
      
      useGameStore.setState({ gameState: originalGameState });
    });
  });
});
