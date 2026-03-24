/**
 * BoardView Component - Renders the Chinese Chess board
 * 
 * Uses SVG for crisp rendering at any size
 * Responsive design with mobile-first approach
 */

import React from 'react';
import { Position, Piece } from '../core/types';
import { PieceView } from './PieceView';

interface BoardViewProps {
  pieces?: readonly Piece[];
  selectedPosition?: Position | null;
  validMoves?: Position[];
  lastMove?: { from: Position; to: Position } | null;
  inCheck?: Position | null;
  onPositionSelect?: (position: Position) => void;
  className?: string;
  flipBoard?: boolean; // Flip board so Red is at bottom
  theme?: 'classic' | 'modern' | 'green'; // Board theme
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
  flipBoard = false,
  theme = 'classic',
}) => {
  const width = (FILES - 1) * CELL_SIZE + PADDING * 2;
  const height = (RANKS - 1) * CELL_SIZE + PADDING * 2;

  // River (between rank 4 and 5)
  const riverY = PADDING + 4 * CELL_SIZE;
  const riverHeight = CELL_SIZE;

  // Theme colors
  const themeColors = {
    classic: {
      background: 'linear-gradient(to bottom, #f59e0b 0%, #d97706 100%)',
      grid: '#78350f',
      river: '#fcd34d',
    },
    modern: {
      background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
      grid: '#e94560',
      river: '#0f3460',
    },
    green: {
      background: 'linear-gradient(to bottom, #2d5016 0%, #1a3009 100%)',
      grid: '#4a7c23',
      river: '#3d6b1c',
    },
  };

  const colors = themeColors[theme];

  // Helper to flip rank for display
  const getDisplayRank = (rank: number): number => {
    return flipBoard ? (RANKS - 1 - rank) : rank;
  };

  // Handle click on a board position
  const handlePositionClick = (file: number, rank: number) => {
    // Convert display rank to logical rank
    const logicalRank = flipBoard ? (RANKS - 1 - rank) : rank;
    onPositionSelect?.({ file, rank: logicalRank });
  };

  return (
    <div
      role="grid"
      aria-label="Chinese Chess Board"
      className={`relative w-full max-w-2xl mx-auto aspect-[9/10] ${className}`}
      style={{
        background: colors.background,
        borderRadius: '8px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        padding: '20px',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Board background - wood texture color */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#fbbf24"
          opacity="0.3"
        />

        {/* Grid lines - horizontal */}
        {Array.from({ length: RANKS }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={PADDING}
            y1={PADDING + i * CELL_SIZE}
            x2={PADDING + (FILES - 1) * CELL_SIZE}
            y2={PADDING + i * CELL_SIZE}
            stroke={colors.grid}
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
                stroke={colors.grid}
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
                stroke={colors.grid}
                strokeWidth={2}
              />
              <line
                x1={PADDING + i * CELL_SIZE}
                y1={riverY + riverHeight}
                x2={PADDING + i * CELL_SIZE}
                y2={PADDING + (RANKS - 1) * CELL_SIZE}
                stroke={colors.grid}
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* River background */}
        <rect
          x={PADDING}
          y={riverY}
          width={(FILES - 1) * CELL_SIZE}
          height={riverHeight}
          fill={colors.river}
          opacity="0.5"
        />

        {/* River text */}
        <text
          x={PADDING + (FILES - 1) * CELL_SIZE / 2}
          y={riverY + CELL_SIZE / 2 + 8}
          textAnchor="middle"
          fill={colors.grid}
          fontSize="24"
          fontFamily="serif"
          style={{ letterSpacing: '20px' }}
        >
          楚 河
        </text>
        <text
          x={PADDING + (FILES - 1) * CELL_SIZE / 2 + 180}
          y={riverY + CELL_SIZE / 2 + 8}
          textAnchor="middle"
          fill={colors.grid}
          fontSize="24"
          fontFamily="serif"
          style={{ letterSpacing: '20px' }}
        >
          漢 界
        </text>

        {/* Palace diagonal lines (top - Black) */}
        <line
          x1={PADDING + 3 * CELL_SIZE}
          y1={PADDING}
          x2={PADDING + 5 * CELL_SIZE}
          y2={PADDING + 2 * CELL_SIZE}
          stroke={colors.grid}
          strokeWidth={2}
        />
        <line
          x1={PADDING + 5 * CELL_SIZE}
          y1={PADDING}
          x2={PADDING + 3 * CELL_SIZE}
          y2={PADDING + 2 * CELL_SIZE}
          stroke={colors.grid}
          strokeWidth={2}
        />

        {/* Palace diagonal lines (bottom - Red) */}
        <line
          x1={PADDING + 3 * CELL_SIZE}
          y1={PADDING + 7 * CELL_SIZE}
          x2={PADDING + 5 * CELL_SIZE}
          y2={PADDING + 9 * CELL_SIZE}
          stroke={colors.grid}
          strokeWidth={2}
        />
        <line
          x1={PADDING + 5 * CELL_SIZE}
          y1={PADDING + 7 * CELL_SIZE}
          x2={PADDING + 3 * CELL_SIZE}
          y2={PADDING + 9 * CELL_SIZE}
          stroke={colors.grid}
          strokeWidth={2}
        />

        {/* Valid move indicators */}
        {validMoves?.map((pos, index) => (
          <circle
            key={`valid-move-${index}`}
            cx={PADDING + pos.file * CELL_SIZE}
            cy={PADDING + pos.rank * CELL_SIZE}
            r={CELL_SIZE * 0.12}
            fill="#22c55e"
            opacity="0.8"
            data-testid="valid-move-indicator"
          />
        ))}

        {/* Selected position highlight */}
        {selectedPosition && (
          <rect
            x={PADDING + selectedPosition.file * CELL_SIZE - CELL_SIZE * 0.45}
            y={PADDING + selectedPosition.rank * CELL_SIZE - CELL_SIZE * 0.45}
            width={CELL_SIZE * 0.9}
            height={CELL_SIZE * 0.9}
            fill="#22c55e"
            opacity="0.4"
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
              fill="#3b82f6"
              opacity="0.3"
              data-testid="last-move-highlight"
            />
            <rect
              x={PADDING + lastMove.to.file * CELL_SIZE - CELL_SIZE * 0.45}
              y={PADDING + lastMove.to.rank * CELL_SIZE - CELL_SIZE * 0.45}
              width={CELL_SIZE * 0.9}
              height={CELL_SIZE * 0.9}
              fill="#3b82f6"
              opacity="0.3"
              data-testid="last-move-highlight"
            />
          </>
        )}

        {/* In check indicator - pulsing red circle around general */}
        {inCheck && (
          <g>
            <circle
              cx={PADDING + inCheck.file * CELL_SIZE}
              cy={PADDING + inCheck.rank * CELL_SIZE}
              r={CELL_SIZE * 0.6}
              fill="#ef4444"
              opacity="0.3"
              className="animate-ping"
            />
            <circle
              cx={PADDING + inCheck.file * CELL_SIZE}
              cy={PADDING + inCheck.rank * CELL_SIZE}
              r={CELL_SIZE * 0.55}
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              opacity="0.8"
              className="animate-pulse"
            />
            <text
              x={PADDING + inCheck.file * CELL_SIZE}
              y={PADDING + inCheck.rank * CELL_SIZE - CELL_SIZE * 0.7}
              textAnchor="middle"
              fill="#ef4444"
              fontSize="20"
              fontWeight="bold"
              className="animate-bounce"
            >
              将军！
            </text>
          </g>
        )}

        {/* Clickable intersection areas */}
        {Array.from({ length: RANKS }, (_, rank) =>
          Array.from({ length: FILES }, (_, file) => (
            <circle
              key={`click-${file}-${rank}`}
              cx={PADDING + file * CELL_SIZE}
              cy={PADDING + rank * CELL_SIZE}
              r={CELL_SIZE * 0.45}
              fill="transparent"
              className="cursor-pointer"
              role="button"
              aria-label={`Position ${file},${rank}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePositionClick(file, rank);
              }}
            />
          ))
        )}

        {/* Grid intersection dots for visual clarity */}
        {Array.from({ length: RANKS }, (_, rank) =>
          Array.from({ length: FILES }, (_, file) => {
            // Skip center area where palace diagonals are
            const inPalace = (file >= 3 && file <= 5) && ((rank >= 0 && rank <= 2) || (rank >= 7 && rank <= 9));
            if (inPalace) return null;
            
            return (
              <circle
                key={`dot-${file}-${rank}`}
                cx={PADDING + file * CELL_SIZE}
                cy={PADDING + rank * CELL_SIZE}
                r={4}
                fill={colors.grid}
                opacity="0.6"
              />
            );
          })
        )}
      </svg>

      {/* Pieces - rendered as absolute positioned elements over the SVG */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          padding: '20px', // Match parent padding
        }}
      >
        {pieces.map((piece) => {
          // Calculate exact pixel position within the container
          const containerWidth = width;
          const containerHeight = height;
          
          // Position in SVG coordinates (with optional flip)
          const svgX = PADDING + piece.position.file * CELL_SIZE;
          const svgY = PADDING + getDisplayRank(piece.position.rank) * CELL_SIZE;
          
          // Convert to percentage
          const leftPercent = (svgX / containerWidth) * 100;
          const topPercent = (svgY / containerHeight) * 100;

          return (
            <div
              key={`${piece.type}-${piece.color}-${piece.position.file}-${piece.position.rank}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 pointer-events-auto"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: '8%',
                aspectRatio: '1',
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePositionClick(piece.position.file, piece.position.rank);
              }}
            >
              <PieceView 
                type={piece.type} 
                color={piece.color} 
                size={undefined}
                className="w-full h-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardView;
