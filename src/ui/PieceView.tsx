/**
 * PieceView Component - Renders a Chinese Chess piece
 *
 * Kept for backward compatibility / standalone usage outside the board SVG.
 */

import React from 'react';
import { PieceType, Color } from '../core/types';

interface PieceViewProps {
  type: PieceType;
  color: Color;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TRADITIONAL_LABELS: Record<PieceType, { red: string; black: string }> = {
  general:  { red: '帥', black: '將' },
  advisor:  { red: '仕', black: '士' },
  elephant: { red: '相', black: '象' },
  horse:    { red: '馬', black: '馬' },
  chariot:  { red: '車', black: '車' },
  cannon:   { red: '炮', black: '砲' },
  soldier:  { red: '兵', black: '卒' },
};

export const PieceView: React.FC<PieceViewProps> = ({
  type,
  color,
  size = 48,
  className = '',
  style,
}) => {
  const label = TRADITIONAL_LABELS[type][color];
  const isRed = color === 'red';

  return (
    <div
      role="img"
      aria-label={`${color} ${type}`}
      className={`rounded-full flex items-center justify-center font-bold shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        lineHeight: 1,
        background: '#FFF5E6',
        border: '2px solid #5C3317',
        color: isRed ? '#CC0000' : '#1A1A1A',
        fontFamily: 'KaiTi, STKaiti, SimSun, serif',
        ...style,
      }}
    >
      {label}
    </div>
  );
};

export default PieceView;
