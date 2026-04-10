import { AnimatePresence, motion } from 'motion/react';
import type { Piece, Player } from '../types';
import { RED_TEMPLE, BLUE_TEMPLE } from '../engine/game';

interface SquareProps {
  row: number;
  col: number;
  piece: Piece | null;
  isSelected: boolean;
  isValidTarget: boolean;
  onClick: () => void;
}

function isTemple(row: number, col: number): Player | null {
  if (row === RED_TEMPLE.row && col === RED_TEMPLE.col) return 'red';
  if (row === BLUE_TEMPLE.row && col === BLUE_TEMPLE.col) return 'blue';
  return null;
}

/**
 * Torii gate SVG for temple/shrine squares — matches the actual Onitama board.
 */
function ToriiGate({ player }: { player: Player }) {
  const color = player === 'red' ? '#991b1b' : '#1e3a8a';
  const light = player === 'red' ? '#dc2626' : '#3b82f6';
  return (
    <svg viewBox="0 0 60 60" className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
      {/* Top beam (kasagi) — curved */}
      <path d="M8,14 Q30,8 52,14 L50,18 Q30,12 10,18 Z" fill={color} />
      {/* Second beam (nuki) */}
      <rect x="12" y="21" width="36" height="3" rx="1" fill={color} />
      {/* Left pillar */}
      <rect x="14" y="18" width="4" height="38" fill={light} />
      <rect x="14" y="18" width="1.5" height="38" fill={color} opacity="0.3" />
      {/* Right pillar */}
      <rect x="42" y="18" width="4" height="38" fill={light} />
      <rect x="42" y="18" width="1.5" height="38" fill={color} opacity="0.3" />
      {/* Pillar bases */}
      <rect x="11" y="54" width="10" height="3" rx="1" fill={color} />
      <rect x="39" y="54" width="10" height="3" rx="1" fill={color} />
    </svg>
  );
}

/**
 * Chess-style pieces: Master = King, Student = Pawn.
 */
function PieceSVG({ piece, isSelected }: { piece: Piece; isSelected: boolean }) {
  const isRed = piece.player === 'red';
  const fill = isRed ? '#dc2626' : '#2563eb';
  const dark = isRed ? '#7f1d1d' : '#1e3a8a';
  const mid = isRed ? '#ef4444' : '#3b82f6';
  const highlight = isRed ? '#fca5a5' : '#93c5fd';
  const isMaster = piece.type === 'master';

  if (isMaster) {
    // King piece — larger, with prominent cross and staff
    return (
      <svg
        viewBox="0 0 58 60"
        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 select-none ${
          isSelected ? 'scale-110 drop-shadow-xl' : 'drop-shadow-lg'
        }`}
      >
        {/* Staff (behind body) */}
        <line x1="46" y1="6" x2="46" y2="58" stroke={dark} strokeWidth="2.2" strokeLinecap="round" />
        {/* Staff orb */}
        <circle cx="46" cy="6" r="3.5" fill={mid} stroke={dark} strokeWidth="0.6" />
        <circle cx="45" cy="5" r="1.2" fill={highlight} opacity="0.3" />
        {/* Staff cross-guard */}
        <rect x="43" y="11" width="6" height="2" rx="1" fill={dark} />

        {/* Base */}
        <ellipse cx="22" cy="56" rx="19" ry="4" fill={dark} />
        <ellipse cx="22" cy="55" rx="19" ry="4" fill={fill} />
        <ellipse cx="19" cy="54.5" rx="8" ry="2" fill={highlight} opacity="0.2" />

        {/* Pedestal */}
        <path d="M7,52 L11,40 L33,40 L37,52 Z" fill={fill} stroke={dark} strokeWidth="0.6" />
        <path d="M7,52 L11,40 L22,40 L18,52 Z" fill={highlight} opacity="0.12" />

        {/* Body column */}
        <rect x="13" y="24" width="18" height="16" rx="3" fill={fill} stroke={dark} strokeWidth="0.6" />
        <rect x="13" y="24" width="8" height="16" rx="2" fill={highlight} opacity="0.1" />

        {/* Collar / neck ring */}
        <ellipse cx="22" cy="24" rx="10" ry="2.5" fill={dark} opacity="0.3" />
        <ellipse cx="22" cy="23.5" rx="10" ry="2.5" fill={mid} />

        {/* Head */}
        <circle cx="22" cy="16" r="8" fill={fill} stroke={dark} strokeWidth="0.6" />
        <circle cx="20" cy="14.5" r="3.5" fill={highlight} opacity="0.15" />

        {/* Large cross on top */}
        <rect x="20" y="2" width="4" height="12" rx="1.2" fill={mid} stroke={dark} strokeWidth="0.5" />
        <rect x="15.5" y="5" width="13" height="4" rx="1.2" fill={mid} stroke={dark} strokeWidth="0.5" />
      </svg>
    );
  }

  // Pawn piece
  return (
    <svg
      viewBox="0 0 36 44"
      className={`w-7 h-9 sm:w-9 sm:h-11 md:w-10 md:h-12 select-none ${
        isSelected ? 'scale-110 drop-shadow-xl' : 'drop-shadow-md'
      }`}
    >
      {/* Base */}
      <ellipse cx="18" cy="41" rx="15" ry="3.5" fill={dark} />
      <ellipse cx="18" cy="40" rx="15" ry="3.5" fill={fill} />
      <ellipse cx="16" cy="39.5" rx="6" ry="1.8" fill={highlight} opacity="0.2" />

      {/* Pedestal */}
      <path d="M6,38 L10,30 L26,30 L30,38 Z" fill={fill} stroke={dark} strokeWidth="0.5" />
      <path d="M6,38 L10,30 L18,30 L14,38 Z" fill={highlight} opacity="0.1" />

      {/* Neck / stem */}
      <rect x="14" y="18" width="8" height="12" rx="2" fill={fill} stroke={dark} strokeWidth="0.5" />
      <rect x="14" y="18" width="4" height="12" rx="1.5" fill={highlight} opacity="0.1" />

      {/* Head */}
      <circle cx="18" cy="13" r="7" fill={fill} stroke={dark} strokeWidth="0.5" />
      <circle cx="16" cy="11.5" r="3" fill={highlight} opacity="0.15" />
    </svg>
  );
}

export default function Square({ row, col, piece, isSelected, isValidTarget, onClick }: SquareProps) {
  const temple = isTemple(row, col);

  const bgClass = isSelected
    ? 'bg-amber-300/60'
    : isValidTarget
      ? piece
        ? 'bg-rose-300/50'    // capture target
        : 'bg-emerald-300/40' // empty valid target
      : temple === 'red'
        ? 'bg-red-900/10'
        : temple === 'blue'
          ? 'bg-blue-900/10'
          : (row + col) % 2 === 0
            ? 'bg-amber-100/40'
            : 'bg-amber-50/40';

  return (
    <button
      className={`
        relative w-full aspect-square flex items-center justify-center
        border border-amber-800/20 transition-colors duration-150
        ${bgClass}
        ${isValidTarget ? 'cursor-pointer hover:brightness-110' : piece ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={onClick}
    >
      {/* Temple / Shrine — torii gate */}
      {temple && (
        <ToriiGate player={temple} />
      )}

      {/* Valid target indicator */}
      {isValidTarget && !piece && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-emerald-600/50" />
        </div>
      )}

      {/* Piece */}
      <AnimatePresence mode="popLayout">
        {piece && (
          <motion.div
            key={`${piece.player}-${piece.type}-${piece.row}-${piece.col}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="z-10 flex items-center justify-center"
          >
            <PieceSVG piece={piece} isSelected={isSelected} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
