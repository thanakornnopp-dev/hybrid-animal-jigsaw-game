/**
 * Peechy Hybrid Animal Jigsaw Game (Pure Tile Reveal)
 * Inspired by TikTok @peechy_game
 */

class PeechyGameEngine {
  constructor() {
    this.animals = HYBRID_ANIMALS;
    this.currentRound = 0;
    this.totalRounds = 10;
    this.gridDim = 4; // 4x4 = 16 tiles
    this.tilesState = [];
    this.isRevealed = false;

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
    this.dom.pictureContainer = document.getElementById('pictureContainer');
    this.dom.tilesGrid = document.getElementById('tilesGrid');
    this.dom.roundPill = document.getElementById('roundPill');
    this.dom.progressBar = document.getElementById('progressBar');
    this.dom.tilesRemainingCount = document.getElementById('tilesRemainingCount');
    this.dom.tilesTotalCount = document.getElementById('tilesTotalCount');
    
    // Action Buttons
    this.dom.btnRandomTile = document.getElementById('btnRandomTile');
    this.dom.btnRevealAnswer = document.getElementById('btnRevealAnswer');
    this.dom.btnNextQuestion = document.getElementById('btnNextQuestion');
    this.dom.btnResetTiles = document.getElementById('btnResetTiles');
    
    // Answer Card
    this.dom.answerCard = document.getElementById('answerCard');
    this.dom.answerName = document.getElementById('answerName');
    this.dom.answerFormula = document.getElementById('answerFormula');
    this.dom.answerDesc = document.getElementById('answerDesc');

    // Controls
    this.dom.btnSoundToggle = document.getElementById('btnSoundToggle');
    this.dom.btnBgmToggle = document.getElementById('btnBgmToggle');
    this.dom.gridDimensionSelect = document.getElementById('gridDimensionSelect');

    // Victory Modal
    this.dom.victoryModal = document.getElementById('victoryModal');
    this.dom.victoryGallery = document.getElementById('victoryGallery');
    this.dom.btnRestartGame = document.getElementById('btnRestartGame');
  }

  bindEvents() {
    // Audio toggles
    this.dom.btnSoundToggle?.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.dom.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
      this.dom.btnSoundToggle.classList.toggle('active', !isMuted);
    });

    this.dom.btnBgmToggle?.addEventListener('click', () => {
      const isPlaying = soundEngine.toggleBgm();
      this.dom.btnBgmToggle.classList.toggle('active', isPlaying);
    });

    // Grid dimension change (3x3, 4x4, 5x5)
    this.dom.gridDimensionSelect?.addEventListener('change', (e) => {
      this.gridDim = parseInt(e.target.value, 10);
      soundEngine.playClick();
      this.loadRound(this.currentRound);
    });

    // Action buttons
    this.dom.btnRandomTile?.addEventListener('click', () => this.revealRandomTile());
    this.dom.btnRevealAnswer?.addEventListener('click', () => this.revealAllAnswer());
    this.dom.btnResetTiles?.addEventListener('click', () => {
      soundEngine.playClick();
      this.loadRound(this.currentRound);
    });
    this.dom.btnNextQuestion?.addEventListener('click', () => this.nextRound());

    // Victory restart
    this.dom.btnRestartGame?.addEventListener('click', () => {
      soundEngine.playClick();
      this.dom.victoryModal.classList.remove('open');
      this.loadRound(0);
    });
  }

  loadRound(roundIdx) {
    if (roundIdx >= this.totalRounds) {
      this.showVictoryModal();
      return;
    }

    this.currentRound = roundIdx;
    this.isRevealed = false;
    const animal = this.animals[this.currentRound];

    // Update Round Pill & Progress
    if (this.dom.roundPill) {
      this.dom.roundPill.textContent = `ข้อที่ ${String(this.currentRound + 1).padStart(2, '0')} / ${this.totalRounds}`;
    }
    if (this.dom.progressBar) {
      this.dom.progressBar.style.width = `${((this.currentRound + 1) / this.totalRounds) * 100}%`;
    }

    // Set SVG Picture
    if (this.dom.pictureContainer) {
      this.dom.pictureContainer.innerHTML = animal.svg;
    }

    // Hide Answer Card
    if (this.dom.answerCard) {
      this.dom.answerCard.style.display = 'none';
    }

    // Build Tiles Grid
    this.buildTilesGrid();
  }

  buildTilesGrid() {
    if (!this.dom.tilesGrid) return;

    this.dom.tilesGrid.className = `tiles-grid grid-${this.gridDim}`;
    this.dom.tilesGrid.innerHTML = '';

    const total = this.gridDim * this.gridDim;
    this.tilesState = new Array(total).fill(false); // false = closed

    for (let i = 0; i < total; i++) {
      const tile = document.createElement('button');
      tile.className = 'jigsaw-tile';
      tile.type = 'button';
      tile.dataset.index = i;

      const num = document.createElement('span');
      num.className = 'tile-num';
      num.textContent = i + 1;
      tile.appendChild(num);

      tile.addEventListener('click', (e) => this.onTileClick(i, e));
      this.dom.tilesGrid.appendChild(tile);
    }

    this.updateTilesCounter();
  }

  onTileClick(index, event) {
    if (this.tilesState[index] || this.isRevealed) return;

    this.openTile(index);
    soundEngine.playTileFlip(index);

    if (event) {
      this.createSparkle(event.clientX, event.clientY);
    }
  }

  openTile(index) {
    if (this.tilesState[index]) return;
    this.tilesState[index] = true;

    const tiles = this.dom.tilesGrid.querySelectorAll('.jigsaw-tile');
    if (tiles[index]) {
      tiles[index].classList.add('opened');
    }

    this.updateTilesCounter();

    // If all tiles are open, automatically show answer details
    if (this.tilesState.every(Boolean) && !this.isRevealed) {
      this.revealAllAnswer(false);
    }
  }

  revealRandomTile() {
    if (this.isRevealed) return;

    const closed = [];
    this.tilesState.forEach((isOpened, idx) => {
      if (!isOpened) closed.push(idx);
    });

    if (closed.length === 0) return;

    const randIdx = closed[Math.floor(Math.random() * closed.length)];
    this.openTile(randIdx);
    soundEngine.playTileFlip(randIdx);
  }

  revealAllAnswer(playSound = true) {
    if (this.isRevealed) return;
    this.isRevealed = true;

    // Open any remaining tiles
    this.tilesState.forEach((_, idx) => this.openTile(idx));

    // Play Victory Fanfare sound ("เวลาเปิดจิ๊กซอมีเสียงด้วย แล้วก็ตอนจบมีเสียงด้วย")
    if (playSound) {
      soundEngine.playRoundWin();
      this.triggerConfetti(60);
    }

    // Populate and show Answer Card
    const animal = this.animals[this.currentRound];
    if (this.dom.answerCard) {
      this.dom.answerName.textContent = animal.name;
      this.dom.answerFormula.textContent = `${animal.animal1.emoji} ${animal.animal1.name} + ${animal.animal2.emoji} ${animal.animal2.name}`;
      this.dom.answerDesc.textContent = animal.lore;
      this.dom.answerCard.style.display = 'flex';
    }
  }

  nextRound() {
    soundEngine.playClick();
    if (this.currentRound + 1 < this.totalRounds) {
      this.loadRound(this.currentRound + 1);
    } else {
      this.showVictoryModal();
    }
  }

  updateTilesCounter() {
    const total = this.gridDim * this.gridDim;
    const opened = this.tilesState.filter(Boolean).length;
    const remaining = total - opened;

    if (this.dom.tilesRemainingCount) this.dom.tilesRemainingCount.textContent = remaining;
    if (this.dom.tilesTotalCount) this.dom.tilesTotalCount.textContent = total;
  }

  createSparkle(x, y) {
    const colors = ['#FF6B4A', '#FF8A65', '#F59E0B', '#0EA5E9', '#FFFFFF'];
    for (let i = 0; i < 7; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-particle';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const angle = (Math.PI * 2 * i) / 7;
      const dist = 25 + Math.random() * 20;
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  // Grand Finale Modal & Sound ("แล้วก็ตอนจบมีเสียงด้วย")
  showVictoryModal() {
    // Grand Finale Fanfare
    soundEngine.playGameComplete();

    // Trigger major confetti storm
    this.triggerConfetti(200);

    // Populate mini gallery of all 10 hybrid animals
    if (this.dom.victoryGallery) {
      this.dom.victoryGallery.innerHTML = '';
      this.animals.forEach(animal => {
        const thumb = document.createElement('div');
        thumb.className = 'gallery-thumb';
        thumb.title = `${animal.name} (${animal.animal1.emoji} + ${animal.animal2.emoji})`;
        thumb.innerHTML = animal.svg;
        this.dom.victoryGallery.appendChild(thumb);
      });
    }

    if (this.dom.victoryModal) {
      this.dom.victoryModal.classList.add('open');
    }
  }

  // 60 FPS Canvas Confetti
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
    const colors = ['#FF6B4A', '#FF8A65', '#F59E0B', '#0EA5E9', '#10B981', '#EC4899', '#8B5CF6'];

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

// Auto-run on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.peechyGame = new PeechyGameEngine();
  window.peechyGame.init();
});
