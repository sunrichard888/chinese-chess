/**
 * BoardView Component - Chinese Chess Board (Pure SVG) with Animations
 *
 * Features:
 * - Pure SVG rendering for pixel-perfect alignment
 * - 3D-style pieces with radial gradients and shadows
 * - Piece slide animation with landing bounce
 * - Capture burst particles
 * - Full-board "将军！" / "绝杀！" announcement overlay (replaces modal)
 * - 3D board with wood grain texture simulation
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Position, Piece, Color, PieceType } from '../core/types';
import { easeOutCubic, easeOutBack, easeInOutQuad, ANIM_DURATION, Announcement } from './animations';

/* ─────────────────────────── props ─────────────────────────── */

interface BoardViewProps {
  pieces?: readonly Piece[];
  selectedPosition?: Position | null;
  validMoves?: Position[];
  lastMove?: { from: Position; to: Position } | null;
  inCheck?: Position | null;
  isCheckmate?: boolean;
  checkmateWinner?: 'red' | 'black' | null;
  /** Triggered after checkmate announcement finishes */
  onCheckmateAnimDone?: () => void;
  onPositionSelect?: (position: Position) => void;
  className?: string;
  flipBoard?: boolean;
  theme?: 'classic' | 'stone' | 'glass';
}

/* ─────────────────────────── constants ─────────────────────── */

const FILES = 9;
const RANKS = 10;
const CELL = 60;
const PAD = 40;
const PIECE_R = 25;
const FONT_SIZE = 26;

const BOARD_W = (FILES - 1) * CELL + PAD * 2;
const BOARD_H = (RANKS - 1) * CELL + PAD * 2;

/* ─────────────────────────── themes (3D enhanced) ─────────── */

interface ThemeColors {
  id: string;
  bg: string;
  bgGradient: [string, string];
  gridLine: string;
  gridLineWidth: number;
  river: string;
  riverText: string;
  pieceStroke: string;
  pieceGradRed: [string, string, string];
  pieceGradBlack: [string, string, string];
  pieceTextRed: string;
  pieceTextBlack: string;
  boardBorder: string;
  boardShadow: string;
  // Extended 3D properties
  boardTexture?: 'wood' | 'stone' | 'glass';
  pieceStyle?: 'classic' | 'jade' | 'crystal';
  gridShadow?: boolean;
  innerGlow?: string;
  surfaceNoise?: number;     // feTurbulence base frequency for texture
  surfaceOctaves?: number;
}

const themes: Record<string, ThemeColors> = {
  classic: {
    id: 'classic',
    bg: '#F0D9B5',
    bgGradient: ['#F5E6CC', '#D4A76A'],
    gridLine: '#5C3317',
    gridLineWidth: 1.5,
    river: '#E8C98E',
    riverText: '#5C3317',
    pieceStroke: '#6B3A1F',
    pieceGradRed: ['#FFF8F0', '#F5E6D0', '#C4A882'],
    pieceGradBlack: ['#FFF8F0', '#F5E6D0', '#C4A882'],
    pieceTextRed: '#B30000',
    pieceTextBlack: '#1A1A1A',
    boardBorder: '#4A2810',
    boardShadow: '#3D2010',
    boardTexture: 'wood',
    pieceStyle: 'classic',
  },
  stone: {
    id: 'stone',
    bg: '#708090',
    bgGradient: ['#9AACBA', '#556677'],
    gridLine: '#2C3E50',
    gridLineWidth: 1.8,
    river: '#607080',
    riverText: '#E8ECF0',
    pieceStroke: '#3D4F5F',
    // Green jade red pieces, black obsidian black pieces — solid opaque colors
    pieceGradRed: ['#C8E6C0', '#7CB870', '#4A8040'],
    pieceGradBlack: ['#4A4A4A', '#2A2A2A', '#151515'],
    pieceTextRed: '#6B0000',
    pieceTextBlack: '#D4AF37',
    boardBorder: '#3D4F5F',
    boardShadow: '#1A2530',
    boardTexture: 'stone',
    pieceStyle: 'jade',
    gridShadow: true,
  },
  glass: {
    id: 'glass',
    bg: '#2A3A50',
    bgGradient: ['#354A60', '#253545'],
    gridLine: '#6A9AC4',
    gridLineWidth: 1.2,
    river: '#304050',
    riverText: '#8ABDE0',
    pieceStroke: '#5A8AB5',
    // Crystal pieces — solid, high contrast
    pieceGradRed: ['#FFDDDD', '#E87070', '#B04040'],
    pieceGradBlack: ['#DDEAFF', '#70A0E0', '#4070B0'],
    pieceTextRed: '#FFFFFF',
    pieceTextBlack: '#FFFFFF',
    boardBorder: '#5A8AB5',
    boardShadow: '#101820',
    boardTexture: 'glass',
    pieceStyle: 'crystal',
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

/* ───────────────── capture particle ───────────────────────── */

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
  onCheckmateAnimDone,
  onPositionSelect,
  className = '',
  flipBoard = false,
  theme = 'classic',
}) => {
  const t = themes[theme] ?? themes.classic;
  const svgRef = useRef<SVGSVGElement>(null);

  // Animation state
  const [animatingPieces, setAnimatingPieces] = useState<Map<string, { fromX: number; fromY: number; toX: number; toY: number; progress: number }>>(new Map());
  const [captureParticles, setCaptureParticles] = useState<CaptureParticle[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const animFrameRef = useRef<number>(0);
  const particleIdRef = useRef(0);
  const prevCheckRef = useRef<boolean>(false);
  const prevCheckmateRef = useRef<boolean>(false);

  /* ── coordinate helpers ── */
  const toX = useCallback((file: number) => PAD + file * CELL, []);
  const toY = useCallback((rank: number) => {
    const displayRank = flipBoard ? rank : (RANKS - 1 - rank);
    return PAD + displayRank * CELL;
  }, [flipBoard]);

  /* ── Announcement triggers ── */
  // Check announcement
  useEffect(() => {
    const isCheck = !!inCheck && !isCheckmate;
    if (isCheck && !prevCheckRef.current) {
      setAnnouncement({
        text: '将 军',
        subText: undefined,
        color: '#FF2020',
        glowColor: '#FF0000',
        startTime: performance.now(),
        duration: ANIM_DURATION.announcement,
      });
    }
    prevCheckRef.current = isCheck;
  }, [inCheck, isCheckmate]);

  // Checkmate announcement
  useEffect(() => {
    if (isCheckmate && !prevCheckmateRef.current) {
      const winnerText = checkmateWinner === 'red' ? '红方胜' : '黑方胜';
      setAnnouncement({
        text: '绝 杀',
        subText: winnerText,
        color: checkmateWinner === 'red' ? '#FF2020' : '#4488FF',
        glowColor: checkmateWinner === 'red' ? '#FF0000' : '#2266DD',
        startTime: performance.now(),
        duration: ANIM_DURATION.announcement + 500, // longer for checkmate
      });
      // Callback after animation
      if (onCheckmateAnimDone) {
        setTimeout(onCheckmateAnimDone, ANIM_DURATION.announcement + 600);
      }
    }
    prevCheckmateRef.current = isCheckmate;
  }, [isCheckmate, checkmateWinner, onCheckmateAnimDone]);

  // Animate announcement
  useEffect(() => {
    if (!announcement) return;
    const { startTime, duration } = announcement;

    const tick = () => {
      const now = performance.now();
      if (now - startTime >= duration) {
        setAnnouncement(null);
        return;
      }
      // Force re-render for particle-style effects
      setAnnouncement((a) => a ? { ...a } : null);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [announcement?.startTime]);

  /* ── Detect piece movements and trigger slide animations ── */
  // Instead of tracking all pieces by unstable sort-order keys,
  // use lastMove to identify exactly which piece moved and animate only that one.
  const prevLastMoveRef = useRef<typeof lastMove>(null);

  useEffect(() => {
    // Only animate when a new lastMove appears
    if (!lastMove || lastMove === prevLastMoveRef.current) {
      prevLastMoveRef.current = lastMove;
      return;
    }

    prevLastMoveRef.current = lastMove;

    // Calculate from/to screen coordinates for the moved piece
    const fromX = toX(lastMove.from.file);
    const fromY = toY(lastMove.from.rank);
    const toXPos = toX(lastMove.to.file);
    const toYPos = toY(lastMove.to.rank);

    // Skip if no actual movement on screen
    if (fromX === toXPos && fromY === toYPos) return;

    // Find the piece that is now at the destination (the piece that moved)
    const movedPiece = pieces.find(
      p => p.position.file === lastMove.to.file && p.position.rank === lastMove.to.rank
    );
    if (!movedPiece) return;

    // Use a unique key for this specific piece at its destination
    const animKey = `${movedPiece.color}-${movedPiece.type}-${lastMove.to.file}-${lastMove.to.rank}`;

    const newAnims = new Map<string, { fromX: number; fromY: number; toX: number; toY: number; progress: number }>();
    newAnims.set(animKey, { fromX, fromY, toX: toXPos, toY: toYPos, progress: 0 });

    setAnimatingPieces(newAnims);
    const startTime = performance.now();
    const duration = ANIM_DURATION.move;
    const animate = (now: number) => {
      const raw = Math.min((now - startTime) / duration, 1);
      const progress = easeOutCubic(raw);
      setAnimatingPieces((prev) => {
        const updated = new Map(prev);
        for (const [k, v] of updated) updated.set(k, { ...v, progress });
        return updated;
      });
      if (raw < 1) animFrameRef.current = requestAnimationFrame(animate);
      else setAnimatingPieces(new Map());
    };
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [lastMove, pieces, toX, toY]);

  // Separate capture particle effect tracking
  const prevPieceCountRef = useRef(pieces.length);
  useEffect(() => {
    const prevCount = prevPieceCountRef.current;
    prevPieceCountRef.current = pieces.length;

    if (lastMove && prevCount > pieces.length) {
      // A capture occurred
      const cx = toX(lastMove.to.file);
      const cy = toY(lastMove.to.rank);
      const colors = ['#EF4444', '#F97316', '#FBBF24', '#F59E0B', '#DC2626', '#FF6B6B'];
      const now = performance.now();
      const newP: CaptureParticle[] = [];
      for (let i = 0; i < 14; i++) {
        newP.push({
          id: particleIdRef.current++,
          x: cx, y: cy,
          angle: (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.5,
          speed: 35 + Math.random() * 65,
          size: 2.5 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          startTime: now,
        });
      }
      setCaptureParticles((p) => [...p, ...newP]);
      const animP = () => {
        requestAnimationFrame((t2) => {
          setCaptureParticles((ps) => {
            const alive = ps.filter((p) => t2 - p.startTime < ANIM_DURATION.capture);
            if (alive.length > 0) requestAnimationFrame(animP);
            return alive;
          });
        });
      };
      requestAnimationFrame(animP);
    }
  }, [pieces.length, lastMove, toX, toY]);

  const handleClick = (file: number, rank: number) => {
    onPositionSelect?.({ file, rank });
  };

  /* ══════════════════ SVG Defs (3D effects) ══════════════════ */

  const renderDefs = () => (
    <defs>
      {/* ── Board backgrounds ── */}
      <linearGradient id="board-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={t.bgGradient[0]} />
        <stop offset="100%" stopColor={t.bgGradient[1]} />
      </linearGradient>

      {/* Stone theme: clean specular highlight, no feTurbulence noise */}
      {t.boardTexture === 'stone' && (
        <>
          <linearGradient id="stone-specular" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.08" />
          </linearGradient>
          {/* Engraved line effect: line + light edge below = chiseled groove */}
          <filter id="engrave" x="-5%" y="-5%" width="110%" height="110%">
            <feOffset dx="0" dy="1" in="SourceGraphic" result="offset" />
            <feFlood floodColor="white" floodOpacity="0.25" result="light" />
            <feComposite in="light" in2="offset" operator="in" result="highlight" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="highlight" />
            </feMerge>
          </filter>
        </>
      )}

      {/* Glass theme: clean dark surface with subtle reflection, NO frosted blur */}
      {t.boardTexture === 'glass' && (
        <>
          <linearGradient id="glass-reflection" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="40%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.04" />
          </linearGradient>
          {/* Grid line glow — subtle, not blurry */}
          <filter id="grid-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Crystal piece glow — clean, not frosted */}
          <filter id="crystal-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor="rgba(100,160,255,0.2)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="crystal-glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor="rgba(255,100,100,0.2)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </>
      )}

      {/* ── 3D piece gradients ── */}
      <radialGradient id="piece-grad-red" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor={t.pieceGradRed[0]} />
        <stop offset="60%" stopColor={t.pieceGradRed[1]} />
        <stop offset="100%" stopColor={t.pieceGradRed[2]} />
      </radialGradient>
      <radialGradient id="piece-grad-black" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor={t.pieceGradBlack[0]} />
        <stop offset="60%" stopColor={t.pieceGradBlack[1]} />
        <stop offset="100%" stopColor={t.pieceGradBlack[2]} />
      </radialGradient>

      {/* Piece bevel highlight — clear, not frosted */}
      <radialGradient id="piece-highlight" cx="35%" cy="30%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0.35" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>

      {/* Jade refraction — subtle green light refraction on red jade pieces */}
      {t.pieceStyle === 'jade' && (
        <radialGradient id="jade-refraction" cx="55%" cy="60%" r="45%">
          <stop offset="0%" stopColor="#90EE90" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#006400" stopOpacity="0" />
        </radialGradient>
      )}

      {/* Drop shadow filter */}
      <filter id="piece-shadow" x="-20%" y="-10%" width="140%" height="150%">
        <feDropShadow dx={t.pieceStyle === 'crystal' ? '0' : '1.5'}
          dy={t.pieceStyle === 'crystal' ? '2' : '3'}
          stdDeviation={t.pieceStyle === 'crystal' ? '3' : '2.5'}
          floodColor={t.pieceStyle === 'crystal' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.35)'} />
      </filter>

      {/* Board edge shadow */}
      <filter id="board-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor={t.boardShadow} floodOpacity="0.4" />
      </filter>

      {/* Glow filters for announcements */}
      <filter id="text-glow-red" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feFlood floodColor="#FF0000" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="text-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feFlood floodColor="#2266DD" floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>

      {/* Check ring glow */}
      <filter id="check-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feFlood floodColor="#FF0000" floodOpacity="0.5" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  );

  /* ══════════════════ Board rendering ═════════════════════════ */

  const renderGrid = () => {
    const lines: React.ReactNode[] = [];
    for (let dr = 0; dr < RANKS; dr++) {
      const y = PAD + dr * CELL;
      lines.push(<line key={`h-${dr}`} x1={PAD} y1={y} x2={PAD + (FILES - 1) * CELL} y2={y} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />);
    }
    for (let f = 0; f < FILES; f++) {
      const x = PAD + f * CELL;
      if (f === 0 || f === FILES - 1) {
        lines.push(<line key={`v-${f}`} x1={x} y1={PAD} x2={x} y2={PAD + (RANKS - 1) * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />);
      } else {
        lines.push(<line key={`vt-${f}`} x1={x} y1={PAD} x2={x} y2={PAD + 4 * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />);
        lines.push(<line key={`vb-${f}`} x1={x} y1={PAD + 5 * CELL} x2={x} y2={PAD + (RANKS - 1) * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />);
      }
    }
    return lines;
  };

  const renderPalaceDiagonals = () => (
    <>
      <line x1={PAD + 3 * CELL} y1={PAD} x2={PAD + 5 * CELL} y2={PAD + 2 * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      <line x1={PAD + 5 * CELL} y1={PAD} x2={PAD + 3 * CELL} y2={PAD + 2 * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      <line x1={PAD + 3 * CELL} y1={PAD + 7 * CELL} x2={PAD + 5 * CELL} y2={PAD + 9 * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
      <line x1={PAD + 5 * CELL} y1={PAD + 7 * CELL} x2={PAD + 3 * CELL} y2={PAD + 9 * CELL} stroke={t.gridLine} strokeWidth={t.gridLineWidth} />
    </>
  );

  const renderRiver = () => {
    const y = PAD + 4 * CELL;
    const h = CELL;
    const topText = flipBoard ? '漢　　界' : '楚　　河';
    const bottomText = flipBoard ? '楚　　河' : '漢　　界';
    return (
      <>
        <rect x={PAD} y={y} width={(FILES - 1) * CELL} height={h} fill={t.river} opacity={0.5} />
        <text x={PAD + (FILES - 1) * CELL * 0.25} y={y + h / 2 + 8} textAnchor="middle" fill={t.riverText}
          fontSize={20} fontFamily="KaiTi, STKaiti, serif" fontWeight="bold" letterSpacing={6}>{topText}</text>
        <text x={PAD + (FILES - 1) * CELL * 0.75} y={y + h / 2 + 8} textAnchor="middle" fill={t.riverText}
          fontSize={20} fontFamily="KaiTi, STKaiti, serif" fontWeight="bold" letterSpacing={6}>{bottomText}</text>
      </>
    );
  };

  const renderCrossMarks = () => {
    const arm = 6, gap = 4;
    const elems: React.ReactNode[] = [];
    CROSS_MARKS.forEach((pos) => {
      const cx = toX(pos.file), cy = toY(pos.rank);
      const key = `cross-${pos.file}-${pos.rank}`;
      const arms: [number, number][] = [];
      if (pos.file > 0) arms.push([-1, -1], [-1, 1]);
      if (pos.file < 8) arms.push([1, -1], [1, 1]);
      arms.forEach(([dx, dy], i) => {
        elems.push(<line key={`${key}-h-${i}`} x1={cx + dx * gap} y1={cy + dy * gap} x2={cx + dx * (gap + arm)} y2={cy + dy * gap} stroke={t.gridLine} strokeWidth={1} />);
        elems.push(<line key={`${key}-v-${i}`} x1={cx + dx * gap} y1={cy + dy * gap} x2={cx + dx * gap} y2={cy + dy * (gap + arm)} stroke={t.gridLine} strokeWidth={1} />);
      });
    });
    return elems;
  };

  const renderLastMoveHighlight = () => {
    if (!lastMove) return null;
    return <>{[lastMove.from, lastMove.to].map((pos, i) => {
      const cx = toX(pos.file), cy = toY(pos.rank), size = CELL * 0.8;
      return <rect key={`lm-${i}`} x={cx - size / 2} y={cy - size / 2} width={size} height={size} rx={4} ry={4} fill="#3B82F6" opacity={0.25} />;
    })}</>;
  };

  const renderSelectedHighlight = () => {
    if (!selectedPosition) return null;
    const cx = toX(selectedPosition.file), cy = toY(selectedPosition.rank), size = CELL * 0.85;
    return (
      <>
        <circle cx={cx} cy={cy} r={PIECE_R + 8} fill="#22C55E" opacity={0.15}>
          <animate attributeName="r" values={`${PIECE_R + 6};${PIECE_R + 12};${PIECE_R + 6}`} dur="0.8s" repeatCount="indefinite" />
        </circle>
        <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} rx={4} ry={4} fill="#22C55E" opacity={0.35} data-testid="selected-position" />
      </>
    );
  };

  const renderValidMoves = () => validMoves.map((pos, i) => {
    const cx = toX(pos.file), cy = toY(pos.rank);
    const isCapture = pieces.some((p) => p.position.file === pos.file && p.position.rank === pos.rank);
    if (isCapture) {
      return (
        <circle key={`vm-${i}`} cx={cx} cy={cy} r={PIECE_R + 2} fill="none" stroke="#EF4444" strokeWidth={3} opacity={0.7} data-testid="valid-move-indicator">
          <animate attributeName="strokeWidth" values="2;4;2" dur="1s" repeatCount="indefinite" />
        </circle>
      );
    }
    return (
      <circle key={`vm-${i}`} cx={cx} cy={cy} r={7} fill="#22C55E" opacity={0.7} data-testid="valid-move-indicator">
        <animate attributeName="r" values="5;8;5" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0.4;0.7" dur="1.2s" repeatCount="indefinite" />
      </circle>
    );
  });

  /* ── Check indicator (ring only, no text — text is in announcement overlay) ── */
  const renderCheckIndicator = () => {
    if (!inCheck) return null;
    const cx = toX(inCheck.file), cy = toY(inCheck.rank);
    return (
      <g filter="url(#check-glow)">
        <circle cx={cx} cy={cy} r={PIECE_R + 6} fill="none" stroke="#EF4444" strokeWidth={3} opacity={0.9}>
          <animate attributeName="r" values={`${PIECE_R + 4};${PIECE_R + 14};${PIECE_R + 4}`} dur="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="0.8s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={PIECE_R + 2} fill="#EF4444" opacity={0.12}>
          <animate attributeName="opacity" values="0.12;0.25;0.12" dur="0.6s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  };

  /* ── Capture particles ── */
  const renderCaptureParticles = () => {
    if (captureParticles.length === 0) return null;
    const now = performance.now();
    return <g>{captureParticles.map((p) => {
      const elapsed = now - p.startTime;
      const progress = Math.min(elapsed / ANIM_DURATION.capture, 1);
      const eased = easeOutCubic(progress);
      return <circle key={p.id}
        cx={p.x + Math.cos(p.angle) * p.speed * eased}
        cy={p.y + Math.sin(p.angle) * p.speed * eased}
        r={p.size * (1 - progress * 0.5)}
        fill={p.color} opacity={1 - progress} />;
    })}</g>;
  };

  /* ══════════════════ 3D Pieces ══════════════════════════════ */

  const renderPieces = () => {
    return pieces.map((piece) => {
      // Unique key per piece based on its CURRENT position (stable, no sort-order ambiguity)
      const pieceKey = `${piece.color}-${piece.type}-${piece.position.file}-${piece.position.rank}`;

      let cx = toX(piece.position.file);
      let cy = toY(piece.position.rank);

      // Check if this specific piece is being animated
      const anim = animatingPieces.get(pieceKey);
      if (anim) {
        cx = anim.fromX + (anim.toX - anim.fromX) * anim.progress;
        cy = anim.fromY + (anim.toY - anim.fromY) * anim.progress;
      }

      const label = PIECE_LABELS[piece.type][piece.color];
      const isRed = piece.color === Color.Red;
      const gradId = isRed ? 'piece-grad-red' : 'piece-grad-black';
      const pieceFilter = t.pieceStyle === 'crystal'
        ? (isRed ? 'url(#crystal-glow-red)' : 'url(#crystal-glow)')
        : 'url(#piece-shadow)';

      // Landing bounce scale
      let scaleStr = '';
      if (anim && anim.progress > 0.8) {
        const bp = (anim.progress - 0.8) / 0.2;
        const s = 1 + 0.1 * Math.sin(bp * Math.PI);
        scaleStr = ` scale(${s})`;
      }

      return (
        <g key={pieceKey} transform={`translate(${cx}, ${cy})${scaleStr}`} style={{ cursor: 'pointer' }} filter={pieceFilter}>
          {/* 3D base — varies by style */}
          {t.pieceStyle === 'crystal' ? (
            /* Glass/Crystal: soft glow ring underneath */
            <circle cx={0} cy={2} r={PIECE_R + 2}
              fill={isRed ? 'rgba(255,100,100,0.1)' : 'rgba(100,150,255,0.1)'} />
          ) : t.pieceStyle === 'jade' ? (
            /* Stone/Jade: thicker base shadow for heavy stone feel */
            <ellipse cx={0} cy={4} rx={PIECE_R + 1} ry={PIECE_R * 0.8}
              fill="rgba(0,0,0,0.4)" />
          ) : (
            /* Classic wood: standard ellipse shadow */
            <ellipse cx={0} cy={3} rx={PIECE_R} ry={PIECE_R * 0.85}
              fill={t.pieceStroke} opacity={0.5} />
          )}

          {/* Main body with gradient */}
          <circle cx={0} cy={0} r={PIECE_R}
            fill={`url(#${gradId})`}
            stroke={t.pieceStroke}
            strokeWidth={t.pieceStyle === 'crystal' ? 0.8 : 1.5} />

          {/* Highlight overlay — skip for crystal to avoid washing out text */}
          {t.pieceStyle !== 'crystal' && (
            <circle cx={0} cy={0} r={PIECE_R} fill="url(#piece-highlight)" />
          )}

          {/* Jade refraction overlay */}
          {t.pieceStyle === 'jade' && isRed && (
            <circle cx={0} cy={0} r={PIECE_R} fill="url(#jade-refraction)" />
          )}

          {/* Crystal: clean inner ring, not frosted */}
          {t.pieceStyle === 'crystal' && (
            <circle cx={0} cy={0} r={PIECE_R - 2}
              fill="none"
              stroke={isRed ? 'rgba(255,160,160,0.35)' : 'rgba(160,190,255,0.35)'}
              strokeWidth={1.2} />
          )}

          {/* Rim / inner ring */}
          <circle cx={0} cy={-0.5} r={PIECE_R - 4} fill="none"
            stroke={isRed ? t.pieceTextRed : t.pieceTextBlack}
            strokeWidth={t.pieceStyle === 'crystal' ? 0.5 : 0.8}
            opacity={t.pieceStyle === 'crystal' ? 0.3 : 0.4} />

          {/* Character — 3D engraved text effect:
              1. Dark shadow text offset down-right (carved depth)
              2. Light highlight text offset up-left (light catching edge)
              3. Main text on top */}
          <text x={0.8} y={FONT_SIZE * 0.35 + 0.3} textAnchor="middle"
            fill="rgba(0,0,0,0.4)"
            fontSize={FONT_SIZE} fontFamily="KaiTi, STKaiti, SimSun, serif" fontWeight="bold"
            style={{ userSelect: 'none' }}>
            {label}
          </text>
          <text x={-0.4} y={FONT_SIZE * 0.35 - 1} textAnchor="middle"
            fill={t.pieceStyle === 'crystal' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)'}
            fontSize={FONT_SIZE} fontFamily="KaiTi, STKaiti, SimSun, serif" fontWeight="bold"
            style={{ userSelect: 'none' }}>
            {label}
          </text>
          <text x={0} y={FONT_SIZE * 0.35 - 0.5} textAnchor="middle"
            fill={isRed ? t.pieceTextRed : t.pieceTextBlack}
            fontSize={FONT_SIZE} fontFamily="KaiTi, STKaiti, SimSun, serif" fontWeight="bold"
            style={{ userSelect: 'none' }}>
            {label}
          </text>
        </g>
      );
    });
  };

  /* ══════════════════ Announcement overlay ════════════════════ */

  const renderAnnouncement = () => {
    if (!announcement) return null;

    const now = performance.now();
    const elapsed = now - announcement.startTime;
    const { duration, text, subText, color, glowColor } = announcement;

    // Phase calculation
    const fadeInEnd = ANIM_DURATION.announceFadeIn;
    const holdEnd = fadeInEnd + ANIM_DURATION.announceHold;
    const fadeOutEnd = duration;

    let opacity = 0;
    let scale = 0.3;

    if (elapsed < fadeInEnd) {
      // Fade in with scale up
      const p = elapsed / fadeInEnd;
      const ep = easeOutBack(p);
      opacity = p;
      scale = 0.3 + 0.7 * ep;
    } else if (elapsed < holdEnd) {
      // Hold
      opacity = 1;
      scale = 1;
    } else if (elapsed < fadeOutEnd) {
      // Fade out with scale up
      const p = (elapsed - holdEnd) / (fadeOutEnd - holdEnd);
      opacity = 1 - easeInOutQuad(p);
      scale = 1 + 0.15 * p;
    }

    if (opacity <= 0) return null;

    const cx = BOARD_W / 2;
    const cy = BOARD_H / 2;
    const isRed = glowColor.includes('F') || glowColor.includes('f');
    const filterId = isRed ? 'text-glow-red' : 'text-glow-blue';

    return (
      <g opacity={opacity}>
        {/* Semi-transparent backdrop */}
        <rect x={0} y={0} width={BOARD_W} height={BOARD_H} fill="black" opacity={0.3 * opacity} rx={6} />

        {/* Main text */}
        <g transform={`translate(${cx}, ${cy}) scale(${scale})`} filter={`url(#${filterId})`}>
          <text x={0} y={subText ? -10 : 8} textAnchor="middle"
            fill={color} fontSize={56} fontWeight="bold"
            fontFamily="KaiTi, STKaiti, FangSong, serif"
            letterSpacing={16}
            stroke={glowColor} strokeWidth={1} strokeOpacity={0.5}
            style={{ userSelect: 'none' }}>
            {text}
          </text>
          {subText && (
            <text x={0} y={36} textAnchor="middle"
              fill={color} fontSize={24} fontWeight="bold"
              fontFamily="KaiTi, STKaiti, serif"
              opacity={0.9}
              style={{ userSelect: 'none' }}>
              {subText}
            </text>
          )}
        </g>

        {/* Decorative lines flanking text */}
        <line x1={cx - 160 * scale} y1={cy - 40} x2={cx - 50 * scale} y2={cy - 40}
          stroke={color} strokeWidth={2} opacity={0.5 * opacity} />
        <line x1={cx + 50 * scale} y1={cy - 40} x2={cx + 160 * scale} y2={cy - 40}
          stroke={color} strokeWidth={2} opacity={0.5 * opacity} />
        <line x1={cx - 160 * scale} y1={cy + (subText ? 50 : 25)} x2={cx - 50 * scale} y2={cy + (subText ? 50 : 25)}
          stroke={color} strokeWidth={2} opacity={0.5 * opacity} />
        <line x1={cx + 50 * scale} y1={cy + (subText ? 50 : 25)} x2={cx + 160 * scale} y2={cy + (subText ? 50 : 25)}
          stroke={color} strokeWidth={2} opacity={0.5 * opacity} />
      </g>
    );
  };

  /* ── Click targets ── */
  const renderClickTargets = () => {
    const targets: React.ReactNode[] = [];
    for (let rank = 0; rank < RANKS; rank++) {
      for (let file = 0; file < FILES; file++) {
        const cx = toX(file), cy = toY(rank);
        targets.push(
          <circle key={`click-${file}-${rank}`} cx={cx} cy={cy} r={PIECE_R + 2}
            fill="transparent" style={{ cursor: 'pointer' }} role="button"
            aria-label={`Position ${file},${rank}`}
            onClick={(e) => { e.stopPropagation(); handleClick(file, rank); }} />
        );
      }
    }
    return targets;
  };

  /* ══════════════════ Main render ═════════════════════════════ */

  return (
    <div role="grid" aria-label="Chinese Chess Board" className={`relative w-full max-w-xl mx-auto ${className}`}>
      <svg ref={svgRef} viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className="w-full h-auto" style={{ display: 'block' }}>
        {renderDefs()}

        {/* Board background with 3D gradient */}
        <rect x={0} y={0} width={BOARD_W} height={BOARD_H} rx={6} ry={6} fill="url(#board-bg)" filter="url(#board-shadow)" />

        {/* Stone: clean specular highlight overlay (no feTurbulence noise) */}
        {t.boardTexture === 'stone' && (
          <rect x={0} y={0} width={BOARD_W} height={BOARD_H} rx={6} ry={6}
            fill="url(#stone-specular)" />
        )}

        {/* Glass: clean reflection line (no frosted blur) */}
        {t.boardTexture === 'glass' && (
          <>
            <rect x={0} y={0} width={BOARD_W} height={BOARD_H} rx={6} ry={6}
              fill="url(#glass-reflection)" />
            {/* Subtle ambient glow spots */}
            <circle cx={BOARD_W * 0.25} cy={BOARD_H * 0.3} r={100}
              fill="rgba(59,130,246,0.03)" />
            <circle cx={BOARD_W * 0.75} cy={BOARD_H * 0.7} r={80}
              fill="rgba(139,92,246,0.02)" />
          </>
        )}

        {/* Board border */}
        {t.boardTexture === 'glass' ? (
          /* Glass: single thin luminous border */
          <rect x={PAD - 4} y={PAD - 4}
            width={(FILES - 1) * CELL + 8} height={(RANKS - 1) * CELL + 8}
            fill="none" stroke={t.boardBorder} strokeWidth={1} rx={2} ry={2} />
        ) : (
          /* Classic / Stone: double line for 3D edge */
          <>
            <rect x={PAD - 6} y={PAD - 6} width={(FILES - 1) * CELL + 12} height={(RANKS - 1) * CELL + 12}
              fill="none" stroke={t.boardBorder} strokeWidth={4} rx={3} ry={3} />
            <rect x={PAD - 2} y={PAD - 2} width={(FILES - 1) * CELL + 4} height={(RANKS - 1) * CELL + 4}
              fill="none" stroke={t.boardBorder} strokeWidth={1} rx={1} ry={1} opacity={0.5} />
          </>
        )}

        {/* Grid lines — optionally with glow or engrave */}
        <g filter={t.boardTexture === 'glass' ? 'url(#grid-glow)' : t.gridShadow ? 'url(#engrave)' : undefined}>
          {renderGrid()}
          {renderPalaceDiagonals()}
        </g>

        {renderRiver()}
        {renderCrossMarks()}
        {renderLastMoveHighlight()}
        {renderSelectedHighlight()}
        {renderValidMoves()}
        {renderCheckIndicator()}
        {renderCaptureParticles()}
        {renderPieces()}
        {renderAnnouncement()}
        {renderClickTargets()}
      </svg>
    </div>
  );
};

export default BoardView;
