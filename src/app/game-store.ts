/**
 * Game State Management using Zustand
 */

import { create } from 'zustand';
import { GameState, createInitialGameState, makeMove as makeBoardMove } from '../core/board';
import { Color, Position, Move } from '../core/types';
import { getLegalMoves, evaluateGameStatus, isInCheck } from '../core/rules';
import { AudioManager, loadSoundPreset } from '../audio/audio-manager';

interface GameStore {
  // State
  gameState: GameState;
  selectedPosition: Position | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  inCheck: Position | null;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'pvp' | 'pvai' | 'aivai';
  audioManager: AudioManager | null;
  
  // Undo/Redo state
  history: GameState[];
  historyPosition: number;

  // Actions
  selectPosition: (position: Position | null) => void;
  makeMove: (from: Position, to: Position) => boolean;
  resetGame: () => void;
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  setGameMode: (mode: 'pvp' | 'pvai' | 'aivai') => void;
  initializeAudio: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  undo: () => boolean;
  redo: () => boolean;
  getHistoryPosition: () => number;
  getMoveHistory: () => readonly Move[];
  saveGame: (slotName: string) => boolean;
  loadGame: (slotName: string) => boolean;
  listSaves: () => string[];
  deleteSave: (slotName: string) => boolean;
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
  audioManager: null,
  history: [],
  historyPosition: 0,

  // Audio Actions
  initializeAudio: () => {
    const audioManager = new AudioManager();
    loadSoundPreset(audioManager, 'default');
    set({ audioManager });
  },

  setVolume: (volume) => {
    const state = get();
    if (state.audioManager) {
      state.audioManager.setVolume(volume);
    }
  },

  toggleMute: () => {
    const state = get();
    if (state.audioManager) {
      state.audioManager.toggleMute();
    }
  },

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
    
    // Prevent moves when game is already over (Issue #2 fix)
    if (state.gameState.status === 'checkmate' || 
        state.gameState.status === 'stalemate' || 
        state.gameState.status === 'draw') {
      console.warn('Cannot make move: game is already over');
      return false;
    }
    
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

    // Check if this is a capture move
    const capturedPiece = state.gameState.board.pieces.find(
      (p) => p.position.file === to.file && p.position.rank === to.rank
    );

    const move: Move = { from, to, piece: piece.type, captured: capturedPiece?.type };

    const newBoard = makeBoardMove(state.gameState.board, move);
    const gameStatus = evaluateGameStatus(newBoard);

    // Play sound
    if (state.audioManager) {
      if (capturedPiece) {
        state.audioManager.play('capture');
      } else {
        state.audioManager.play('move');
      }
      
      // Play check sound if in check
      if (gameStatus.status === 'check') {
        state.audioManager.play('check');
      }
    }

    // Check for check
    const opponentColor = newBoard.turn === Color.Red ? Color.Black : Color.Red;
    const inCheckPos = isInCheck(newBoard, opponentColor)
      ? newBoard.pieces.find((p) => p.type === 'general' && p.color === opponentColor)?.position || null
      : null;

    // Save current state to history before making move
    const newHistory = state.history.slice(0, state.historyPosition);
    newHistory.push(state.gameState);

    set({
      gameState: {
        board: newBoard,
        status: gameStatus.status,
        winner: gameStatus.winner,
      },
      lastMove: { from, to },
      inCheck: inCheckPos,
      history: newHistory,
      historyPosition: newHistory.length,
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
      history: [],
      historyPosition: 0,
    });
  },

  undo: () => {
    const state = get();
    
    if (state.historyPosition <= 0 || state.history.length === 0) {
      return false;
    }

    // Get previous state from history
    const previousState = state.history[state.historyPosition - 1];
    
    set({
      gameState: previousState,
      historyPosition: state.historyPosition - 1,
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      inCheck: null,
    });

    return true;
  },

  redo: () => {
    const state = get();
    
    if (state.historyPosition >= state.history.length) {
      return false;
    }

    // Get next state from history
    const nextState = state.history[state.historyPosition];
    
    set({
      gameState: nextState,
      historyPosition: state.historyPosition + 1,
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      inCheck: null,
    });

    return true;
  },

  getHistoryPosition: () => {
    return get().historyPosition;
  },

  getMoveHistory: () => {
    return get().gameState.board.moveHistory;
  },

  saveGame: (slotName) => {
    const state = get();
    
    try {
      const saveData = {
        gameState: state.gameState,
        timestamp: new Date().toISOString(),
        moveCount: state.gameState.board.moveHistory.length,
      };
      
      localStorage.setItem(`chinese-chess-save-${slotName}`, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  },

  loadGame: (slotName) => {
    try {
      const saved = localStorage.getItem(`chinese-chess-save-${slotName}`);
      
      if (!saved) {
        return false;
      }
      
      const saveData = JSON.parse(saved);
      
      set({
        gameState: saveData.gameState,
        history: [],
        historyPosition: 0,
        selectedPosition: null,
        validMoves: [],
        lastMove: null,
        inCheck: null,
      });
      
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  },

  listSaves: () => {
    const saves: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chinese-chess-save-')) {
        const slotName = key.replace('chinese-chess-save-', '');
        saves.push(slotName);
      }
    }
    
    return saves;
  },

  deleteSave: (slotName) => {
    const key = `chinese-chess-save-${slotName}`;
    
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      return true;
    }
    
    return false;
  },

  setDifficulty: (difficulty) => {
    set({ difficulty });
  },

  setGameMode: (mode) => {
    set({ gameMode: mode });
  },
}));

export default useGameStore;
