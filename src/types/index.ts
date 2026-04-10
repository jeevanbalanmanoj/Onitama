export type Player = 'red' | 'blue';
export type PieceType = 'master' | 'student';

export interface Position {
  row: number;
  col: number;
}

export interface MoveOffset {
  dr: number;
  dc: number;
}

export interface Card {
  name: string;
  moves: MoveOffset[];
  stamp: Player;
}

export interface Piece {
  player: Player;
  type: PieceType;
  row: number;
  col: number;
}

export interface Move {
  player: Player;
  pieceIndex: number;
  cardName: string;
  from: Position;
  to: Position;
}

export interface GameState {
  board: (Piece | null)[][];
  pieces: Piece[];
  redCards: [Card, Card];
  blueCards: [Card, Card];
  neutralCard: Card;
  currentPlayer: Player;
  winner: Player | null;
  winMethod: 'stone' | 'stream' | null;
  moveHistory: Move[];
}

export type GameMode = 'local' | 'ai' | 'online';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
