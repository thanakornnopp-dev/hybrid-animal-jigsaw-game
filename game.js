/**
 * Hybrid Animal Jigsaw Guessing Game Engine
 * Inspired by TikTok @peechy_game "เปิดป้ายทายภาพ"
 */

class JigsawGame {
  constructor() {
    this.animals = HYBRID_ANIMALS;
    this.currentRound = 0;
    this.totalRounds = 10;
    this.gridDimension = 4; // 4x4 = 16 tiles by default
    this.tilesState = [];
    this.score = 0;
    this.roundBaseScore = 1000;
    this.gameMode = 'host'; // 'host' or 'quiz'
    this.isRoundSolved = false;
    this.isGameOver = false;

    // Timer
    this.timerSeconds = 30;
    this.timerRemaining = 30;
    this.timerInterval = null;
    this.isTimerEnabled = false;

    // Confetti
    this.confettiCanvas = null;
    this.confettiCtx = null;
    this.confettiParticles = [];
    this.confettiAnimationId = null;

    // DOM Elements
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.initConfetti();
    this.loadRound(0);
  }

  cacheDom() {
    this.dom.viewport = document.getElementById('pictureViewport');
    this.dom.jigsawGrid = document.getElementById('jigsawGrid');
    this.dom.roundBadge = document.getElementById('roundBadge');
    this.dom.scoreBadge = document.getElementById('scoreBadge');
    this.dom.tilesRemainingBadge = document.getElementById('tilesRemainingBadge');
    this.dom.hintsContainer = document.getElementById('hintsContainer');
    this.dom.roundResultCard = document.getElementById('roundResultCard');
    this.dom.choicesGrid = document.getElementById('choicesGrid');
    this.dom.guessInput = document.getElementById('guessInput');
    this.dom.btnSubmitGuess = document.getElementById('btnSubmitGuess');
    
    this.dom.timerContainer = document.getElementById('timerContainer');
    this.dom.timerPill = document.getElementById('timerPill');
    this.dom.timerBarFill = document.getElementById('timerBarFill');

    // Action buttons
    this.dom.btnRandomTile = document.getElementById('btnRandomTile');
    this.dom.btnUnlockHint1 = document.getElementById('btnUnlockHint1');
    this.dom.btnUnlockHint2 = document.getElementById('btnUnlockHint2');
    this.dom.btnRevealAll = document.getElementById('btnRevealAll');
    this.dom.btnResetRound = document.getElementById('btnResetRound');
    this.dom.btnNextRound = document.getElementById('btnNextRound');

    // Controls
    this.dom.btnSound = document.getElementById('btnSound');
    this.dom.btnBgm = document.getElementById('btnBgm');
    this.dom.btnTikTokMode = document.getElementById('btnTikTokMode');
    this.dom.gridSizeSelect = document.getElementById('gridSizeSelect');
    this.dom.modeTabs = document.querySelectorAll('.mode-tab');
    this.dom.appContainer = document.getElementById('appContainer');

    // Modal
    this.dom.victoryModal = document.getElementById('victoryModal');
    this.dom.victoryScore = document.getElementById('victoryScore');
    this.dom.victoryRank = document.getElementById('victoryRank');
    this.dom.victoryAccuracy = document.getElementById('victoryAccuracy');
    this.dom.victoryTilesOpened = document.getElementById('victoryTilesOpened');
    this.dom.victoryGallery = document.getElementById('victoryGallery');
    this.dom.btnRestartGame = document.getElementById('btnRestartGame');
    this.dom.btnShareScore = document.getElementById('btnShareScore');
  }

  bindEvents() {
    // Sound & BGM
    this.dom.btnSound?.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.dom.btnSound.textContent = isMuted ? '🔇' : '🔊';
      this.dom.btnSound.classList.toggle('active', !isMuted);
    });

    this.dom.btnBgm?.addEventListener('click', () => {
      const isPlaying = soundEngine.toggleBgm();
      this.dom.btnBgm.classList.toggle('active', isPlaying);
    });

    // TikTok 9:16 layout toggle
    this.dom.btnTikTokMode?.addEventListener('click', () => {
      const isTikTok = this.dom.appContainer.classList.toggle('tiktok-mode');
      this.dom.btnTikTokMode.classList.toggle('active', isTikTok);
      soundEngine.playClick();
    });

    // Grid size change
    this.dom.gridSizeSelect?.addEventListener('change', (e) => {
      this.gridDimension = parseInt(e.target.value, 10);
      soundEngine.playClick();
      this.loadRound(this.currentRound);
    });

    // Mode tabs (Host vs Solo Quiz)
    this.dom.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.dom.modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.gameMode = tab.dataset.mode;
        soundEngine.playClick();
        this.updateModeVisibility();
      });
    });

    // In-game action buttons
    this.dom.btnRandomTile?.addEventListener('click', () => this.revealRandomTile());
    this.dom.btnUnlockHint1?.addEventListener('click', () => this.unlockHint(0));
    this.dom.btnUnlockHint2?.addEventListener('click', () => this.unlockHint(1));
    this.dom.btnRevealAll?.addEventListener('click', () => this.revealAllTiles(true));
    this.dom.btnResetRound?.addEventListener('click', () => {
      soundEngine.playClick();
      this.loadRound(this.currentRound);
    });
    this.dom.btnNextRound?.addEventListener('click', () => this.nextRound());

    // Guess submission
    this.dom.btnSubmitGuess?.addEventListener('click', () => this.checkTextGuess());
    this.dom.guessInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.checkTextGuess();
    });

    // Victory modal
    this.dom.btnRestartGame?.addEventListener('click', () => this.restartGame());
    this.dom.btnShareScore?.addEventListener('click', () => this.shareScore());
  }

  updateModeVisibility() {
    const hostControls = document.getElementById('hostControls');
    const quizControls = document.getElementById('quizControls');
    if (this.gameMode === 'host') {
      if (hostControls) hostControls.style.display = 'flex';
      if (quizControls) quizControls.style.display = 'none';
      this.stopTimer();
      if (this.dom.timerContainer) this.dom.timerContainer.style.display = 'none';
    } else {
      if (hostControls) hostControls.style.display = 'none';
      if (quizControls) quizControls.style.display = 'block';
      if (this.dom.timerContainer) this.dom.timerContainer.style.display = 'flex';
      this.startTimer();
    }
  }

  loadRound(roundIndex) {
    if (roundIndex >= this.totalRounds) {
      this.finishGame();
      return;
    }

    this.currentRound = roundIndex;
    this.isRoundSolved = false;
    const animal = this.animals[this.currentRound];

    // Update Round Badge
    if (this.dom.roundBadge) {
      this.dom.roundBadge.textContent = `ข้อที่ ${this.currentRound + 1} / ${this.totalRounds}`;
    }

    // Set SVG Picture
    if (this.dom.viewport) {
      this.dom.viewport.innerHTML = animal.svg;
    }

    // Build Jigsaw Grid
    this.buildGrid();

    // Reset Hints
    this.renderHints(animal);

    // Render Quiz Choices
    this.renderChoices(animal);

    // Hide result card
    if (this.dom.roundResultCard) {
      this.dom.roundResultCard.style.display = 'none';
    }

    // Reset Input
    if (this.dom.guessInput) {
      this.dom.guessInput.value = '';
      this.dom.guessInput.disabled = false;
    }

    // Update mode layout
    this.updateModeVisibility();

    // Update Scores & UI
    this.updateStats();
  }

  buildGrid() {
    if (!this.dom.jigsawGrid) return;

    this.dom.jigsawGrid.className = `jigsaw-grid grid-${this.gridDimension}x${this.gridDimension}`;
    this.dom.jigsawGrid.innerHTML = '';

    const totalTiles = this.gridDimension * this.gridDimension;
    this.tilesState = new Array(totalTiles).fill(false); // false = unrevealed

    for (let i = 0; i < totalTiles; i++) {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile';
      tile.dataset.index = i;

      const num = document.createElement('span');
      num.className = 'tile-number';
      num.textContent = i + 1;
      tile.appendChild(num);

      tile.addEventListener('click', (e) => this.onTileClick(i, e));
      this.dom.jigsawGrid.appendChild(tile);
    }

    this.updateRemainingTilesBadge();
  }

  onTileClick(index, event) {
    if (this.tilesState[index] || this.isRoundSolved) return;

    this.revealTile(index);
    soundEngine.playTileFlip(index);

    if (event) {
      this.createTileBurst(event.clientX, event.clientY);
    }
  }

  revealTile(index) {
    if (this.tilesState[index]) return;
    this.tilesState[index] = true;

    const tiles = this.dom.jigsawGrid.querySelectorAll('.puzzle-tile');
    if (tiles[index]) {
      tiles[index].classList.add('revealed');
    }

    this.updateRemainingTilesBadge();

    // Check if all tiles revealed
    if (this.tilesState.every(Boolean) && !this.isRoundSolved) {
      this.solveRound(false); // Solved by uncovering everything
    }
  }

  revealRandomTile() {
    if (this.isRoundSolved) return;

    const unrevealedIndices = [];
    this.tilesState.forEach((isRevealed, idx) => {
      if (!isRevealed) unrevealedIndices.push(idx);
    });

    if (unrevealedIndices.length === 0) return;

    const randomIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    this.revealTile(randomIdx);
    soundEngine.playTileFlip(randomIdx);
  }

  revealAllTiles(isHostAction = false) {
    const unrevealed = this.tilesState.some(state => !state);
    if (!unrevealed && this.isRoundSolved) return;

    soundEngine.playWhoosh();
    this.tilesState.forEach((_, idx) => this.revealTile(idx));

    if (isHostAction) {
      this.solveRound(true);
    }
  }

  createTileBurst(x, y) {
    const colors = ['#F59E0B', '#38BDF8', '#EC4899', '#10B981', '#FFFFFF'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'tile-burst';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const angle = (Math.PI * 2 * i) / 8;
      const dist = 30 + Math.random() * 25;
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  renderHints(animal) {
    if (!this.dom.hintsContainer) return;
    this.dom.hintsContainer.innerHTML = '';

    animal.hints.forEach((hintText, idx) => {
      const hintBadge = document.createElement('div');
      hintBadge.className = `hint-badge ${idx === 0 ? 'unlocked' : ''}`;
      hintBadge.id = `hintBadge${idx}`;
      hintBadge.innerHTML = `<span>💡 <b>คำใบ้ที่ ${idx + 1}:</b> ${idx === 0 ? hintText : '🔒 กดปุ่มเพื่อเปิดคำใบ้'}</span>`;
      this.dom.hintsContainer.appendChild(hintBadge);
    });
  }

  unlockHint(hintIdx) {
    if (this.isRoundSolved) return;
    const animal = this.animals[this.currentRound];
    const hintElement = document.getElementById(`hintBadge${hintIdx + 1}`);

    if (hintElement && !hintElement.classList.contains('unlocked')) {
      hintElement.classList.add('unlocked');
      hintElement.innerHTML = `<span>💡 <b>คำใบ้ที่ ${hintIdx + 2}:</b> ${animal.hints[hintIdx + 1]}</span>`;
      soundEngine.playHint();
    }
  }

  renderChoices(animal) {
    if (!this.dom.choicesGrid) return;
    this.dom.choicesGrid.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    animal.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<span class="choice-key">${letters[idx]}</span> <span>${optText}</span>`;
      btn.addEventListener('click', () => this.handleChoiceClick(idx, btn));
      this.dom.choicesGrid.appendChild(btn);
    });
  }

  handleChoiceClick(choiceIdx, btnElement) {
    if (this.isRoundSolved) return;
    const animal = this.animals[this.currentRound];

    if (choiceIdx === animal.answerIndex) {
      btnElement.classList.add('correct');
      this.solveRound(true);
    } else {
      btnElement.classList.add('wrong');
      soundEngine.playBuzzer();
      setTimeout(() => btnElement.classList.remove('wrong'), 600);
    }
  }

  checkTextGuess() {
    if (this.isRoundSolved || !this.dom.guessInput) return;
    const guess = this.dom.guessInput.value.trim().toLowerCase();
    if (!guess) return;

    const animal = this.animals[this.currentRound];
    const isMatched = animal.acceptedKeywords.some(keyword => 
      guess.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(guess)
    );

    if (isMatched) {
      this.solveRound(true);
    } else {
      soundEngine.playBuzzer();
      this.dom.guessInput.classList.add('wrong-shake');
      setTimeout(() => this.dom.guessInput.classList.remove('wrong-shake'), 400);
    }
  }

  solveRound(isSuccess = true) {
    if (this.isRoundSolved) return;
    this.isRoundSolved = true;
    this.stopTimer();

    // Reveal remaining tiles with whoosh
    this.tilesState.forEach((_, idx) => this.revealTile(idx));

    // Sounds ("เวลาเปิดจิ๊กซอมีเสียงด้วย แล้วก็ตอนจบมีเสียงด้วย")
    if (isSuccess) {
      soundEngine.playRoundWin();
      this.triggerConfetti(60);
    } else {
      soundEngine.playWhoosh();
    }

    // Calculate Round Score
    const unrevealedAtStart = this.tilesState.filter(s => !s).length;
    const earnedRoundScore = Math.max(300, 1000 - (this.tilesState.filter(Boolean).length * 40));
    this.score += earnedRoundScore;
    this.updateStats();

    // Show Result Card
    this.displayResultCard();
  }

  displayResultCard() {
    if (!this.dom.roundResultCard) return;
    const animal = this.animals[this.currentRound];

    this.dom.roundResultCard.style.display = 'flex';
    this.dom.roundResultCard.innerHTML = `
      <div class="result-title">
        <span>🎉 เฉลย: ${animal.name}</span>
      </div>
      <div class="result-parents">
        <span>🧬 สัตว์ต้นกำเนิด:</span>
        <b>${animal.animal1.emoji} ${animal.animal1.name}</b>
        <span>+</span>
        <b>${animal.animal2.emoji} ${animal.animal2.name}</b>
      </div>
      <div class="result-lore">${animal.lore}</div>
      <button class="btn btn-primary btn-full" id="btnNextRoundFromCard">
        <span>${this.currentRound + 1 < this.totalRounds ? '➡️ ไปยังข้อถัดไป' : '🏆 ดูสรุปคะแนนสุดท้าย'}</span>
      </button>
    `;

    document.getElementById('btnNextRoundFromCard')?.addEventListener('click', () => {
      this.nextRound();
    });
  }

  nextRound() {
    soundEngine.playClick();
    if (this.currentRound + 1 < this.totalRounds) {
      this.loadRound(this.currentRound + 1);
    } else {
      this.finishGame();
    }
  }

  updateRemainingTilesBadge() {
    if (!this.dom.tilesRemainingBadge) return;
    const total = this.gridDimension * this.gridDimension;
    const opened = this.tilesState.filter(Boolean).length;
    const remaining = total - opened;
    this.dom.tilesRemainingBadge.textContent = `แผ่นป้ายเหลือ: ${remaining} / ${total}`;
  }

  updateStats() {
    if (this.dom.scoreBadge) {
      this.dom.scoreBadge.textContent = this.score.toLocaleString();
    }
  }

  // Timer logic
  startTimer() {
    this.stopTimer();
    this.timerRemaining = this.timerSeconds;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timerRemaining--;
      this.updateTimerDisplay();

      if (this.timerRemaining <= 5 && this.timerRemaining > 0) {
        soundEngine.playTick();
      }

      if (this.timerRemaining <= 0) {
        this.stopTimer();
        soundEngine.playBuzzer();
        this.solveRound(false); // Time out
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    if (!this.dom.timerPill || !this.dom.timerBarFill) return;
    this.dom.timerPill.textContent = `⏱️ ${this.timerRemaining}s`;

    const pct = (this.timerRemaining / this.timerSeconds) * 100;
    this.dom.timerBarFill.style.width = `${pct}%`;

    const isUrgent = this.timerRemaining <= 5;
    this.dom.timerPill.classList.toggle('urgent', isUrgent);
    this.dom.timerBarFill.classList.toggle('urgent', isUrgent);
  }

  // Finale & Game Complete Screen ("ตอนจบมีเสียงด้วย")
  finishGame() {
    this.isGameOver = true;
    this.stopTimer();

    // Play Grand Finale Fanfare!
    soundEngine.playGameComplete();

    // Trigger major confetti storm
    this.triggerConfetti(200);

    // Populate Victory Modal
    if (this.dom.victoryModal) {
      this.dom.victoryScore.textContent = this.score.toLocaleString();

      // Determine Detective Rank
      let rank = '🏆 ปรมาจารย์พันธุศาสตร์แฟนตาซีระดับ SSS';
      if (this.score < 5000) rank = '🥉 ผู้กล้าท้าทายสัตว์พิศวง';
      else if (this.score < 7500) rank = '🥈 นักสืบสัตว์ผสมดาวรุ่ง';
      else if (this.score < 9000) rank = '🥇 ยอดนักสืบสัตว์ผสมระดับตำนาน';
      this.dom.victoryRank.textContent = rank;

      // Populate Mini Gallery
      if (this.dom.victoryGallery) {
        this.dom.victoryGallery.innerHTML = '';
        this.animals.forEach(a => {
          const item = document.createElement('div');
          item.className = 'gallery-mini-item';
          item.title = `${a.name} (${a.animal1.emoji}+${a.animal2.emoji})`;
          item.innerHTML = a.svg;
          this.dom.victoryGallery.appendChild(item);
        });
      }

      this.dom.victoryModal.classList.add('open');
    }
  }

  restartGame() {
    soundEngine.playClick();
    this.score = 0;
    this.isGameOver = false;
    if (this.dom.victoryModal) {
      this.dom.victoryModal.classList.remove('open');
    }
    this.loadRound(0);
  }

  shareScore() {
    const text = `🎉 ฉันเล่นเกมเปิดป้ายทายสัตว์ผสม (Peechy Game Style) ได้ ${this.score.toLocaleString()} คะแนน! 🦁🦅 ระดับ: ${this.dom.victoryRank.textContent}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('📋 คัดลอกคะแนนเรียบร้อยแล้ว นำไปโพสต์แชร์ได้เลย!');
      });
    } else {
      alert(text);
    }
  }

  // Built-in Confetti Particle Engine
  initConfetti() {
    this.confettiCanvas = document.getElementById('confettiCanvas');
    if (!this.confettiCanvas) return;
    this.confettiCtx = this.confettiCanvas.getContext('2d');

    const resize = () => {
      this.confettiCanvas.width = window.innerWidth;
      this.confettiCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  triggerConfetti(count = 100) {
    if (!this.confettiCtx) return;
    const colors = ['#F59E0B', '#38BDF8', '#EC4899', '#10B981', '#F43F5E', '#A855F7', '#FDE047'];

    for (let i = 0; i < count; i++) {
      this.confettiParticles.push({
        x: Math.random() * this.confettiCanvas.width,
        y: -10 - Math.random() * 50,
        w: 8 + Math.random() * 8,
        h: 12 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: 3 + Math.random() * 6,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.2,
        opacity: 1
      });
    }

    if (!this.confettiAnimationId) {
      this.animateConfetti();
    }
  }

  animateConfetti() {
    if (!this.confettiCtx) return;
    this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

    for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
      const p = this.confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.vAngle;

      if (p.y > this.confettiCanvas.height - 20) {
        p.opacity -= 0.03;
      }

      if (p.opacity <= 0) {
        this.confettiParticles.splice(i, 1);
        continue;
      }

      this.confettiCtx.save();
      this.confettiCtx.translate(p.x, p.y);
      this.confettiCtx.rotate(p.angle);
      this.confettiCtx.fillStyle = p.color;
      this.confettiCtx.globalAlpha = p.opacity;
      this.confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      this.confettiCtx.restore();
    }

    if (this.confettiParticles.length > 0) {
      this.confettiAnimationId = requestAnimationFrame(() => this.animateConfetti());
    } else {
      this.confettiAnimationId = null;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.jigsawGame = new JigsawGame();
  window.jigsawGame.init();
});
