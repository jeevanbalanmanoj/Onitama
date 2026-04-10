import type { Card, GameState, Move, Piece, Player, Position } from '../types';
import { shuffleAndDeal } from '../data/cards';

const BOARD_SIZE = 5;

// Red temple (where blue master starts) is row 0, col 2
// Blue temple (where red master starts) is row 4, col 2
export const RED_TEMPLE: Position = { row: 0, col: 2 };
export const BLUE_TEMPLE: Position = { row: 4, col: 2 };

function createBoard(pieces: Piece[]): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
  for (const p of pieces) {
    board[p.row][p.col] = p;
  }
  return board;
}

function createInitialPieces(): Piece[] {
  // Blue pieces on row 0 (top)
  // Red pieces on row 4 (bottom)
  return [
    // Blue students
    { player: 'blue', type: 'student', row: 0, col: 0 },
    { player: 'blue', type: 'student', row: 0, col: 1 },
    { player: 'blue', type: 'master', row: 0, col: 2 },
    { player: 'blue', type: 'student', row: 0, col: 3 },
    { player: 'blue', type: 'student', row: 0, col: 4 },
    // Red students
    { player: 'red', type: 'student', row: 4, col: 0 },
    { player: 'red', type: 'student', row: 4, col: 1 },
    { player: 'red', type: 'master', row: 4, col: 2 },
    { player: 'red', type: 'student', row: 4, col: 3 },
    { player: 'red', type: 'student', row: 4, col: 4 },
  ];
}

export function initGame(): GameState {
  const deal = shuffleAndDeal();
  const pieces = createInitialPieces();
  const board = createBoard(pieces);
  return {
    board,
    pieces,
    redCards: deal.redCards,
    blueCards: deal.blueCards,
    neutralCard: deal.neutralCard,
    currentPlayer: deal.startingPlayer,
    winner: null,
    winMethod: null,
    moveHistory: [],
  };
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Get all valid moves for a specific card for the current player.
 * Card offsets are defined from red's perspective; blue's offsets are mirrored.
 */
export function getValidMoves(state: GameState, card: Card): Move[] {
  const { currentPlayer, pieces, board } = state;
  const moves: Move[] = [];
  const mirror = currentPlayer === 'blue' ? -1 : 1;

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    if (piece.player !== currentPlayer) continue;

    for (const offset of card.moves) {
      const newRow = piece.row + offset.dr * mirror;
      const newCol = piece.col + offset.dc * mirror;

      if (!inBounds(newRow, newCol)) continue;

      const target = board[newRow][newCol];
      // Can't land on own piece
      if (target && target.player === currentPlayer) continue;

      moves.push({
        player: currentPlayer,
        pieceIndex: i,
        cardName: card.name,
        from: { row: piece.row, col: piece.col },
        to: { row: newRow, col: newCol },
      });
    }
  }

  return moves;
}

/** Get all valid moves for curr player using both their cards */
export function getAllValidMoves(state: GameState): Move[] {
  const cards = state.currentPlayer === 'red' ? state.redCards : state.blueCards;
  return [...getValidMoves(state, cards[0]), ...getValidMoves(state, cards[1])];
}

export function canPlayerMove(state: GameState): boolean {
  return getAllValidMoves(state).length > 0;
}

/**
 * Check win: Way of the Stone (opponent master captured) or
 * Way of the Stream (own master reached opponent's temple arch).
 * This is called AFTER applying a move, so we check the resulting state.
 */
function checkWinAfterMove(
  pieces: Piece[],
  lastMovePlayer: Player
): { winner: Player; method: 'stone' | 'stream' } | null {
  // Way of the Stone: check if opponent's master is captured (no longer in pieces)
  const opponent: Player = lastMovePlayer === 'red' ? 'blue' : 'red';
  const opponentMaster = pieces.find(
    (p) => p.player === opponent && p.type === 'master'
  );
  if (!opponentMaster) {
    return { winner: lastMovePlayer, method: 'stone' };
  }

  // Way of the Stream: check if the moving player's master is on opponent's temple
  const ownMaster = pieces.find(
    (p) => p.player === lastMovePlayer && p.type === 'master'
  );
  if (ownMaster) {
    const targetTemple = lastMovePlayer === 'red' ? RED_TEMPLE : BLUE_TEMPLE;
    if (ownMaster.row === targetTemple.row && ownMaster.col === targetTemple.col) {
      return { winner: lastMovePlayer, method: 'stream' };
    }
  }

  return null;
}

/**
 * Apply a move and return a new immutable state.
 * Handles: piece movement, capture, card swap, player toggle, win check.
 */
export function applyMove(state: GameState, move: Move): GameState {
  const { pieces, redCards, blueCards, neutralCard, currentPlayer, moveHistory } = state;

  // Deep clone pieces
  const newPieces = pieces.map((p) => ({ ...p }));

  // Move the piece
  const movingPiece = newPieces[move.pieceIndex];
  movingPiece.row = move.to.row;
  movingPiece.col = move.to.col;

  // Remove captured piece (if any)
  const capturedIdx = newPieces.findIndex(
    (p, idx) =>
      idx !== move.pieceIndex &&
      p.row === move.to.row &&
      p.col === move.to.col
  );
  if (capturedIdx !== -1) {
    newPieces.splice(capturedIdx, 1);
    // Adjust pieceIndex references if needed (indices shift after splice)
  }

  // Card swap: the used card goes to neutral, the old neutral goes to the player
  let newRedCards: [Card, Card] = [{ ...redCards[0] }, { ...redCards[1] }];
  let newBlueCards: [Card, Card] = [{ ...blueCards[0] }, { ...blueCards[1] }];
  let newNeutral = { ...neutralCard };

  if (currentPlayer === 'red') {
    const usedIdx = newRedCards.findIndex((c) => c.name === move.cardName);
    if (usedIdx !== -1) {
      const usedCard = newRedCards[usedIdx];
      newRedCards[usedIdx] = newNeutral;
      newNeutral = usedCard;
    }
  } else {
    const usedIdx = newBlueCards.findIndex((c) => c.name === move.cardName);
    if (usedIdx !== -1) {
      const usedCard = newBlueCards[usedIdx];
      newBlueCards[usedIdx] = newNeutral;
      newNeutral = usedCard;
    }
  }

  // Check for win
  const winResult = checkWinAfterMove(newPieces, currentPlayer);

  // Build new board
  const newBoard = createBoard(newPieces);

  const nextPlayer: Player = currentPlayer === 'red' ? 'blue' : 'red';

  return {
    board: newBoard,
    pieces: newPieces,
    redCards: newRedCards,
    blueCards: newBlueCards,
    neutralCard: newNeutral,
    currentPlayer: winResult ? currentPlayer : nextPlayer,
    winner: winResult?.winner ?? null,
    winMethod: winResult?.method ?? null,
    moveHistory: [...moveHistory, move],
  };
}

/**
 * Pass turn: player picks a card to swap with neutral, but moves no piece.
 * This happens when the player has no legal moves with either card.
 */
export function passWithCard(state: GameState, cardName: string): GameState {
  const { redCards, blueCards, neutralCard, currentPlayer, moveHistory } = state;

  let newRedCards: [Card, Card] = [{ ...redCards[0] }, { ...redCards[1] }];
  let newBlueCards: [Card, Card] = [{ ...blueCards[0] }, { ...blueCards[1] }];
  let newNeutral = { ...neutralCard };

  if (currentPlayer === 'red') {
    const usedIdx = newRedCards.findIndex((c) => c.name === cardName);
    if (usedIdx !== -1) {
      const usedCard = newRedCards[usedIdx];
      newRedCards[usedIdx] = newNeutral;
      newNeutral = usedCard;
    }
  } else {
    const usedIdx = newBlueCards.findIndex((c) => c.name === cardName);
    if (usedIdx !== -1) {
      const usedCard = newBlueCards[usedIdx];
      newBlueCards[usedIdx] = newNeutral;
      newNeutral = usedCard;
    }
  }

  const nextPlayer: Player = currentPlayer === 'red' ? 'blue' : 'red';

  return {
    ...state,
    redCards: newRedCards,
    blueCards: newBlueCards,
    neutralCard: newNeutral,
    currentPlayer: nextPlayer,
    moveHistory: [
      ...moveHistory,
      { player: currentPlayer, pieceIndex: -1, cardName, from: { row: -1, col: -1 }, to: { row: -1, col: -1 } },
    ],
  };
}

export function isGameOver(state: GameState): boolean {
  return state.winner !== null;
}

/** Get the valid target positions for a specific piece and card */
export function getValidTargets(state: GameState, card: Card, pieceIndex: number): Position[] {
  return getValidMoves(state, card)
    .filter((m) => m.pieceIndex === pieceIndex)
    .map((m) => m.to);
}
