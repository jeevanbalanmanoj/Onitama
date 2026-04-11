import type { Card, Player } from './cards.js';

// ---- Server → Client events ----

export interface GameStartPayload {
  roomCode: string;
  yourColor: Player;
  redCards: [Card, Card];
  blueCards: [Card, Card];
  neutralCard: Card;
  startingPlayer: Player;
}

export interface MovePayload {
  pieceIndex: number;
  cardName: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
}

export interface PassPayload {
  cardName: string;
}

export interface ServerToClientEvents {
  room_created: (data: { roomCode: string }) => void;
  waiting_for_opponent: () => void;
  game_start: (data: GameStartPayload) => void;
  opponent_move: (data: MovePayload) => void;
  opponent_pass: (data: PassPayload) => void;
  opponent_disconnected: () => void;
  opponent_reconnected: () => void;
  player_left: () => void;
  room_error: (data: { message: string }) => void;
}

// ---- Client → Server events ----

export interface ClientToServerEvents {
  create_room: (data?: { preferredColor?: Player }) => void;
  join_room: (data: { roomCode: string }) => void;
  rejoin_room: (data: { roomCode: string }) => void;
  move: (data: MovePayload) => void;
  pass: (data: PassPayload) => void;
  rematch: () => void;
}
