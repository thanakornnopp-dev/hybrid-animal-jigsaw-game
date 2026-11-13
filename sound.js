/**
 * Web Audio API Sound Engine for Peechy Game Show
 * 100% Client-side synthetic audio - zero external dependencies, zero latency!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.isBgmPlaying = false;
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.volume = 0.8;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Tile Flip / Reveal sound (Crisp satisfying pop with dynamic micro-tuning)
  playTileFlip(index = 0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 620 + ((index % 8) * 35);

    // Tone pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);

    // Tactile plastic/wood click transient
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(2400, t);
    clickOsc.frequency.exponentialRampToValueAtTime(800, t + 0.015);

    clickGain.gain.setValueAtTime(0.35, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

    clickOsc.connect(clickGain);
    clickGain.connect(this.sfxGain);

    clickOsc.start(t);
    clickOsc.stop(t + 0.02);
  }

  // 2. Whoosh (Opening all tiles or dramatic reveal)
  playWhoosh() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.35;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 3.5;
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + duration * 0.4);
    filter.frequency.exponentialRampToValueAtTime(160, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // 3. Round Solved / Correct Answer Fanfare (Triumphant brass/synth arpeggio)
  playRoundWin() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, time: 0.00, dur: 0.12 }, // C5
      { f: 659.25, time: 0.10, dur: 0.12 }, // E5
      { f: 783.99, time: 0.20, dur: 0.14 }, // G5
      { f: 1046.50, time: 0.32, dur: 0.45 } // C6 (long hold)
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.time);

      gain.gain.setValueAtTime(0.001, t + note.time);
      gain.gain.linearRampToValueAtTime(0.5, t + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + note.time);
      osc.stop(t + note.time + note.dur);

      // Harmony shimmer
      const harm = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      harm.type = 'sine';
      harm.frequency.setValueAtTime(note.f * 1.5, t + note.time);
      harmGain.gain.setValueAtTime(0.12, t + note.time);
      harmGain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);
      harm.connect(harmGain);
      harmGain.connect(this.sfxGain);
      harm.start(t + note.time);
      harm.stop(t + note.time + note.dur);
    });
  }

  // 4. Grand Finale Fanfare (ตอนจบเกมส์ 10 ข้อมีเสียงเฉลิมฉลองเต็มรูปแบบ!)
  playGameComplete() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Chord progression: C -> F -> G -> C high with brass vibrato
    const chords = [
      { freqs: [261.63, 329.63, 392.00, 523.25], start: 0.00, dur: 0.35 }, // C
      { freqs: [349.23, 440.00, 523.25, 698.46], start: 0.38, dur: 0.35 }, // F
      { freqs: [392.00, 493.88, 587.33, 783.99], start: 0.76, dur: 0.45 }, // G
      { freqs: [523.25, 659.25, 783.99, 1046.50], start: 1.25, dur: 1.60 } // High C Victory
    ];

    chords.forEach(chord => {
      chord.freqs.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 3 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t + chord.start);

        // Vibrato on final chord
        if (chord.start > 1.0) {
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.frequency.setValueAtTime(5.5, t + chord.start);
          lfoGain.gain.setValueAtTime(4.0, t + chord.start);
          lfo.connect(osc.frequency);
          lfo.start(t + chord.start);
          lfo.stop(t + chord.start + chord.dur);
        }

        gain.gain.setValueAtTime(0.001, t + chord.start);
        gain.gain.linearRampToValueAtTime(0.18, t + chord.start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + chord.start + chord.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + chord.start);
        osc.stop(t + chord.start + chord.dur);
      });
    });

    // Cascading victory chimes at t = 1.3
    const chimes = [1046.50, 1174.66, 1318.51, 1567.98, 2093.00, 2637.02];
    chimes.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + 1.4 + (idx * 0.09);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  // 5. Wrong Answer Buzzer
  playBuzzer() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0.0, 0.16].forEach(delay => {
      [125, 132].forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.2, t + delay);
        gain.gain.linearRampToValueAtTime(0.001, t + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + delay);
        osc.stop(t + delay + 0.13);
      });
    });
  }

  // 6. Hint Chime
  playHint() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [880, 1174.66]; // A5 -> D6
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + (i * 0.1);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  // 7. Timer Tick
  playTick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  // 8. General Button Click
  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.04);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.045);
  }

  // 9. Playful Game Show BGM Sequencer (Dynamic loop)
  toggleBgm() {
    this.ensureContext();
    if (this.isBgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }

  startBgm() {
    if (!this.ctx) this.init();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;

    const tempo = 115;
    const stepTime = (60 / tempo) / 4; // 16th notes

    // Bassline notes for a groovy game show vamp (C minor funk)
    const bassline = [
      130.81, 0, 130.81, 0, 155.56, 0, 174.61, 0,
      130.81, 0, 196.00, 0, 174.61, 155.56, 130.81, 0
    ];

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const step = this.bgmStep % 16;

      // Kick on 0, 8
      if (step === 0 || step === 8) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.frequency.setValueAtTime(120, t);
        kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.09);
        kickGain.gain.setValueAtTime(0.3, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.1);
      }

      // Snare / Rim on 4, 12
      if (step === 4 || step === 12) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, t);
        snareGain.gain.setValueAtTime(0.18, t);
        snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        snareOsc.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snareOsc.start(t);
        snareOsc.stop(t + 0.07);
      }

      // Bass note
      const bassFreq = bassline[step];
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, t);
        bassG.gain.setValueAtTime(0.12, t);
        bassG.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 1.5);
        bassOsc.connect(bassG);
        bassG.connect(this.bgmGain);
        bassOsc.start(t);
        bassOsc.stop(t + stepTime * 1.6);
      }

      this.bgmStep++;
    }, stepTime * 1000);
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }
}

window.soundEngine = new SoundEngine();
