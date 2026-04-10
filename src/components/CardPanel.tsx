import type { Card, GameState, Player } from '../types';
import CardHand from './CardHand';
import CardDisplay from './CardDisplay';

interface CardPanelProps {
  state: GameState;
  selectedCardName: string | null;
  currentPlayer: Player;
  isPlayerTurn: (player: Player) => boolean;
  onSelectCard: (card: Card) => void;
  flipped?: boolean;
}

export default function CardPanel({
  state,
  selectedCardName,
  currentPlayer,
  isPlayerTurn,
  onSelectCard,
  flipped = false,
}: CardPanelProps) {
  const topPlayer: Player = flipped ? 'red' : 'blue';
  const bottomPlayer: Player = flipped ? 'blue' : 'red';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top player's cards */}
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xs font-medium uppercase tracking-wider ${topPlayer === 'blue' ? 'text-blue-700/70' : 'text-red-700/70'}`}>
          {topPlayer === 'blue' ? 'Blue' : 'Red'} {currentPlayer === topPlayer ? '• Turn' : ''}
        </span>
        <CardHand
          cards={topPlayer === 'blue' ? state.blueCards : state.redCards}
          player={topPlayer}
          selectedCardName={currentPlayer === topPlayer ? selectedCardName : null}
          isActive={isPlayerTurn(topPlayer)}
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

      {/* Bottom player's cards */}
      <div className="flex flex-col items-center gap-1">
        <span className={`text-xs font-medium uppercase tracking-wider ${bottomPlayer === 'red' ? 'text-red-700/70' : 'text-blue-700/70'}`}>
          {bottomPlayer === 'blue' ? 'Blue' : 'Red'} {currentPlayer === bottomPlayer ? '• Turn' : ''}
        </span>
        <CardHand
          cards={bottomPlayer === 'red' ? state.redCards : state.blueCards}
          player={bottomPlayer}
          selectedCardName={currentPlayer === bottomPlayer ? selectedCardName : null}
          isActive={isPlayerTurn(bottomPlayer)}
          onSelectCard={onSelectCard}
        />
      </div>
    </div>
  );
}
