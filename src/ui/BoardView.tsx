/**
 * BoardView Component - Renders the Chinese Chess board
 * 
 * Uses SVG for crisp rendering at any size
 * Responsive design with mobile-first approach
 */

import React from 'react';
import { Position, Piece, Color } from '../core/types';
import { PieceView } from './PieceView';

interface BoardViewProps {
  pieces?: readonly Piece[];
  selectedPosition?: Position | null;
  validMoves?: Position[];
  lastMove?: { from: Position; to: Position } | null;
  inCheck?: Position | null;
  onPositionSelect?: (position: Position) => void;
  className?: string;
}

// Board dimensions
const FILES = 9;   // 0-8 (纵线)
const RANKS = 10;  // 0-9 (横线)
const CELL_SIZE = 100; // Base cell size in SVG units
const PADDING = 50;    // Padding around the board

export const BoardView: React.FC<BoardViewProps> = ({
  pieces = [],
  selectedPosition,
  validMoves,
  lastMove,
  inCheck,
  onPositionSelect,
  className = '',
}) => {
  const width = (FILES - 1) * CELL_SIZE + PADDING * 2;
  const height = (RANKS - 1) * CELL_SIZE + PADDING * 2;

  // River (between rank 4 and 5)
  const riverY = PADDING + 4 * CELL_SIZE;
  const riverHeight = CELL_SIZE;

  return (
    <div
      role="grid"
      aria-label="Chinese Chess Board"
      className={`aspect-[9/10] w-full max-w-2xl mx-auto ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Board background */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          className="fill-chess-board-light"
        />

        {/* Grid lines - horizontal */}
        {Array.from({ length: RANKS }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={PADDING}
            y1={PADDING + i * CELL_SIZE}
            x2={PADDING + (FILES - 1) * CELL_SIZE}
            y2={PADDING + i * CELL_SIZE}
            className="stroke-chess-board-dark"
            strokeWidth={2}
          />
        ))}

        {/* Grid lines - vertical (split by river) */}
        {Array.from({ length: FILES }, (_, i) => {
          // First and last lines go all the way
          if (i === 0 || i === FILES - 1) {
            return (
              <line
                key={`v-${i}`}
                x1={PADDING + i * CELL_SIZE}
                y1={PADDING}
                x2={PADDING + i * CELL_SIZE}
                y2={PADDING + (RANKS - 1) * CELL_SIZE}
                className="stroke-chess-board-dark"
                strokeWidth={2}
              />
            );
          }
          // Middle lines split by river
          return (
            <g key={`v-${i}`}>
              <line
                x1={PADDING + i * CELL_SIZE}
                y1={PADDING}
                x2={PADDING + i * CELL_SIZE}
                y2={riverY}
                className="stroke-chess-board-dark"
                strokeWidth={2}
              />
              <line
                x1={PADDING + i * CELL_SIZE}
                y1={riverY + riverHeight}
                x2={PADDING + i * CELL_SIZE}
                y2={PADDING + (RANKS - 1) * CELL_SIZE}
                className="stroke-chess-board-dark"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* River */}
        <rect
          x={PADDING}
          y={riverY}
          width={(FILES - 1) * CELL_SIZE}
          height={riverHeight}
          className="fill-amber-200/50"
          aria-label="River"
        />

        {/* Palace diagonal lines (top - Black) */}
        <line
          x1={PADDING + 3 * CELL_SIZE}
          y1={PADDING}
          x2={PADDING + 5 * CELL_SIZE}
          y2={PADDING + 2 * CELL_SIZE}
          className="stroke-chess-board-dark"
          strokeWidth={2}
        />
        <line
          x1={PADDING + 5 * CELL_SIZE}
          y1={PADDING}
          x2={PADDING + 3 * CELL_SIZE}
          y2={PADDING + 2 * CELL_SIZE}
          className="stroke-chess-board-dark"
          strokeWidth={2}
        />

        {/* Palace diagonal lines (bottom - Red) */}
        <line
          x1={PADDING + 3 * CELL_SIZE}
          y1={PADDING + 7 * CELL_SIZE}
          x2={PADDING + 5 * CELL_SIZE}
          y2={PADDING + 9 * CELL_SIZE}
          className="stroke-chess-board-dark"
          strokeWidth={2}
        />
        <line
          x1={PADDING + 5 * CELL_SIZE}
          y1={PADDING + 7 * CELL_SIZE}
          x2={PADDING + 3 * CELL_SIZE}
          y2={PADDING + 9 * CELL_SIZE}
          className="stroke-chess-board-dark"
          strokeWidth={2}
        />

        {/* Valid move indicators */}
        {validMoves?.map((pos, index) => (
          <circle
            key={`valid-move-${index}`}
            cx={PADDING + pos.file * CELL_SIZE}
            cy={PADDING + pos.rank * CELL_SIZE}
            r={CELL_SIZE * 0.15}
            className="fill-green-500"
            data-testid="valid-move-indicator"
          />
        ))}

        {/* Selected position highlight */}
        {selectedPosition && (
          <circle
            cx={PADDING + selectedPosition.file * CELL_SIZE}
            cy={PADDING + selectedPosition.rank * CELL_SIZE}
            r={CELL_SIZE * 0.4}
            className="fill-green-400/40"
            data-testid="selected-position"
          />
        )}

        {/* Last move highlight */}
        {lastMove && (
          <>
            <rect
              x={PADDING + lastMove.from.file * CELL_SIZE - CELL_SIZE * 0.45}
              y={PADDING + lastMove.from.rank * CELL_SIZE - CELL_SIZE * 0.45}
              width={CELL_SIZE * 0.9}
              height={CELL_SIZE * 0.9}
              className="fill-blue-400/30"
              data-testid="last-move-highlight"
            />
            <rect
              x={PADDING + lastMove.to.file * CELL_SIZE - CELL_SIZE * 0.45}
              y={PADDING + lastMove.to.rank * CELL_SIZE - CELL_SIZE * 0.45}
              width={CELL_SIZE * 0.9}
              height={CELL_SIZE * 0.9}
              className="fill-blue-400/30"
              data-testid="last-move-highlight"
            />
          </>
        )}

        {/* In check indicator */}
        {inCheck && (
          <circle
            cx={PADDING + inCheck.file * CELL_SIZE}
            cy={PADDING + inCheck.rank * CELL_SIZE}
            r={CELL_SIZE * 0.45}
            className="fill-red-500/40 animate-pulse"
            data-testid="check-indicator"
          />
        )}

        {/* Interactive positions */}
        {Array.from({ length: RANKS }, (_, rank) =>
          Array.from({ length: FILES }, (_, file) => {
            const position = { file, rank };
            return (
              <circle
                key={`cell-${file}-${rank}`}
                cx={PADDING + file * CELL_SIZE}
                cy={PADDING + rank * CELL_SIZE}
                r={CELL_SIZE * 0.45}
                className="fill-transparent hover:fill-green-400/20 cursor-pointer"
                role="gridcell"
                aria-label={`Position ${String.fromCharCode(97 + file)}${rank + 1}`}
                onClick={() => onPositionSelect?.(position)}
              />
            );
          })
        )}
      </svg>

      {/* Render pieces absolutely positioned over the board */}
      <div className="relative w-full h-full" style={{ marginTop: `-${100}%` }}>
        {pieces.map((piece, index) => {
          const leftPercent = ((piece.position.file * CELL_SIZE + PADDING) / width) * 100;
          const topPercent = ((piece.position.rank * CELL_SIZE + PADDING) / height) * 100;

          return (
            <div
              key={`${piece.type}-${piece.color}-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${(CELL_SIZE * 0.8 / width) * 100}%`,
                height: `${(CELL_SIZE * 0.8 / height) * 100}%`,
              }}
            >
              <PieceView type={piece.type} color={piece.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardView;
