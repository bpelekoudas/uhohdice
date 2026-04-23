import { GameState } from './shared/logic.js';

const game = new GameState();
console.log('Initial Bankroll:', game.bankroll);

// Test Come-Out win with $50 wager
let res = game.handleRoll(3, 4, 50); // 7
console.log('Roll 7, wager $50:', res.status, res.message, 'Bankroll:', game.bankroll);

// Test Come-Out loss with $100 wager
game.resetGame();
res = game.handleRoll(1, 1, 100); // 2
console.log('Roll 2, wager $100:', res.status, res.message, 'Bankroll:', game.bankroll);

// Test Set Point with $25 wager
game.resetGame();
res = game.handleRoll(3, 5, 25); // 8
console.log('Roll 8, wager $25:', res.status, res.message, 'Point:', game.point, 'Bankroll:', game.bankroll);

// Test Point Phase - Continue with same $25 wager
res = game.handleRoll(2, 3, 25); // 5
console.log('Roll 5:', res.status, res.message, 'Bankroll:', game.bankroll);

// Test Point Phase - Win
res = game.handleRoll(4, 4, 25); // 8
console.log('Roll 8 (Hit Point):', res.status, res.message, 'Point:', game.point, 'Bankroll:', game.bankroll);
