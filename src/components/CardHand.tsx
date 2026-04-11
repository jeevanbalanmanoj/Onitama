import type { Card, Player } from '../types';
import CardDisplay from './CardDisplay';

interface CardHandProps {
  cards: [Card, Card];
  player: Player;
  selectedCardName: string | null;
  isActive: boolean;
  onSelectCard: (card: Card) => void;
  flipped?: boolean;
}

export default function CardHand({ cards, player, selectedCardName, isActive, onSelectCard, flipped = false }: CardHandProps) {
  return (
    <div className="grid grid-cols-2 gap-1 md:gap-2 w-full pl-6">
      {cards.map((card) => (
        <CardDisplay
          key={card.name}
          card={card}
          isSelected={selectedCardName === card.name}
          isPlayable={isActive}
          perspective={player}
          onClick={() => isActive && onSelectCard(card)}
          flipped={flipped}
        />
      ))}
    </div>
  );
}
