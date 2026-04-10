import type { Card, Player } from '../types';

// All movement offsets are from RED (bottom) player's perspective.
// Blue player's moves are mirrored (negate dr and dc) in the game engine.

const ALL_CARDS: Card[] = [
  {
    name: 'Tiger',
    moves: [
      { dr: -2, dc: 0 },
      { dr: 1, dc: 0 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Dragon',
    moves: [
      { dr: -1, dc: -2 },
      { dr: -1, dc: 2 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ],
    stamp: 'red',
  },
  {
    name: 'Frog',
    moves: [
      { dr: -1, dc: -1 },
      { dr: 0, dc: -2 },
      { dr: 1, dc: 1 },
    ],
    stamp: 'red',
  },
  {
    name: 'Rabbit',
    moves: [
      { dr: -1, dc: 1 },
      { dr: 0, dc: 2 },
      { dr: 1, dc: -1 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Crab',
    moves: [
      { dr: -1, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Elephant',
    moves: [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ],
    stamp: 'red',
  },
  {
    name: 'Goose',
    moves: [
      { dr: -1, dc: -1 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: 1 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Rooster',
    moves: [
      { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: -1 },
    ],
    stamp: 'red',
  },
  {
    name: 'Monkey',
    moves: [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Mantis',
    moves: [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: 0 },
    ],
    stamp: 'red',
  },
  {
    name: 'Horse',
    moves: [
      { dr: -1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 1, dc: 0 },
    ],
    stamp: 'red',
  },
  {
    name: 'Ox',
    moves: [
      { dr: -1, dc: 0 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Crane',
    moves: [
      { dr: -1, dc: 0 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Boar',
    moves: [
      { dr: -1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ],
    stamp: 'red',
  },
  {
    name: 'Eel',
    moves: [
      { dr: -1, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: -1 },
    ],
    stamp: 'blue',
  },
  {
    name: 'Cobra',
    moves: [
      { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },
      { dr: 1, dc: 1 },
    ],
    stamp: 'red',
  },
];

export function getAllCards(): Card[] {
  return ALL_CARDS.map((c) => ({ ...c, moves: c.moves.map((m) => ({ ...m })) }));
}

/** Fisher-Yates shuffle (does not mutate input) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface DealtCards {
  redCards: [Card, Card];
  blueCards: [Card, Card];
  neutralCard: Card;
  startingPlayer: Player;
}

export function shuffleAndDeal(): DealtCards {
  const picked = shuffle(getAllCards()).slice(0, 5);
  const redCards: [Card, Card] = [picked[0], picked[1]];
  const blueCards: [Card, Card] = [picked[2], picked[3]];
  const neutralCard = picked[4];
  const startingPlayer: Player = neutralCard.stamp;
  return { redCards, blueCards, neutralCard, startingPlayer };
}
