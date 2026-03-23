/**
 * Skin System Types and Configuration
 */

import { PieceType } from '../core/types';

// ============================================================================
// Skin Types
// ============================================================================

export type BoardSkinId = 'wood' | 'bamboo' | 'marble' | 'minimal';
export type PieceSkinId = 'traditional' | 'symbol' | 'minimal';

export interface BoardSkin {
  id: BoardSkinId;
  name: string;
  colors: {
    light: string;
    dark: string;
  };
}

export interface PieceSkin {
  id: PieceSkinId;
  name: string;
  renderType: 'text' | 'symbol';
  redColor: string;
  blackColor: string;
  labels?: Record<PieceType, { red: string; black: string }>;
  symbols?: Record<PieceType, string>;
}

export interface SkinConfig {
  board: BoardSkinId;
  piece: PieceSkinId;
}

// ============================================================================
// Built-in Skins
// ============================================================================

export const BOARD_SKINS: Record<BoardSkinId, BoardSkin> = {
  wood: {
    id: 'wood',
    name: 'Wooden Board',
    colors: { light: '#F0D9B5', dark: '#B58863' },
  },
  bamboo: {
    id: 'bamboo',
    name: 'Bamboo Board',
    colors: { light: '#E8F5C9', dark: '#8BC34A' },
  },
  marble: {
    id: 'marble',
    name: 'Marble Board',
    colors: { light: '#F5F5F5', dark: '#9E9E9E' },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: { light: '#FFFFFF', dark: '#424242' },
  },
};

export const PIECE_SKINS: Record<PieceSkinId, PieceSkin> = {
  traditional: {
    id: 'traditional',
    name: 'Traditional Chinese',
    renderType: 'text',
    redColor: '#C00',
    blackColor: '#111',
    labels: {
      general: { red: '帥', black: '將' },
      advisor: { red: '仕', black: '士' },
      elephant: { red: '相', black: '象' },
      horse: { red: '馬', black: '馬' },
      chariot: { red: '車', black: '車' },
      cannon: { red: '炮', black: '砲' },
      soldier: { red: '兵', black: '卒' },
    },
  },
  symbol: {
    id: 'symbol',
    name: 'Symbols',
    renderType: 'symbol',
    redColor: '#E53935',
    blackColor: '#424242',
    symbols: {
      general: '♔',
      advisor: '♕',
      elephant: '♗',
      horse: '♘',
      chariot: '♖',
      cannon: '♜',
      soldier: '♟',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    renderType: 'symbol',
    redColor: '#E53935',
    blackColor: '#424242',
    symbols: {
      general: 'K',
      advisor: 'Q',
      elephant: 'B',
      horse: 'N',
      chariot: 'R',
      cannon: 'C',
      soldier: 'P',
    },
  },
};

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_SKIN_CONFIG: SkinConfig = {
  board: 'wood',
  piece: 'traditional',
};

export default {
  BOARD_SKINS,
  PIECE_SKINS,
  DEFAULT_SKIN_CONFIG,
};
