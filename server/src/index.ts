import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom,
  joinRoom,
  getRoomBySocket,
  getPlayerColor,
  getRoom,
  removeRoom,
  removePlayer,
  replacePlayer,
  isRoomEmpty,
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
  connectionStateRecovery: {
    // Allow recovery within 2 minutes of disconnect
    maxDisconnectionDuration: 2 * 60 * 1000,
    // Don't skip middlewares on recovery
    skipMiddlewares: false,
  },
});

// Cleanup stale rooms every 10 minutes
setInterval(cleanupStaleRooms, 10 * 60 * 1000);

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id} (recovered: ${socket.recovered})`);

  // If this is a recovered connection, the socket ID is the same and rooms are auto-rejoined.
  // Notify opponent that we're back.
  if (socket.recovered) {
    const room = getRoomBySocket(socket.id);
    if (room && room.disconnectedPlayer === socket.id) {
      room.disconnectedPlayer = null;
      socket.to(room.code).emit('opponent_reconnected');
      console.log(`Player ${socket.id} recovered in room ${room.code}`);
    }
  }

  socket.on('create_room', (data) => {
    // Leave any existing room first
    const existing = getRoomBySocket(socket.id);
    if (existing) {
      socket.leave(existing.code);
      removePlayer(existing, socket.id);
      if (isRoomEmpty(existing)) {
        removeRoom(existing.code);
      } else {
        io.to(existing.code).emit('player_left');
      }
    }

    const preferredColor = data?.preferredColor === 'blue' ? 'blue' : 'red';
    const room = createRoom(socket.id, preferredColor);
    socket.join(room.code);
    socket.emit('room_created', { roomCode: room.code });
    socket.emit('waiting_for_opponent');
    console.log(`Room created: ${room.code} by ${socket.id} (${preferredColor})`);
  });

  socket.on('join_room', ({ roomCode }) => {
    if (!roomCode || typeof roomCode !== 'string') {
      socket.emit('room_error', { message: 'Invalid room code' });
      return;
    }

    // Check if already in this room (e.g., duplicate join from reconnect)
    const existingRoom = getRoomBySocket(socket.id);
    if (existingRoom && existingRoom.code === roomCode.toUpperCase()) {
      // Already in the room, just re-emit game state if game is in progress
      if (existingRoom.players.length === 2) {
        const { deal } = existingRoom;
        const color = getPlayerColor(existingRoom, socket.id);
        if (color) {
          socket.emit('game_start', {
            roomCode: existingRoom.code,
            yourColor: color,
            redCards: deal.redCards,
            blueCards: deal.blueCards,
            neutralCard: deal.neutralCard,
            startingPlayer: deal.startingPlayer,
          });
        }
      }
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

  socket.on('rejoin_room', ({ roomCode }) => {
    if (!roomCode || typeof roomCode !== 'string') {
      socket.emit('room_error', { message: 'Invalid room code' });
      return;
    }

    const room = getRoom(roomCode);
    if (!room) {
      socket.emit('room_error', { message: 'Room no longer exists' });
      return;
    }

    // If already in this room (same socket ID), just confirm
    if (room.players.includes(socket.id)) {
      socket.join(room.code);
      if (room.disconnectedPlayer === socket.id) {
        room.disconnectedPlayer = null;
      }
      socket.to(room.code).emit('opponent_reconnected');
      console.log(`Player ${socket.id} re-confirmed in room ${room.code}`);
      return;
    }

    // If there's a disconnected player, replace them with this socket
    // (regardless of room.players.length — handles creator reconnecting
    // to their own 1-player room with a new socket ID)
    if (room.disconnectedPlayer) {
      const oldId = room.disconnectedPlayer;
      replacePlayer(room, oldId, socket.id);
      socket.join(room.code);
      // Only notify opponent if there IS another player
      if (room.players.length === 2) {
        socket.to(room.code).emit('opponent_reconnected');
      }
      console.log(`Player ${socket.id} replaced ${oldId} in room ${room.code}`);
      // If room still has only 1 player (creator reconnected), keep waiting
      if (room.players.length < 2) {
        socket.emit('waiting_for_opponent');
      }
      return;
    }

    // If room has space and no one is disconnected, treat as a normal join
    if (room.players.length < 2) {
      const joined = joinRoom(roomCode, socket.id);
      if (!joined) {
        socket.emit('room_error', { message: 'Could not rejoin room' });
        return;
      }
      socket.join(room.code);
      console.log(`Player ${socket.id} joined room ${room.code} via rejoin`);

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
      return;
    }

    socket.emit('room_error', { message: 'Room is full' });
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

    // After timeout: remove the player (not the entire room)
    setTimeout(() => {
      if (room.disconnectedPlayer === socket.id) {
        removePlayer(room, socket.id);

        if (isRoomEmpty(room)) {
          removeRoom(room.code);
          console.log(`Room ${room.code} removed (empty after disconnect timeout)`);
        } else {
          // Notify remaining player — room is now joinable again
          io.to(room.code).emit('player_left');
          console.log(`Player removed from room ${room.code}, waiting for new opponent`);
        }
      }
    }, 60_000);
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`Onitama server listening on port ${PORT}`);
});
