import type { Card, Player } from '../types';
import CardDisplay from './CardDisplay';

interface CardHandProps {
  cards: [Card, Card];
  player: Player;
  selectedCardName: string | null;
  isActive: boolean;
  onSelectCard: (card: Card) => void;
}

export default function CardHand({ cards, player, selectedCardName, isActive, onSelectCard }: CardHandProps) {
  return (
    <div className="flex gap-2 items-center">
      {cards.map((card) => (
        <CardDisplay
          key={card.name}
          card={card}
          isSelected={selectedCardName === card.name}
          isPlayable={isActive}
          perspective={player}
          onClick={() => isActive && onSelectCard(card)}
        />
      ))}
    </div>
  );
}
