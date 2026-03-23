/**
 * PieceView Component - Renders a Chinese Chess piece
 * 
 * Supports multiple skin types: traditional (text), symbol, minimal
 */

import React from 'react';
import { PieceType, Color } from '../core/types';

interface PieceViewProps {
  type: PieceType;
  color: Color;
  size?: number;
  className?: string;
}

// Traditional Chinese character labels
const TRADITIONAL_LABELS: Record<PieceType, { red: string; black: string }> = {
  general: { red: '帥', black: '將' },
  advisor: { red: '仕', black: '士' },
  elephant: { red: '相', black: '象' },
  horse: { red: '馬', black: '馬' },
  chariot: { red: '車', black: '車' },
  cannon: { red: '炮', black: '砲' },
  soldier: { red: '兵', black: '卒' },
};

// Symbol labels (Unicode chess-like symbols)
const SYMBOL_LABELS: Record<PieceType, string> = {
  general: '♔',
  advisor: '♕',
  elephant: '♗',
  horse: '♘',
  chariot: '♖',
  cannon: '♜',
  soldier: '♟',
};

export const PieceView: React.FC<PieceViewProps> = ({
  type,
  color,
  size = 48,
  className = '',
}) => {
  const label = TRADITIONAL_LABELS[type][color];
  const colorClass = color === 'red' ? 'text-chess-red' : 'text-chess-black';

  return (
    <div
      role="img"
      aria-label={`${color} ${type}`}
      className={`rounded-full bg-amber-100 border-2 border-amber-800 
                  flex items-center justify-center font-bold shadow-md
                  ${colorClass} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.6,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
  );
};

// Alternative symbol-based piece view
export const SymbolPieceView: React.FC<PieceViewProps> = ({
  type,
  color,
  size = 48,
  className = '',
}) => {
  const label = SYMBOL_LABELS[type];
  const colorClass = color === 'red' ? 'text-chess-red' : 'text-chess-black';

  return (
    <div
      role="img"
      aria-label={`${color} ${type}`}
      className={`rounded-full bg-amber-100 border-2 border-amber-800 
                  flex items-center justify-center shadow-md
                  ${colorClass} ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.7,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
  );
};

export default PieceView;
