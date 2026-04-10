import { useEffect, useRef } from 'react';
import type { Move, GameState } from '../types';

interface MoveLogProps {
  moveHistory: Move[];
  pieces: GameState['pieces'];
}

function posToStr(row: number, col: number): string {
  if (row < 0) return '—';
  const colLetter = String.fromCharCode(97 + col); // a-e
  const rowNum = 5 - row; // 1-5, bottom to top
  return `${colLetter}${rowNum}`;
}

export default function MoveLog({ moveHistory }: MoveLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  if (moveHistory.length === 0) {
    return (
      <div className="text-sm text-amber-800/40 italic text-center py-4">
        No moves yet
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-1 overflow-y-auto pr-1 text-sm scrollbar-thin"
    >
      {moveHistory.map((move, i) => {
        const player = move.player === 'red' ? 'Red' : 'Blue';
        const playerColor = move.player === 'red' ? 'text-red-700' : 'text-blue-700';
        const isPass = move.pieceIndex === -1;

        return (
          <div key={i} className="flex gap-1 items-baseline leading-tight">
            <span className="text-amber-800/40 text-xs w-5 text-right shrink-0">
              {i + 1}.
            </span>
            <span className={`font-medium ${playerColor}`}>{player}</span>
            <span className="text-amber-800/60">
              {isPass
                ? `passed (${move.cardName})`
                : `${move.cardName}: ${posToStr(move.from.row, move.from.col)} → ${posToStr(move.to.row, move.to.col)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
