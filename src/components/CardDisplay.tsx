import type { Card, Player } from '../types';

interface CardDisplayProps {
  card: Card;
  isSelected: boolean;
  isPlayable: boolean;
  perspective: Player;
  onClick?: () => void;
  isNeutral?: boolean;
  flipped?: boolean;
}

export default function CardDisplay({
  card,
  isSelected,
  isPlayable,
  perspective,
  onClick,
  isNeutral = false,
  flipped = false,
}: CardDisplayProps) {
  // 5x5 mini-grid. Center is (2,2). Show card movement offsets.
  // If perspective is 'blue', mirror the offsets (negate dr and dc).
  // If flipped, the board is rotated 180° so we invert again.
  const perspectiveMirror = perspective === 'blue' ? -1 : 1;
  const flipMirror = flipped ? -1 : 1;
  const mirror = perspectiveMirror * flipMirror;

  const grid = Array.from({ length: 5 }, (_, r) =>
    Array.from({ length: 5 }, (_, c) => {
      const isCenter = r === 2 && c === 2;
      const isMove = card.moves.some(
        (m) => 2 + m.dr * mirror === r && 2 + m.dc * mirror === c
      );
      return { isCenter, isMove };
    })
  );

  return (
    <button
      onClick={onClick}
      disabled={!isPlayable}
      className={`
        flex flex-col items-center gap-0.5 px-2 py-1 w-full rounded-lg transition-all duration-200
        border-2
        ${isNeutral
          ? 'bg-amber-50/60 border-amber-400/40 opacity-70'
          : isSelected
            ? 'bg-amber-100 border-amber-500 shadow-lg shadow-amber-500/20 scale-105'
            : isPlayable
              ? 'bg-amber-50/80 border-amber-300/50 hover:border-amber-400 hover:shadow-md cursor-pointer'
              : 'bg-stone-100/50 border-stone-300/30 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <span
        className={`text-[10px] font-semibold tracking-wide uppercase ${
          isNeutral ? 'text-amber-700/60' : 'text-amber-900/80'
        }`}
      >
        {card.name}
      </span>
      <div className="grid grid-cols-5 gap-px">
        {grid.flat().map((cell, i) => (
          <div
            key={i}
            className={`
              w-3.5 h-3.5 rounded-sm
              ${cell.isCenter
                ? 'bg-amber-800/70'
                : cell.isMove
                  ? isNeutral
                    ? 'bg-amber-500/40'
                    : perspective === 'red'
                      ? 'bg-red-500/70'
                      : 'bg-blue-500/70'
                  : 'bg-stone-200/50'}
            `}
          />
        ))}
      </div>
    </button>
  );
}
