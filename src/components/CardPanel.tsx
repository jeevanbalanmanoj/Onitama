import type { Card, GameState, Player } from '../types';
import CardHand from './CardHand';
import CardDisplay from './CardDisplay';

interface CardPanelProps {
  state: GameState;
  selectedCardName: string | null;
  currentPlayer: Player;
  isPlayerTurn: (player: Player) => boolean;
  onSelectCard: (card: Card) => void;
}

export default function CardPanel({
  state,
  selectedCardName,
  currentPlayer,
  isPlayerTurn,
  onSelectCard,
}: CardPanelProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Blue's cards (top) */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-blue-700/70 uppercase tracking-wider">
          Blue {currentPlayer === 'blue' ? '• Turn' : ''}
        </span>
        <CardHand
          cards={state.blueCards}
          player="blue"
          selectedCardName={currentPlayer === 'blue' ? selectedCardName : null}
          isActive={isPlayerTurn('blue')}
          onSelectCard={onSelectCard}
        />
      </div>

      {/* Neutral card */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-amber-700/50 uppercase tracking-wider">
          Next
        </span>
        <CardDisplay
          card={state.neutralCard}
          isSelected={false}
          isPlayable={false}
          perspective={currentPlayer}
          isNeutral
        />
      </div>

      {/* Red's cards (bottom) */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-red-700/70 uppercase tracking-wider">
          Red {currentPlayer === 'red' ? '• Turn' : ''}
        </span>
        <CardHand
          cards={state.redCards}
          player="red"
          selectedCardName={currentPlayer === 'red' ? selectedCardName : null}
          isActive={isPlayerTurn('red')}
          onSelectCard={onSelectCard}
        />
      </div>
    </div>
  );
}
