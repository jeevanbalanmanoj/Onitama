import { shuffleAndDeal, type DealtCards } from './cards.js';

export interface Room {
  code: string;
  players: string[]; // socket IDs
  playerColors: Map<string, 'red' | 'blue'>; // socket ID -> color
  deal: DealtCards;
  createdAt: number;
  disconnectedPlayer: string | null;
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

export function createRoom(creatorSocketId: string, preferredColor: 'red' | 'blue' = 'red'): Room {
  const code = generateCode();
  const deal = shuffleAndDeal();
  const playerColors = new Map<string, 'red' | 'blue'>();
  playerColors.set(creatorSocketId, preferredColor);
  const room: Room = {
    code,
    players: [creatorSocketId],
    playerColors,
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

  // If room is "full" but has a disconnected player, evict the ghost
  if (room.players.length >= 2 && room.disconnectedPlayer) {
    removePlayer(room, room.disconnectedPlayer);
  }

  if (room.players.length >= 2) return null;
  room.players.push(joinerSocketId);
  // Assign joiner the opposite color of the existing player
  const existingColor = room.playerColors.get(room.players[0]) || 'red';
  room.playerColors.set(joinerSocketId, existingColor === 'red' ? 'blue' : 'red');
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
  return room.playerColors.get(socketId) ?? null;
}

export function rematchRoom(room: Room): void {
  room.deal = shuffleAndDeal();
  room.disconnectedPlayer = null;
}

export function removePlayer(room: Room, socketId: string): void {
  room.players = room.players.filter(id => id !== socketId);
  room.playerColors.delete(socketId);
  if (room.disconnectedPlayer === socketId) {
    room.disconnectedPlayer = null;
  }
}

export function isRoomEmpty(room: Room): boolean {
  return room.players.length === 0;
}

export function replacePlayer(room: Room, oldSocketId: string, newSocketId: string): void {
  const color = room.playerColors.get(oldSocketId);
  room.players = room.players.map(id => id === oldSocketId ? newSocketId : id);
  room.playerColors.delete(oldSocketId);
  if (color) {
    room.playerColors.set(newSocketId, color);
  }
  if (room.disconnectedPlayer === oldSocketId) {
    room.disconnectedPlayer = null;
  }
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
