/**
 * BoardView Component - Chinese Chess Board (Pure SVG) with Animations
 *
 * All elements (grid, decorations, pieces, indicators) are rendered inside
 * a single SVG so alignment is pixel-perfect at any viewport size.
 *
 * Animation system:
 * - Piece slide: CSS transition on transform for smooth movement
 * - Capture: SVG burst particle animation
 * - Check: pulsing red ring (SVG animate)
 * - Checkmate: dramatic radial shockwave + golden glow
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Position, Piece, Color, PieceType } from '../core/types';
import { easeOutCubic, ANIM_DURATION } from './animations';

/* ─────────────────────────── props ─────────────────────────── */

interface BoardViewProps {
  pieces?: readonly Piece[];
  selectedPosition?: Position | null;
  validMoves?: Position[];
  lastMove?: { from: Position; to: Position } | null;
  inCheck?: Position | null;
  isCheckmate?: boolean;
  checkmateWinner?: 'red' | 'black' | null;
  onPositionSelect?: (position: Position) => void;
  className?: string;
  flipBoard?: boolean;
  theme?: 'classic' | 'modern' | 'green';
}

/* ─────────────────────────── constants ─────────────────────── */

const FILES = 9;
const RANKS = 10;
const CELL = 60;
const PAD = 40;
const PIECE_R = 25;
const FONT_SIZE = 28;

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

const CROSS_MARKS: Position[] = [
  { file: 0, rank: 3 }, { file: 2, rank: 3 }, { file: 4, rank: 3 },
  { file: 6, rank: 3 }, { file: 8, rank: 3 },
  { file: 0, rank: 6 }, { file: 2, rank: 6 }, { file: 4, rank: 6 },
  { file: 6, rank: 6 }, { file: 8, rank: 6 },
  { file: 1, rank: 2 }, { file: 7, rank: 2 },
  { file: 1, rank: 7 }, { file: 7, rank: 7 },
];

/* ───────────────── capture particle system ────────────────── */

interface CaptureParticle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
  startTime: number;
}

/* ═══════════════════════ component ════════════════════════════ */

export const BoardView: React.FC<BoardViewProps> = ({
  pieces = [],
  selectedPosition,
  validMoves = [],
  lastMove,
  inCheck,
  isCheckmate = false,
  checkmateWinner = null,
  onPositionSelect,
  className = '',
  flipBoard = false,
  theme = 'classic',
}) => {
  const t = themes[theme] ?? themes.classic;
  const svgRef = useRef<SVGSVGElement>(null);

  // ── Animation state ──
  // Track previous piece positions for slide animation
  const prevPiecesRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [animatingPieces, setAnimatingPieces] = useState<Map<string, { fromX: number; fromY: number; toX: number; toY: number; progress: number }>>(new Map());
  const [captureParticles, setCaptureParticles] = useState<CaptureParticle[]>([]);
  const [checkmateAnim, setCheckmateAnim] = useState<{ progress: number; active: boolean }>({ progress: 0, active: false });
  const animFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  /* ── coordinate helpers ── */
  const toX = useCallback((file: number) => PAD + file * CELL, []);
  const toY = useCallback((rank: number) => {
    const displayRank = flipBoard ? rank : (RANKS - 1 - rank);
    return PAD + displayRank * CELL;
  }, [flipBoard]);

  const pieceIdKey = (color: string, type: string) => `${color}-${type}`;

  /* ── Detect piece movements and trigger animations ── */
  useEffect(() => {
    const currentPositions = new Map<string, { x: number; y: number; file: number; rank: number }>();
    
    // Build a map of current piece positions keyed by a stable identity
    // We track by color+type+instance to handle multiple pieces of the same type
    const colorTypeCounts: Record<string, number> = {};
    const sortedPieces = [...pieces].sort((a, b) => {
      if (a.color !== b.color) return a.color < b.color ? -1 : 1;
      if (a.type !== b.type) return a.type < b.type ? -1 : 1;
      if (a.position.file !== b.position.file) return a.position.file - b.position.file;
      return a.position.rank - b.position.rank;
    });

    for (const piece of sortedPieces) {
      const baseKey = pieceIdKey(piece.color, piece.type);
      colorTypeCounts[baseKey] = (colorTypeCounts[baseKey] || 0) + 1;
      const stableKey = `${baseKey}-${colorTypeCounts[baseKey]}`;
      currentPositions.set(stableKey, {
        x: toX(piece.position.file),
        y: toY(piece.position.rank),
        file: piece.position.file,
        rank: piece.position.rank,
      });
    }

    const prev = prevPiecesRef.current;
    const newAnims = new Map<string, { fromX: number; fromY: number; toX: number; toY: number; progress: number }>();
    let hasCaptureAt: { x: number; y: number } | null = null;

    // Detect moved pieces
    if (lastMove && prev.size > 0) {
      for (const [key, curr] of currentPositions) {
        const prevPos = prev.get(key);
        if (prevPos && (prevPos.x !== curr.x || prevPos.y !== curr.y)) {
          newAnims.set(key, {
            fromX: prevPos.x,
            fromY: prevPos.y,
            toX: curr.x,
            toY: curr.y,
            progress: 0,
          });
        }
      }

      // Detect capture: a piece that was in prev but not in current
      if (prev.size > currentPositions.size) {
        // There was a capture; show particles at the lastMove.to position
        hasCaptureAt = { x: toX(lastMove.to.file), y: toY(lastMove.to.rank) };
      }
    }

    // Start move animation
    if (newAnims.size > 0) {
      setAnimatingPieces(newAnims);
      const startTime = performance.now();
      const duration = ANIM_DURATION.move;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const raw = Math.min(elapsed / duration, 1);
        const progress = easeOutCubic(raw);

        setAnimatingPieces((prev) => {
          const updated = new Map(prev);
          for (const [k, v] of updated) {
            updated.set(k, { ...v, progress });
          }
          return updated;
        });

        if (raw < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setAnimatingPieces(new Map());
        }
      };

      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(animate);
    }

    // Spawn capture particles
    if (hasCaptureAt) {
      const colors = ['#EF4444', '#F97316', '#FBBF24', '#F59E0B', '#DC2626', '#FF6B6B'];
      const newParticles: CaptureParticle[] = [];
      const now = performance.now();
      for (let i = 0; i < 12; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: hasCaptureAt.x,
          y: hasCaptureAt.y,
          angle: (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5,
          speed: 40 + Math.random() * 60,
          size: 3 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          startTime: now,
        });
      }
      setCaptureParticles((p) => [...p, ...newParticles]);

      // Animate particles
      const captureDuration = ANIM_DURATION.capture;
      const animateParticles = (now2: number) => {
        setCaptureParticles((particles) => {
          const alive = particles.filter((p) => now2 - p.startTime < captureDuration);
          return alive;
        });
        if (setCaptureParticles.length > 0) {
          // Check if any particles are still alive
          requestAnimationFrame((t) => {
            setCaptureParticles((particles) => {
              const alive = particles.filter((p) => t - p.startTime < captureDuration);
              if (alive.length > 0) requestAnimationFrame(animateParticles);
              return alive;
            });
          });
        }
      };
      requestAnimationFrame(animateParticles);
    }

    // Save current positions for next comparison
    const nextPrev = new Map<string, { x: number; y: number }>();
    for (const [k, v] of currentPositions) {
      nextPrev.set(k, { x: v.x, y: v.y });
    }
    prevPiecesRef.current = nextPrev;

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [pieces, lastMove, toX, toY]);

  /* ── Checkmate animation ── */
  useEffect(() => {
    if (!isCheckmate) {
      setCheckmateAnim({ progress: 0, active: false });
      return;
    }

    setCheckmateAnim({ progress: 0, active: true });
    const startTime = performance.now();
    const duration = ANIM_DURATION.checkmate;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const raw = Math.min(elapsed / duration, 1);
      setCheckmateAnim({ progress: raw, active: true });
      if (raw < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isCheckmate]);

  const handleClick = (file: number, rank: number) => {
    onPositionSelect?.({ file, rank });
  };

  /* ── render helpers ── */

  const renderGrid = () => {
    const lines: React.ReactNode[] = [];

    for (let displayRank = 0; displayRank < RANKS; displayRank++) {
      const y = PAD + displayRank * CELL;
      lines.push(
        <line key={`h-${displayRank}`}
          x1={PAD} y1={y} x2={PAD + (FILES - 1) * CELL} y2={y}
          stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      );
    }

    for (let file = 0; file < FILES; file++) {
      const x = PAD + file * CELL;
      if (file === 0 || file === FILES - 1) {
        lines.push(
          <line key={`v-${file}`}
            x1={x} y1={PAD} x2={x} y2={PAD + (RANKS - 1) * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
        );
      } else {
        lines.push(
          <line key={`vt-${file}`}
            x1={x} y1={PAD} x2={x} y2={PAD + 4 * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
        );
        lines.push(
          <line key={`vb-${file}`}
            x1={x} y1={PAD + 5 * CELL} x2={x} y2={PAD + (RANKS - 1) * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
        );
      }
    }

    return lines;
  };

  const renderPalaceDiagonals = () => (
    <>
      <line x1={PAD + 3 * CELL} y1={PAD} x2={PAD + 5 * CELL} y2={PAD + 2 * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      <line x1={PAD + 5 * CELL} y1={PAD} x2={PAD + 3 * CELL} y2={PAD + 2 * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      <line x1={PAD + 3 * CELL} y1={PAD + 7 * CELL} x2={PAD + 5 * CELL} y2={PAD + 9 * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      <line x1={PAD + 5 * CELL} y1={PAD + 7 * CELL} x2={PAD + 3 * CELL} y2={PAD + 9 * CELL}
            stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
    </>
  );

  const renderRiver = () => {
    const y = PAD + 4 * CELL;
    const h = CELL;
    const topText = flipBoard ? '漢　　界' : '楚　　河';
    const bottomText = flipBoard ? '楚　　河' : '漢　　界';
    return (
      <>
        <rect x={PAD} y={y} width={(FILES - 1) * CELL} height={h}
              fill={t.river} opacity={0.5} />
        <text x={PAD + (FILES - 1) * CELL * 0.25} y={y + h / 2 + 8}
              textAnchor="middle" fill={t.riverText}
              fontSize={20} fontFamily="KaiTi, STKaiti, serif"
              fontWeight="bold" letterSpacing={6}>{topText}</text>
        <text x={PAD + (FILES - 1) * CELL * 0.75} y={y + h / 2 + 8}
              textAnchor="middle" fill={t.riverText}
              fontSize={20} fontFamily="KaiTi, STKaiti, serif"
              fontWeight="bold" letterSpacing={6}>{bottomText}</text>
      </>
    );
  };

  const renderCrossMarks = () => {
    const arm = 6;
    const gap = 4;
    const elems: React.ReactNode[] = [];

    CROSS_MARKS.forEach((pos) => {
      const cx = toX(pos.file);
      const cy = toY(pos.rank);
      const key = `cross-${pos.file}-${pos.rank}`;

      const arms: [number, number][] = [];
      if (pos.file > 0) arms.push([-1, -1], [-1, 1]);
      if (pos.file < 8) arms.push([1, -1], [1, 1]);

      arms.forEach(([dx, dy], i) => {
        elems.push(
          <line key={`${key}-h-${i}`}
            x1={cx + dx * gap} y1={cy + dy * gap}
            x2={cx + dx * (gap + arm)} y2={cy + dy * gap}
            stroke={t.gridLine} strokeWidth={1} />
        );
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
    return (
      <>
        {[lastMove.from, lastMove.to].map((pos, i) => {
          const cx = toX(pos.file);
          const cy = toY(pos.rank);
          const size = CELL * 0.8;
          return (
            <rect key={`lm-${i}`}
              x={cx - size / 2} y={cy - size / 2}
              width={size} height={size}
              rx={4} ry={4} fill="#3B82F6" opacity={0.25} />
          );
        })}
      </>
    );
  };

  const renderSelectedHighlight = () => {
    if (!selectedPosition) return null;
    const cx = toX(selectedPosition.file);
    const cy = toY(selectedPosition.rank);
    const size = CELL * 0.85;
    return (
      <>
        {/* Pulsing glow behind selection */}
        <circle cx={cx} cy={cy} r={PIECE_R + 8} fill="#22C55E" opacity={0.15}>
          <animate attributeName="r" values={`${PIECE_R + 6};${PIECE_R + 12};${PIECE_R + 6}`}
            dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.08;0.15"
            dur="0.8s" repeatCount="indefinite" />
        </circle>
        <rect x={cx - size / 2} y={cy - size / 2}
          width={size} height={size}
          rx={4} ry={4} fill="#22C55E" opacity={0.35}
          data-testid="selected-position" />
      </>
    );
  };

  const renderValidMoves = () =>
    validMoves.map((pos, i) => {
      const cx = toX(pos.file);
      const cy = toY(pos.rank);
      const isCapture = pieces.some(
        (p) => p.position.file === pos.file && p.position.rank === pos.rank
      );
      if (isCapture) {
        return (
          <g key={`vm-${i}`}>
            <circle cx={cx} cy={cy} r={PIECE_R + 2}
              fill="none" stroke="#EF4444" strokeWidth={3} opacity={0.7}
              data-testid="valid-move-indicator">
              <animate attributeName="strokeWidth" values="2;4;2"
                dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        );
      }
      return (
        <circle key={`vm-${i}`}
          cx={cx} cy={cy} r={7}
          fill="#22C55E" opacity={0.7}
          data-testid="valid-move-indicator">
          <animate attributeName="r" values="5;8;5" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0.4;0.7" dur="1.2s" repeatCount="indefinite" />
        </circle>
      );
    });

  const renderCheckIndicator = () => {
    if (!inCheck) return null;
    const cx = toX(inCheck.file);
    const cy = toY(inCheck.rank);
    return (
      <g>
        {/* Outer pulsing ring */}
        <circle cx={cx} cy={cy} r={PIECE_R + 6}
          fill="none" stroke="#EF4444" strokeWidth={3} opacity={0.8}>
          <animate attributeName="r" values={`${PIECE_R + 4};${PIECE_R + 14};${PIECE_R + 4}`}
            dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.2;0.9"
            dur="0.8s" repeatCount="indefinite" />
        </circle>
        {/* Inner red glow */}
        <circle cx={cx} cy={cy} r={PIECE_R + 2}
          fill="#EF4444" opacity={0.15}>
          <animate attributeName="opacity" values="0.15;0.3;0.15"
            dur="0.6s" repeatCount="indefinite" />
        </circle>
        {/* "将军" text above */}
        <text x={cx} y={cy - PIECE_R - 12}
          textAnchor="middle" fill="#EF4444"
          fontSize={16} fontWeight="bold"
          fontFamily="KaiTi, STKaiti, serif">
          <animate attributeName="opacity" values="1;0.5;1"
            dur="0.8s" repeatCount="indefinite" />
          将军！
        </text>
      </g>
    );
  };

  /* ── Capture particles rendering ── */
  const renderCaptureParticles = () => {
    if (captureParticles.length === 0) return null;
    const now = performance.now();
    return (
      <g>
        {captureParticles.map((p) => {
          const elapsed = now - p.startTime;
          const progress = Math.min(elapsed / ANIM_DURATION.capture, 1);
          const eased = easeOutCubic(progress);
          const px = p.x + Math.cos(p.angle) * p.speed * eased;
          const py = p.y + Math.sin(p.angle) * p.speed * eased;
          const opacity = 1 - progress;
          const size = p.size * (1 - progress * 0.5);
          return (
            <circle key={p.id}
              cx={px} cy={py} r={size}
              fill={p.color} opacity={opacity} />
          );
        })}
      </g>
    );
  };

  /* ── Checkmate overlay ── */
  const renderCheckmateOverlay = () => {
    if (!checkmateAnim.active) return null;
    const { progress } = checkmateAnim;
    const centerX = BOARD_W / 2;
    const centerY = BOARD_H / 2;
    const maxRadius = Math.max(BOARD_W, BOARD_H);
    const waveRadius = maxRadius * easeOutCubic(progress);
    const waveOpacity = 0.3 * (1 - progress);
    const glowColor = checkmateWinner === 'red' ? '#EF4444' : '#3B82F6';

    return (
      <g>
        {/* Shockwave ring */}
        <circle cx={centerX} cy={centerY} r={waveRadius}
          fill="none" stroke={glowColor} strokeWidth={4}
          opacity={waveOpacity} />
        {/* Inner glow */}
        <circle cx={centerX} cy={centerY} r={waveRadius * 0.6}
          fill={glowColor} opacity={waveOpacity * 0.3} />
        {/* Radial lines */}
        {progress > 0.2 && Array.from({ length: 8 }, (_, i) => {
          const angle = (Math.PI * 2 * i) / 8;
          const len = waveRadius * 0.8;
          return (
            <line key={`ray-${i}`}
              x1={centerX} y1={centerY}
              x2={centerX + Math.cos(angle) * len}
              y2={centerY + Math.sin(angle) * len}
              stroke={glowColor} strokeWidth={2}
              opacity={waveOpacity * 0.5} />
          );
        })}
      </g>
    );
  };

  /* ── Pieces with animation ── */
  const renderPieces = () => {
    // Build stable keys matching the animation tracking
    const colorTypeCounts: Record<string, number> = {};
    const sortedPieces = [...pieces].sort((a, b) => {
      if (a.color !== b.color) return a.color < b.color ? -1 : 1;
      if (a.type !== b.type) return a.type < b.type ? -1 : 1;
      if (a.position.file !== b.position.file) return a.position.file - b.position.file;
      return a.position.rank - b.position.rank;
    });

    return sortedPieces.map((piece) => {
      const baseKey = pieceIdKey(piece.color, piece.type);
      colorTypeCounts[baseKey] = (colorTypeCounts[baseKey] || 0) + 1;
      const stableKey = `${baseKey}-${colorTypeCounts[baseKey]}`;

      let cx = toX(piece.position.file);
      let cy = toY(piece.position.rank);

      // Apply slide animation if active
      const anim = animatingPieces.get(stableKey);
      if (anim) {
        cx = anim.fromX + (anim.toX - anim.fromX) * anim.progress;
        cy = anim.fromY + (anim.toY - anim.fromY) * anim.progress;
      }

      const label = PIECE_LABELS[piece.type][piece.color];
      const isRed = piece.color === Color.Red;

      // Landing bounce: scale up slightly at end of animation
      let scaleTransform = '';
      if (anim && anim.progress > 0.8) {
        const bounceProgress = (anim.progress - 0.8) / 0.2;
        const scale = 1 + 0.08 * Math.sin(bounceProgress * Math.PI);
        scaleTransform = ` scale(${scale})`;
      }

      return (
        <g key={stableKey}
           transform={`translate(${cx}, ${cy})${scaleTransform}`}
           style={{ cursor: 'pointer' }}>
          {/* Drop shadow */}
          <circle cx={1} cy={2} r={PIECE_R} fill="rgba(0,0,0,0.15)" />
          {/* Piece body */}
          <circle cx={0} cy={0} r={PIECE_R}
            fill={isRed ? t.pieceFillRed : t.pieceFillBlack}
            stroke={t.pieceStroke} strokeWidth={2} />
          {/* Inner ring */}
          <circle cx={0} cy={0} r={PIECE_R - 4}
            fill="none"
            stroke={isRed ? t.pieceTextRed : t.pieceTextBlack}
            strokeWidth={1} opacity={0.5} />
          {/* Character */}
          <text x={0} y={FONT_SIZE * 0.35}
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
  };

  const renderClickTargets = () => {
    const targets: React.ReactNode[] = [];
    for (let rank = 0; rank < RANKS; rank++) {
      for (let file = 0; file < FILES; file++) {
        const cx = toX(file);
        const cy = toY(rank);
        targets.push(
          <circle key={`click-${file}-${rank}`}
            cx={cx} cy={cy} r={PIECE_R + 2}
            fill="transparent"
            style={{ cursor: 'pointer' }}
            role="button"
            aria-label={`Position ${file},${rank}`}
            onClick={(e) => { e.stopPropagation(); handleClick(file, rank); }} />
        );
      }
    }
    return targets;
  };

  /* ── SVG Defs for effects ── */
  const renderDefs = () => (
    <defs>
      <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feFlood floodColor="#EF4444" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feFlood floodColor="#FBBF24" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="shadow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );

  /* ── render ── */
  return (
    <div role="grid" aria-label="Chinese Chess Board"
      className={`relative w-full max-w-xl mx-auto ${className}`}>
      <svg ref={svgRef}
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        className="w-full h-auto"
        style={{ display: 'block' }}>
        {renderDefs()}

        {/* Board background */}
        <rect x={0} y={0} width={BOARD_W} height={BOARD_H}
          rx={6} ry={6} fill={t.bg} />

        {/* Board border */}
        <rect x={PAD - 4} y={PAD - 4}
          width={(FILES - 1) * CELL + 8} height={(RANKS - 1) * CELL + 8}
          fill="none" stroke={t.boardBorder} strokeWidth={3} rx={2} ry={2} />

        {renderGrid()}
        {renderPalaceDiagonals()}
        {renderRiver()}
        {renderCrossMarks()}
        {renderLastMoveHighlight()}
        {renderSelectedHighlight()}
        {renderValidMoves()}
        {renderCheckIndicator()}
        {renderCaptureParticles()}
        {renderPieces()}
        {renderCheckmateOverlay()}
        {renderClickTargets()}
      </svg>
    </div>
  );
};

export default BoardView;
