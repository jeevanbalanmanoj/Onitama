import { shuffleAndDeal, type DealtCards } from './cards.js';

export interface Room {
  code: string;
  players: string[]; // socket IDs, index 0 = red (creator), index 1 = blue (joiner)
  deal: DealtCards;
  createdAt: number;
  disconnectedPlayer: string | null; // socket ID of disconnected player (for reconnect)
}

const rooms = new Map<string, Room>();

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)

function generateCode(): string {
  let code: string;
  do {
    code = '';
    for (let i = 0; i < 4; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  } while (rooms.has(code));
  return code;
}

export function createRoom(creatorSocketId: string): Room {
  const code = generateCode();
  const deal = shuffleAndDeal();
  const room: Room = {
    code,
    players: [creatorSocketId],
    deal,
    createdAt: Date.now(),
    disconnectedPlayer: null,
  };
  rooms.set(code, room);
  return room;
}

export function joinRoom(code: string, joinerSocketId: string): Room | null {
  const room = rooms.get(code.toUpperCase());
  if (!room) return null;
  if (room.players.length >= 2) return null;
  room.players.push(joinerSocketId);
  return room;
}

export function getRoom(code: string): Room | null {
  return rooms.get(code.toUpperCase()) ?? null;
}

export function getRoomBySocket(socketId: string): Room | null {
  for (const room of rooms.values()) {
    if (room.players.includes(socketId)) return room;
  }
  return null;
}

export function removeRoom(code: string): void {
  rooms.delete(code.toUpperCase());
}

export function getPlayerColor(room: Room, socketId: string): 'red' | 'blue' | null {
  if (room.players[0] === socketId) return 'red';
  if (room.players[1] === socketId) return 'blue';
  return null;
}

export function rematchRoom(room: Room): void {
  room.deal = shuffleAndDeal();
  room.disconnectedPlayer = null;
}

// Clean up stale rooms older than 1 hour
export function cleanupStaleRooms(): void {
  const oneHour = 60 * 60 * 1000;
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > oneHour) {
      rooms.delete(code);
    }
  }
}
