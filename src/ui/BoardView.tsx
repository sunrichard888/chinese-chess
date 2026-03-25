/**
 * BoardView Component - Chinese Chess Board (Pure SVG)
 *
 * All elements (grid, decorations, pieces, indicators) are rendered inside
 * a single SVG so alignment is pixel-perfect at any viewport size.
 *
 * Board: 9 files (0-8) × 10 ranks (0-9)
 * Red at bottom (rank 0), Black at top (rank 9).
 */

import React from 'react';
import { Position, Piece, Color, PieceType } from '../core/types';

/* ─────────────────────────── props ─────────────────────────── */

interface BoardViewProps {
  pieces?: readonly Piece[];
  selectedPosition?: Position | null;
  validMoves?: Position[];
  lastMove?: { from: Position; to: Position } | null;
  inCheck?: Position | null;
  onPositionSelect?: (position: Position) => void;
  className?: string;
  flipBoard?: boolean;
  theme?: 'classic' | 'modern' | 'green';
}

/* ─────────────────────────── constants ─────────────────────── */

const FILES = 9;
const RANKS = 10;
const CELL = 60;          // cell size in SVG units
const PAD = 40;            // padding around grid
const PIECE_R = 25;        // piece circle radius
const FONT_SIZE = 28;      // piece character font size

const BOARD_W = (FILES - 1) * CELL + PAD * 2;
const BOARD_H = (RANKS - 1) * CELL + PAD * 2;

/* ─────────────────────────── themes ───────────────────────── */

interface ThemeColors {
  bg: string;
  gridLine: string;
  gridLineWidth: number;
  river: string;
  riverText: string;
  pieceStroke: string;
  pieceFillRed: string;
  pieceFillBlack: string;
  pieceTextRed: string;
  pieceTextBlack: string;
  boardBorder: string;
  cellBg: string;
}

const themes: Record<string, ThemeColors> = {
  classic: {
    bg: '#F0D9B5',
    gridLine: '#5C3317',
    gridLineWidth: 1.5,
    river: '#E8C98E',
    riverText: '#5C3317',
    pieceStroke: '#5C3317',
    pieceFillRed: '#FFF5E6',
    pieceFillBlack: '#FFF5E6',
    pieceTextRed: '#CC0000',
    pieceTextBlack: '#1A1A1A',
    boardBorder: '#5C3317',
    cellBg: '#DFC08A',
  },
  modern: {
    bg: '#1A1A2E',
    gridLine: '#E94560',
    gridLineWidth: 1.2,
    river: '#0F3460',
    riverText: '#E94560',
    pieceStroke: '#E94560',
    pieceFillRed: '#2D2D44',
    pieceFillBlack: '#2D2D44',
    pieceTextRed: '#FF6B81',
    pieceTextBlack: '#E0E0E0',
    boardBorder: '#E94560',
    cellBg: '#16213E',
  },
  green: {
    bg: '#2E6B2E',
    gridLine: '#1A3D1A',
    gridLineWidth: 1.5,
    river: '#3D8B3D',
    riverText: '#1A3D1A',
    pieceStroke: '#1A3D1A',
    pieceFillRed: '#E8F0E8',
    pieceFillBlack: '#E8F0E8',
    pieceTextRed: '#CC0000',
    pieceTextBlack: '#1A1A1A',
    boardBorder: '#1A3D1A',
    cellBg: '#4A7C23',
  },
};

/* ─────────────────────── piece labels ─────────────────────── */

const PIECE_LABELS: Record<PieceType, { red: string; black: string }> = {
  general:  { red: '帥', black: '將' },
  advisor:  { red: '仕', black: '士' },
  elephant: { red: '相', black: '象' },
  horse:    { red: '馬', black: '馬' },
  chariot:  { red: '車', black: '車' },
  cannon:   { red: '炮', black: '砲' },
  soldier:  { red: '兵', black: '卒' },
};

/* ────────────────────── cross / star marks ─────────────────── */
// Positions that have the small cross marks on a standard Chinese chess board
const CROSS_MARKS: Position[] = [
  // Soldiers
  { file: 0, rank: 3 }, { file: 2, rank: 3 }, { file: 4, rank: 3 },
  { file: 6, rank: 3 }, { file: 8, rank: 3 },
  { file: 0, rank: 6 }, { file: 2, rank: 6 }, { file: 4, rank: 6 },
  { file: 6, rank: 6 }, { file: 8, rank: 6 },
  // Cannons
  { file: 1, rank: 2 }, { file: 7, rank: 2 },
  { file: 1, rank: 7 }, { file: 7, rank: 7 },
];

/* ═══════════════════════ component ════════════════════════════ */

export const BoardView: React.FC<BoardViewProps> = ({
  pieces = [],
  selectedPosition,
  validMoves = [],
  lastMove,
  inCheck,
  onPositionSelect,
  className = '',
  flipBoard = false,
  theme = 'classic',
}) => {
  const t = themes[theme] ?? themes.classic;

  /* ── coordinate helpers ── */
  // Convert logical (file, rank) → SVG (x, y).
  // In the data model: Red starts at rank 0, Black at rank 9.
  // On screen we want Red at the bottom by default.
  // Rank 0 should be at the BOTTOM of the SVG (large y), rank 9 at the TOP.
  // When flipBoard is true, Red goes to top (small y).
  const toX = (file: number) => PAD + file * CELL;
  const toY = (rank: number) => {
    const displayRank = flipBoard ? rank : (RANKS - 1 - rank);
    return PAD + displayRank * CELL;
  };

  const handleClick = (file: number, rank: number) => {
    onPositionSelect?.({ file, rank });
  };

  /* ── render helpers ── */

  const renderGrid = () => {
    const lines: React.ReactNode[] = [];

    // Horizontal lines (10 lines for 10 ranks, but mapped to display coords)
    for (let displayRank = 0; displayRank < RANKS; displayRank++) {
      const y = PAD + displayRank * CELL;
      lines.push(
        <line
          key={`h-${displayRank}`}
          x1={PAD} y1={y}
          x2={PAD + (FILES - 1) * CELL} y2={y}
          stroke={t.gridLine} strokeWidth={t.gridLineWidth}
        />
      );
    }

    // Vertical lines — first & last span the full board, middle ones split at river
    for (let file = 0; file < FILES; file++) {
      const x = PAD + file * CELL;
      if (file === 0 || file === FILES - 1) {
        lines.push(
          <line
            key={`v-${file}`}
            x1={x} y1={PAD}
            x2={x} y2={PAD + (RANKS - 1) * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth}
          />
        );
      } else {
        // Top half (display ranks 0-4)
        lines.push(
          <line
            key={`vt-${file}`}
            x1={x} y1={PAD}
            x2={x} y2={PAD + 4 * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth}
          />
        );
        // Bottom half (display ranks 5-9)
        lines.push(
          <line
            key={`vb-${file}`}
            x1={x} y1={PAD + 5 * CELL}
            x2={x} y2={PAD + (RANKS - 1) * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth}
          />
        );
      }
    }

    return lines;
  };

  const renderPalaceDiagonals = () => {
    // Palace: files 3-5.
    // In standard orientation (Red bottom): top palace display ranks 0-2, bottom palace 7-9.
    // We just draw them at fixed display positions since the grid is symmetric.
    return (
      <>
        {/* Top palace */}
        <line x1={PAD + 3 * CELL} y1={PAD} x2={PAD + 5 * CELL} y2={PAD + 2 * CELL}
              stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
        <line x1={PAD + 5 * CELL} y1={PAD} x2={PAD + 3 * CELL} y2={PAD + 2 * CELL}
              stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
        {/* Bottom palace */}
        <line x1={PAD + 3 * CELL} y1={PAD + 7 * CELL} x2={PAD + 5 * CELL} y2={PAD + 9 * CELL}
              stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
        <line x1={PAD + 5 * CELL} y1={PAD + 7 * CELL} x2={PAD + 3 * CELL} y2={PAD + 9 * CELL}
              stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      </>
    );
  };

  const renderRiver = () => {
    const y = PAD + 4 * CELL;
    const h = CELL;
    // Determine which text goes where based on flip
    // Standard: Black side (top), Red side (bottom)
    // Top half of river → Black → 楚 河, Bottom half → Red → 漢 界
    // If flipped, swap.
    const topText = flipBoard ? '漢　　界' : '楚　　河';
    const bottomText = flipBoard ? '楚　　河' : '漢　　界';
    return (
      <>
        <rect x={PAD} y={y} width={(FILES - 1) * CELL} height={h}
              fill={t.river} opacity={0.5} />
        <text x={PAD + (FILES - 1) * CELL * 0.25} y={y + h / 2 + 8}
              textAnchor="middle" fill={t.riverText}
              fontSize={20} fontFamily="KaiTi, STKaiti, serif"
              fontWeight="bold" letterSpacing={6}>
          {topText}
        </text>
        <text x={PAD + (FILES - 1) * CELL * 0.75} y={y + h / 2 + 8}
              textAnchor="middle" fill={t.riverText}
              fontSize={20} fontFamily="KaiTi, STKaiti, serif"
              fontWeight="bold" letterSpacing={6}>
          {bottomText}
        </text>
      </>
    );
  };

  const renderCrossMarks = () => {
    const arm = 6; // length of each arm
    const gap = 4; // gap from center
    const elems: React.ReactNode[] = [];

    CROSS_MARKS.forEach((pos) => {
      const cx = toX(pos.file);
      const cy = toY(pos.rank);
      const key = `cross-${pos.file}-${pos.rank}`;

      // 4 corners of the cross, skip arms that would go outside the board
      const arms: [number, number][] = [];
      if (pos.file > 0) {
        arms.push([-1, -1], [-1, 1]); // left-top, left-bottom
      }
      if (pos.file < 8) {
        arms.push([1, -1], [1, 1]); // right-top, right-bottom
      }

      arms.forEach(([dx, dy], i) => {
        // Horizontal part
        elems.push(
          <line key={`${key}-h-${i}`}
            x1={cx + dx * gap} y1={cy + dy * gap}
            x2={cx + dx * (gap + arm)} y2={cy + dy * gap}
            stroke={t.gridLine} strokeWidth={1} />
        );
        // Vertical part
        elems.push(
          <line key={`${key}-v-${i}`}
            x1={cx + dx * gap} y1={cy + dy * gap}
            x2={cx + dx * gap} y2={cy + dy * (gap + arm)}
            stroke={t.gridLine} strokeWidth={1} />
        );
      });
    });

    return elems;
  };

  const renderLastMoveHighlight = () => {
    if (!lastMove) return null;
    const rects = [lastMove.from, lastMove.to].map((pos, i) => {
      const cx = toX(pos.file);
      const cy = toY(pos.rank);
      const size = CELL * 0.8;
      return (
        <rect key={`lm-${i}`}
          x={cx - size / 2} y={cy - size / 2}
          width={size} height={size}
          rx={4} ry={4}
          fill="#3B82F6" opacity={0.25}
        />
      );
    });
    return <>{rects}</>;
  };

  const renderSelectedHighlight = () => {
    if (!selectedPosition) return null;
    const cx = toX(selectedPosition.file);
    const cy = toY(selectedPosition.rank);
    const size = CELL * 0.85;
    return (
      <rect
        x={cx - size / 2} y={cy - size / 2}
        width={size} height={size}
        rx={4} ry={4}
        fill="#22C55E" opacity={0.35}
        data-testid="selected-position"
      />
    );
  };

  const renderValidMoves = () =>
    validMoves.map((pos, i) => {
      const cx = toX(pos.file);
      const cy = toY(pos.rank);
      // Check if there is an enemy piece here (capture indicator)
      const isCapture = pieces.some(
        (p) => p.position.file === pos.file && p.position.rank === pos.rank
      );
      if (isCapture) {
        // Ring indicator for captures
        return (
          <circle key={`vm-${i}`}
            cx={cx} cy={cy} r={PIECE_R + 2}
            fill="none" stroke="#EF4444" strokeWidth={3}
            opacity={0.7}
            data-testid="valid-move-indicator"
          />
        );
      }
      // Dot indicator for empty squares
      return (
        <circle key={`vm-${i}`}
          cx={cx} cy={cy} r={7}
          fill="#22C55E" opacity={0.7}
          data-testid="valid-move-indicator"
        />
      );
    });

  const renderCheckIndicator = () => {
    if (!inCheck) return null;
    const cx = toX(inCheck.file);
    const cy = toY(inCheck.rank);
    return (
      <>
        <circle cx={cx} cy={cy} r={PIECE_R + 6}
          fill="none" stroke="#EF4444" strokeWidth={3} opacity={0.8}>
          <animate attributeName="r" values={`${PIECE_R + 4};${PIECE_R + 10};${PIECE_R + 4}`}
            dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0.8"
            dur="1s" repeatCount="indefinite" />
        </circle>
      </>
    );
  };

  const renderPieces = () =>
    pieces.map((piece) => {
      const cx = toX(piece.position.file);
      const cy = toY(piece.position.rank);
      const label = PIECE_LABELS[piece.type][piece.color];
      const isRed = piece.color === Color.Red;

      return (
        <g key={`piece-${piece.color}-${piece.type}-${piece.position.file}-${piece.position.rank}`}
           style={{ cursor: 'pointer' }}
           className="chess-piece">
          {/* Outer shadow */}
          <circle cx={cx + 1} cy={cy + 2} r={PIECE_R} fill="rgba(0,0,0,0.15)" />
          {/* Piece background */}
          <circle cx={cx} cy={cy} r={PIECE_R}
            fill={isRed ? t.pieceFillRed : t.pieceFillBlack}
            stroke={t.pieceStroke} strokeWidth={2} />
          {/* Inner ring */}
          <circle cx={cx} cy={cy} r={PIECE_R - 4}
            fill="none"
            stroke={isRed ? t.pieceTextRed : t.pieceTextBlack}
            strokeWidth={1} opacity={0.5} />
          {/* Character */}
          <text x={cx} y={cy + FONT_SIZE * 0.35}
            textAnchor="middle"
            fill={isRed ? t.pieceTextRed : t.pieceTextBlack}
            fontSize={FONT_SIZE}
            fontFamily="KaiTi, STKaiti, SimSun, serif"
            fontWeight="bold"
            style={{ userSelect: 'none' }}>
            {label}
          </text>
        </g>
      );
    });

  const renderClickTargets = () => {
    const targets: React.ReactNode[] = [];
    for (let rank = 0; rank < RANKS; rank++) {
      for (let file = 0; file < FILES; file++) {
        const cx = toX(file);
        const cy = toY(rank);
        targets.push(
          <circle
            key={`click-${file}-${rank}`}
            cx={cx} cy={cy}
            r={PIECE_R + 2}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`Position ${file},${rank}`}
            onClick={(e) => { e.stopPropagation(); handleClick(file, rank); }}
          />
        );
      }
    }
    return targets;
  };

  /* ── render ── */

  return (
    <div
      role="grid"
      aria-label="Chinese Chess Board"
      className={`relative w-full max-w-xl mx-auto ${className}`}
    >
      <svg
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        className="w-full h-auto"
        style={{ display: 'block' }}
      >
        {/* Board background */}
        <rect x={0} y={0} width={BOARD_W} height={BOARD_H}
          rx={6} ry={6} fill={t.bg} />

        {/* Board border */}
        <rect x={PAD - 4} y={PAD - 4}
          width={(FILES - 1) * CELL + 8}
          height={(RANKS - 1) * CELL + 8}
          fill="none" stroke={t.boardBorder} strokeWidth={3} rx={2} ry={2} />

        {/* Grid */}
        {renderGrid()}

        {/* Palace diagonals */}
        {renderPalaceDiagonals()}

        {/* River */}
        {renderRiver()}

        {/* Cross marks */}
        {renderCrossMarks()}

        {/* Last move highlight */}
        {renderLastMoveHighlight()}

        {/* Selected position */}
        {renderSelectedHighlight()}

        {/* Valid move indicators */}
        {renderValidMoves()}

        {/* Check indicator */}
        {renderCheckIndicator()}

        {/* Pieces */}
        {renderPieces()}

        {/* Clickable targets (on top of everything) */}
        {renderClickTargets()}
      </svg>
    </div>
  );
};

export default BoardView;
