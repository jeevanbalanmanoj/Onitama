import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom,
  joinRoom,
  getRoomBySocket,
  getPlayerColor,
  removeRoom,
  rematchRoom,
  cleanupStaleRooms,
} from './rooms.js';
import type { ServerToClientEvents, ClientToServerEvents } from './protocol.js';

const app = express();
app.use(cors());

// Health check endpoint
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'onitama-server' });
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://jeevanbalanmanoj.github.io',
    ],
    methods: ['GET', 'POST'],
  },
});

// Cleanup stale rooms every 10 minutes
setInterval(cleanupStaleRooms, 10 * 60 * 1000);

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on('create_room', () => {
    // Leave any existing room first
    const existing = getRoomBySocket(socket.id);
    if (existing) {
      socket.leave(existing.code);
      removeRoom(existing.code);
    }

    const room = createRoom(socket.id);
    socket.join(room.code);
    socket.emit('room_created', { roomCode: room.code });
    socket.emit('waiting_for_opponent');
    console.log(`Room created: ${room.code} by ${socket.id}`);
  });

  socket.on('join_room', ({ roomCode }) => {
    if (!roomCode || typeof roomCode !== 'string') {
      socket.emit('room_error', { message: 'Invalid room code' });
      return;
    }

    const room = joinRoom(roomCode, socket.id);
    if (!room) {
      socket.emit('room_error', { message: 'Room not found or full' });
      return;
    }

    socket.join(room.code);
    console.log(`Player ${socket.id} joined room ${room.code}`);

    // Send game_start to both players
    const { deal } = room;
    for (const playerId of room.players) {
      const color = getPlayerColor(room, playerId);
      if (!color) continue;
      io.to(playerId).emit('game_start', {
        roomCode: room.code,
        yourColor: color,
        redCards: deal.redCards,
        blueCards: deal.blueCards,
        neutralCard: deal.neutralCard,
        startingPlayer: deal.startingPlayer,
      });
    }
  });

  socket.on('move', (data) => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;

    // Relay to the other player in the room
    socket.to(room.code).emit('opponent_move', data);
  });

  socket.on('pass', (data) => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;

    socket.to(room.code).emit('opponent_pass', data);
  });

  socket.on('rematch', () => {
    const room = getRoomBySocket(socket.id);
    if (!room) return;

    rematchRoom(room);

    // Send new game_start to both players
    const { deal } = room;
    for (const playerId of room.players) {
      const color = getPlayerColor(room, playerId);
      if (!color) continue;
      io.to(playerId).emit('game_start', {
        roomCode: room.code,
        yourColor: color,
        redCards: deal.redCards,
        blueCards: deal.blueCards,
        neutralCard: deal.neutralCard,
        startingPlayer: deal.startingPlayer,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    const room = getRoomBySocket(socket.id);
    if (!room) return;

    // Mark disconnected for potential reconnect
    room.disconnectedPlayer = socket.id;

    // Notify the other player
    socket.to(room.code).emit('opponent_disconnected');

    // Remove room after 60 seconds if not reconnected
    setTimeout(() => {
      if (room.disconnectedPlayer === socket.id) {
        removeRoom(room.code);
        console.log(`Room ${room.code} removed (disconnect timeout)`);
      }
    }, 60_000);
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`Onitama server listening on port ${PORT}`);
});
