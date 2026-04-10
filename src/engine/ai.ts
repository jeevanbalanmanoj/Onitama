import type { AIDifficulty, GameState, Move, Player } from '../types';
import { getAllValidMoves, applyMove, passWithCard, canPlayerMove } from './game';

const INF = 100000;

/**
 * Evaluate the board state from a given player's perspective.
 * Higher score = better for that player.
 */
function evaluateState(state: GameState, forPlayer: Player): number {
  if (state.winner === forPlayer) return INF - 1;
  if (state.winner !== null) return -(INF - 1);

  let score = 0;

  // Material
  let ownStudents = 0;
  let oppStudents = 0;
  let ownMasterRow = -1;
  let ownMasterCol = -1;

  for (const p of state.pieces) {
    if (p.player === forPlayer) {
      if (p.type === 'student') {
        ownStudents++;
      } else {
        ownMasterRow = p.row;
        ownMasterCol = p.col;
      }
    } else {
      if (p.type === 'student') {
        oppStudents++;
      }
    }
  }

  score += (ownStudents - oppStudents) * 200;

  // Temple proximity for Way of the Stream
  if (ownMasterRow >= 0) {
    // Red's target temple is (0,2), blue's is (4,2)
    const targetRow = forPlayer === 'red' ? 0 : 4;
    const targetCol = 2;
    const dist = Math.abs(ownMasterRow - targetRow) + Math.abs(ownMasterCol - targetCol);
    score += (8 - dist) * 15; // Max dist on 5x5 is 8
  }

  // Mobility (only compute if it's this player's turn to avoid deep recursion)
  if (state.currentPlayer === forPlayer) {
    const moves = getAllValidMoves(state);
    score += moves.length * 5;
  }

  // Center control bonus
  for (const p of state.pieces) {
    if (p.player === forPlayer) {
      const centerDist = Math.abs(p.row - 2) + Math.abs(p.col - 2);
      score += (4 - centerDist) * 3;
    } else {
      const centerDist = Math.abs(p.row - 2) + Math.abs(p.col - 2);
      score -= (4 - centerDist) * 2;
    }
  }

  return score;
}

interface MinimaxResult {
  score: number;
  move: Move | null;
  passCard: string | null;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: Player,
  noiseAmount: number
): MinimaxResult {
  // Terminal conditions
  if (state.winner !== null || depth === 0) {
    const noise = noiseAmount > 0 ? (Math.random() * 2 - 1) * noiseAmount : 0;
    return {
      score: evaluateState(state, maximizingPlayer) + noise,
      move: null,
      passCard: null,
    };
  }

  const isMaximizing = state.currentPlayer === maximizingPlayer;
  const moves = getAllValidMoves(state);

  // If no moves, must pass a card
  if (moves.length === 0) {
    const cards =
      state.currentPlayer === 'red' ? state.redCards : state.blueCards;
    // Pick the card that results in the best position after passing
    let bestResult: MinimaxResult = {
      score: isMaximizing ? -INF : INF,
      move: null,
      passCard: cards[0].name,
    };

    for (const card of cards) {
      const newState = passWithCard(state, card.name);
      const result = minimax(newState, depth - 1, alpha, beta, maximizingPlayer, noiseAmount);

      if (isMaximizing) {
        if (result.score > bestResult.score) {
          bestResult = { score: result.score, move: null, passCard: card.name };
        }
        alpha = Math.max(alpha, result.score);
      } else {
        if (result.score < bestResult.score) {
          bestResult = { score: result.score, move: null, passCard: card.name };
        }
        beta = Math.min(beta, result.score);
      }

      if (beta <= alpha) break;
    }
    return bestResult;
  }

  // Sort moves for better pruning: captures first, then moves toward center
  const sortedMoves = [...moves].sort((a, b) => {
    const aCap = state.board[a.to.row][a.to.col] !== null ? 1 : 0;
    const bCap = state.board[b.to.row][b.to.col] !== null ? 1 : 0;
    return bCap - aCap;
  });

  let bestResult: MinimaxResult = {
    score: isMaximizing ? -INF : INF,
    move: sortedMoves[0],
    passCard: null,
  };

  for (const move of sortedMoves) {
    const newState = applyMove(state, move);
    const result = minimax(newState, depth - 1, alpha, beta, maximizingPlayer, noiseAmount);

    if (isMaximizing) {
      if (result.score > bestResult.score) {
        bestResult = { score: result.score, move, passCard: null };
      }
      alpha = Math.max(alpha, result.score);
    } else {
      if (result.score < bestResult.score) {
        bestResult = { score: result.score, move, passCard: null };
      }
      beta = Math.min(beta, result.score);
    }

    if (beta <= alpha) break;
  }

  return bestResult;
}

const DEPTH_MAP: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 3,
  hard: 5,
};

const NOISE_MAP: Record<AIDifficulty, number> = {
  easy: 50,
  medium: 0,
  hard: 0,
};

export interface AIResult {
  move: Move | null;
  passCard: string | null;
}

export function getAIMove(state: GameState, difficulty: AIDifficulty): AIResult {
  const depth = DEPTH_MAP[difficulty];
  const noise = NOISE_MAP[difficulty];
  const aiPlayer = state.currentPlayer;

  // Quick check: if there are moves, try to find winning move first
  if (canPlayerMove(state)) {
    const moves = getAllValidMoves(state);
    for (const move of moves) {
      const newState = applyMove(state, move);
      if (newState.winner === aiPlayer) {
        return { move, passCard: null };
      }
    }
  }

  const result = minimax(state, depth, -INF, INF, aiPlayer, noise);
  return { move: result.move, passCard: result.passCard };
}
