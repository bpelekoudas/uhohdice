export class GameState {
  constructor() {
    let storedPlayers = null;
    let storedShooterIdx = null;
    if (typeof localStorage !== 'undefined') {
      const sp = localStorage.getItem('players');
      if (sp) {
        try { storedPlayers = JSON.parse(sp); } catch (e) {}
      }
      storedShooterIdx = localStorage.getItem('shooterIndex');
    }

    if (storedPlayers && storedPlayers.length > 0) {
      this.players = storedPlayers;
      this.shooterIndex = storedShooterIdx !== null ? parseInt(storedShooterIdx, 10) : 0;
    } else {
      this.players = [];
      this.shooterIndex = 0;
    }

    this.point = null;
    this.centerBet = 0;
    this.fades = {}; // { playerIndex: amount }

    this.history = [];
    this.lastResult = null;
  }

  addPlayer(name, bankroll = 500) {
    this.players.push({ name, bankroll });
    this.persist();
  }

  resetProfile() {
    this.players = [];
    this.shooterIndex = 0;
    this.point = null;
    this.centerBet = 0;
    this.fades = {};
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('players');
      localStorage.removeItem('shooterIndex');
    }
  }

  persist() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('players', JSON.stringify(this.players));
      localStorage.setItem('shooterIndex', this.shooterIndex.toString());
    }
  }

  getShooter() {
    if (this.players.length === 0) return null;
    return this.players[this.shooterIndex];
  }

  setCenterBet(amount) {
    const shooter = this.getShooter();
    if (!shooter) return;
    this.centerBet = Math.min(amount, shooter.bankroll);
    this.fades = {};
  }

  addFade(playerIndex, amount) {
    if (playerIndex === this.shooterIndex) return;

    const player = this.players[playerIndex];
    if (!player) return;

    // Calculate total faded so far
    let totalFaded = this.getTotalFaded();

    // We can't fade more than the center bet
    let maxCanFade = this.centerBet - totalFaded;
    if (maxCanFade <= 0) return;

    const currentFade = this.fades[playerIndex] || 0;
    let actualFade = Math.min(amount, player.bankroll - currentFade, maxCanFade);

    if (!this.fades[playerIndex]) {
      this.fades[playerIndex] = 0;
    }
    this.fades[playerIndex] += actualFade;
  }

  getTotalFaded() {
    return Object.values(this.fades).reduce((sum, val) => sum + val, 0);
  }

  resolveBets(shooterWon) {
    const shooter = this.getShooter();
    if (!shooter) return;

    const totalFaded = this.getTotalFaded();
    // Auto-reduce center bet to matched fade
    const actualCenterBet = Math.min(this.centerBet, totalFaded);

    if (shooterWon) {
      // Shooter wins the pot (their own bet is returned, plus the faders' amounts)
      // Since we haven't deducted from bankrolls yet, we just ADD the faded amount
      shooter.bankroll += actualCenterBet;

      // Deduct from faders
      for (const [idxStr, amount] of Object.entries(this.fades)) {
        const pIdx = parseInt(idxStr, 10);
        this.players[pIdx].bankroll -= amount;
      }
    } else {
      // Shooter loses the pot to the faders
      shooter.bankroll -= actualCenterBet;

      for (const [idxStr, amount] of Object.entries(this.fades)) {
        const pIdx = parseInt(idxStr, 10);
        this.players[pIdx].bankroll += amount;
      }
    }

    this.persist();
  }

  passDice() {
    this.shooterIndex = (this.shooterIndex + 1) % this.players.length;
    this.centerBet = 0;
    this.fades = {};
    this.point = null;
    this.persist();
  }

  // Handle a valid roll (only called if dice hit the wall)
  handleRoll(dice1, dice2) {
    const total = dice1 + dice2;
    let status = 'CONTINUE'; // 'WIN', 'LOSS', 'POINT_SET', 'CONTINUE'
    let message = '';

    // Enforce bet reduction before processing roll
    const actualBet = Math.min(this.centerBet, this.getTotalFaded());

    if (this.point === null) {
      // Come-Out Roll Phase
      if (total === 7 || total === 11) {
        status = 'WIN';
        message = `Rolled a ${total}! Shooter wins the pot!`;
        this.resolveBets(true);
      } else if (total === 2 || total === 3 || total === 12) {
        status = 'LOSS';
        message = `Craps! Rolled a ${total}. Shooter loses!`;
        this.resolveBets(false);
        this.passDice();
      } else {
        status = 'POINT_SET';
        this.point = total;
        message = `Point is set to ${total}. Shooter must roll it again to win.`;
      }
    } else {
      // Point Phase
      if (total === this.point) {
        status = 'WIN';
        message = `Shooter rolled the point (${total}) and wins!`;
        this.resolveBets(true);
        this.point = null; // reset for next come-out roll
      } else if (total === 7) {
        status = 'LOSS';
        message = `Seven-out! Shooter rolled a 7 and loses!`;
        this.resolveBets(false);
        this.passDice();
      } else {
        status = 'CONTINUE';
        message = `Rolled a ${total}. Shooter needs a ${this.point} to win.`;
      }
    }

    this.lastResult = {
      dice1,
      dice2,
      total,
      status,
      message,
      point: this.point,
      actualBet
    };

    this.history.push(this.lastResult);
    return this.lastResult;
  }

  clearBet() {
      this.centerBet = 0;
      this.fades = {};
  }

  letItRide() {
      const shooter = this.getShooter();
      if(shooter) {
          this.centerBet = Math.min(shooter.bankroll, (this.lastResult ? this.lastResult.actualBet * 2 : shooter.bankroll)); // Or another logic for "pot" ride
          this.fades = {};
      }
  }

  resetGame() {
    this.point = null;
    this.lastResult = null;
    this.centerBet = 0;
    this.fades = {};
  }
}
