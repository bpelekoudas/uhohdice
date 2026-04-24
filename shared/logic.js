export class GameState {
  constructor(initialBankroll = 500) {
    let storedName = null;
    let storedBankroll = null;
    if (typeof localStorage !== 'undefined') {
      storedName = localStorage.getItem('playerName');
      storedBankroll = localStorage.getItem('currentBankroll');
    }

    this.playerName = storedName || null;
    this.bankroll = storedBankroll ? parseInt(storedBankroll, 10) : initialBankroll;

    this.point = null;
    this.history = [];
    this.lastResult = null;
  }

  setPlayerProfile(name, startingBankroll = 500) {
    this.playerName = name;
    this.bankroll = startingBankroll;
    this.persist();
  }

  resetProfile() {
    this.playerName = null;
    this.bankroll = 500;
    this.point = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('playerName');
      localStorage.removeItem('currentBankroll');
    }
  }

  persist() {
    if (typeof localStorage !== 'undefined') {
      if (this.playerName) {
        localStorage.setItem('playerName', this.playerName);
      }
      localStorage.setItem('currentBankroll', this.bankroll.toString());
    }
  }

  // Handle a valid roll (only called if dice hit the wall)
  // Returns an object detailing the result of the roll.
  handleRoll(dice1, dice2, betAmount = 10) {
    const total = dice1 + dice2;
    let status = 'CONTINUE'; // 'WIN', 'LOSS', 'POINT_SET', 'CONTINUE'
    let message = '';

    if (this.point === null) {
      // Come-Out Roll Phase
      if (total === 7 || total === 11) {
        status = 'WIN';
        message = `You rolled a ${total}! You win!`;
        this.bankroll += betAmount;
      } else if (total === 2 || total === 3 || total === 12) {
        status = 'LOSS';
        message = `Craps! You rolled a ${total}. You lose.`;
        this.bankroll -= betAmount;
      } else {
        status = 'POINT_SET';
        this.point = total;
        message = `Point is set to ${total}. Roll it again to win, but avoid 7!`;
      }
    } else {
      // Point Phase
      if (total === this.point) {
        status = 'WIN';
        message = `You rolled the point (${total})! You win!`;
        this.bankroll += betAmount;
        this.point = null; // reset for next come-out roll
      } else if (total === 7) {
        status = 'LOSS';
        message = `Seven-out! You rolled a 7. You lose.`;
        this.bankroll -= betAmount;
        this.point = null; // reset for next come-out roll
      } else {
        status = 'CONTINUE';
        message = `You rolled a ${total}. Roll the point (${this.point}) to win.`;
      }
    }

    this.lastResult = {
      dice1,
      dice2,
      total,
      status,
      message,
      bankroll: this.bankroll,
      point: this.point
    };

    this.history.push(this.lastResult);
    this.persist(); // save updated bankroll
    return this.lastResult;
  }

  resetGame() {
    this.point = null;
    this.lastResult = null;
  }
}
