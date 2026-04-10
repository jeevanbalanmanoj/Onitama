import type { GameState, Position } from '../types';
import Square from './Square';

interface BoardProps {
  state: GameState;
  selectedPieceIndex: number | null;
  validTargets: Position[];
  onSquareClick: (row: number, col: number) => void;
}

export default function Board({ state, selectedPieceIndex, validTargets, onSquareClick }: BoardProps) {
  const isValidTarget = (row: number, col: number) =>
    validTargets.some((t) => t.row === row && t.col === col);

  const isSelected = (row: number, col: number) => {
    if (selectedPieceIndex === null) return false;
    const piece = state.pieces[selectedPieceIndex];
    return piece && piece.row === row && piece.col === col;
  };

  const colLabels = ['a', 'b', 'c', 'd', 'e'];
  const rowLabels = ['5', '4', '3', '2', '1']; // top row = 5, bottom = 1

  return (
    <div className="flex flex-col items-center w-full max-w-[400px]">
      {/* Column labels (top) */}
      <div className="grid grid-cols-5 w-full pl-6 pr-1 mb-0.5">
        {colLabels.map((l) => (
          <span key={l} className="text-center text-[10px] text-amber-800/25 select-none font-mono">{l}</span>
        ))}
      </div>

      <div className="flex w-full">
        {/* Row labels (left) */}
        <div className="flex flex-col justify-around pr-1 py-0">
          {rowLabels.map((l) => (
            <span key={l} className="text-[10px] text-amber-800/25 select-none font-mono leading-none w-5 text-right">{l}</span>
          ))}
        </div>

        {/* Board grid */}
        <div className="grid grid-cols-5 gap-0 flex-1 aspect-square border-2 border-amber-800/40 rounded-lg overflow-hidden shadow-xl bg-amber-900/5">
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => (
              <Square
                key={`${row}-${col}`}
                row={row}
                col={col}
                piece={state.board[row][col]}
                isSelected={isSelected(row, col)}
                isValidTarget={isValidTarget(row, col)}
                onClick={() => onSquareClick(row, col)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
