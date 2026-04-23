import { GameState } from './shared/logic.js';

const game = new GameState();
console.log('Initial Bankroll:', game.bankroll);

// Test Come-Out win
let res = game.handleRoll(3, 4); // 7
console.log('Roll 7:', res.status, res.message, 'Bankroll:', game.bankroll);

// Test Come-Out loss
game.resetGame();
res = game.handleRoll(1, 1); // 2
console.log('Roll 2:', res.status, res.message, 'Bankroll:', game.bankroll);

// Test Set Point
game.resetGame();
res = game.handleRoll(3, 5); // 8
console.log('Roll 8:', res.status, res.message, 'Point:', game.point);

// Test Point Phase - Continue
res = game.handleRoll(2, 3); // 5
console.log('Roll 5:', res.status, res.message);

// Test Point Phase - Win
res = game.handleRoll(4, 4); // 8
console.log('Roll 8 (Hit Point):', res.status, res.message, 'Point:', game.point, 'Bankroll:', game.bankroll);
