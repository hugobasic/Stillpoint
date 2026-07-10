'use strict';

import { Settings } from './settings.js';
import { Cue } from './cue.js';

/* Breathing exercise — view + timed animation logic. */

export const template = `
  <section class="view" id="view-breathe" data-route="breathe">
    <header class="topbar">
      <a class="back" href="#home" aria-label="Back">‹</a>
      <h2>Breathing</h2>
    </header>

    <div class="breathe-setup" id="breathe-setup">
      <p class="breathe-lead">How long would you like to breathe?</p>
      <div class="time-display"><span id="minutes-val">3</span> min</div>
      <input type="range" id="minutes-range" min="1" max="5" step="1" value="3" />
      <div class="range-ticks"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span></div>
      <button class="primary" id="breathe-start">Start</button>
      <p class="breathe-note">Press and hold as you breathe in, release as you breathe out. The timer only counts while you breathe in.</p>
    </div>

    <div class="breathe-session hidden" id="breathe-session">
      <div class="remaining" id="breathe-remaining">03:00</div>
      <div class="breath-stage">
        <div class="breath-outer" id="breath-outer"></div>
        <div class="breath-circle" id="breath-circle"></div>
        <span class="breath-instruction" id="breath-instruction">Get ready</span>
      </div>
      <p class="hold-hint" id="hold-hint">Touch and hold to begin</p>
      <button class="ghost" id="breathe-stop">Stop</button>
    </div>

    <div class="breathe-done hidden" id="breathe-done">
      <div class="done-mark">✓</div>
      <p class="done-text">Well done. Take a moment.</p>
      <button class="primary" id="breathe-again">Again</button>
    </div>
  </section>
`;

export const Breathe = {
  CYCLE: 5000,          // 5s per phase
  MIN_SCALE: 0.42,
  MAX_SCALE: 1,
  totalMs: 180000,
  remainingMs: 180000,
  phase: 'idle',        // 'idle' | 'inhale' | 'exhale'
  phaseElapsed: 0,      // ms accrued in the current phase (only while advancing)
  holding: false,
  running: false,
  lastTick: 0,
  rafId: null,

  init() {
    this.range = document.getElementById('minutes-range');
    this.circle = document.getElementById('breath-circle');
    this.instruction = document.getElementById('breath-instruction');
    this.remainingEl = document.getElementById('breathe-remaining');
    this.holdHint = document.getElementById('hold-hint');

    this.range.addEventListener('input', () => {
      document.getElementById('minutes-val').textContent = this.range.value;
    });
    document.getElementById('breathe-start').addEventListener('click', () => this.start());
    document.getElementById('breathe-stop').addEventListener('click', () => this.stop());
    document.getElementById('breathe-again').addEventListener('click', () => this.reset());

    // Press-and-hold on the session area
    const stage = document.getElementById('breathe-session');
    const down = e => { e.preventDefault(); this.holding = true; if (Settings.values.strict) this.circle.classList.add('holding'); this.updateHint(); };
    const up = () => { this.holding = false; this.circle.classList.remove('holding'); this.updateHint(); };
    stage.addEventListener('pointerdown', down);
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', up);
    stage.addEventListener('pointerleave', up);
  },

  reset() {
    this.stopLoop();
    this.running = false;
    this.phase = 'idle';
    this.holding = false;
    this.phaseElapsed = 0;
    document.getElementById('breathe-setup').classList.remove('hidden');
    document.getElementById('breathe-session').classList.add('hidden');
    document.getElementById('breathe-done').classList.add('hidden');
    this.circle.classList.remove('holding');
    this.circle.style.transform = 'scale(' + this.MIN_SCALE + ')';
  },

  start() {
    this.totalMs = parseInt(this.range.value, 10) * 60000;
    this.remainingMs = this.totalMs;
    this.running = true;
    this.phaseElapsed = 0;
    Cue.ensure();
    document.getElementById('breathe-setup').classList.add('hidden');
    document.getElementById('breathe-done').classList.add('hidden');
    document.getElementById('breathe-session').classList.remove('hidden');
    this.renderRemaining();
    this.enterPhase('inhale');
    this.lastTick = performance.now();
    this.loop();
  },

  stop() { this.reset(); },

  enterPhase(phase) {
    this.phase = phase;
    this.phaseElapsed = 0;
    if (phase === 'inhale') {
      this.instruction.textContent = 'Breathe in';
      Cue.tone(432);
      Cue.vibrate(45);
    } else {
      this.instruction.textContent = 'Breathe out';
      Cue.tone(324);
      Cue.vibrate([25, 40, 25]);
    }
    this.renderCircle();
    this.updateHint();
  },

  // Whether the breath cycle should progress this frame.
  // Passive (non-strict): always flows. Strict: only while the user performs
  // the correct action — holding on the in-breath, releasing on the out-breath.
  isAdvancing() {
    if (!Settings.values.strict) return true;
    return this.phase === 'inhale' ? this.holding : !this.holding;
  },

  updateHint() {
    if (!this.running) return;
    if (!Settings.values.strict) { this.holdHint.textContent = ''; return; }
    if (this.phase === 'inhale') {
      this.holdHint.textContent = this.holding ? 'Hold as you fill your lungs…' : 'Touch and hold to breathe in';
    } else {
      this.holdHint.textContent = this.holding ? 'Release to breathe out' : 'Breathe out slowly…';
    }
  },

  renderCircle() {
    const p = Math.min(1, this.phaseElapsed / this.CYCLE);
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const span = this.MAX_SCALE - this.MIN_SCALE;
    const scale = this.phase === 'exhale'
      ? this.MAX_SCALE - span * eased
      : this.MIN_SCALE + span * eased;
    this.circle.style.transform = 'scale(' + scale.toFixed(4) + ')';
  },

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    const now = performance.now();
    const dt = now - this.lastTick;
    this.lastTick = now;

    // The breath cycle and the countdown advance together, only when allowed.
    // Passive mode flows continuously; strict mode pauses both the animation
    // and the timer whenever the user isn't holding/releasing correctly.
    if (this.isAdvancing()) {
      this.phaseElapsed += dt;
      this.remainingMs -= dt;
      if (this.remainingMs <= 0) {
        this.remainingMs = 0;
        this.renderRemaining();
        this.finish();
        return;
      }
      this.renderRemaining();

      if (this.phaseElapsed >= this.CYCLE) {
        const carry = this.phaseElapsed - this.CYCLE;
        this.enterPhase(this.phase === 'inhale' ? 'exhale' : 'inhale');
        this.phaseElapsed = carry;
      }
    }

    this.renderCircle();
  },

  renderRemaining() {
    const s = Math.max(0, Math.ceil(this.remainingMs / 1000));
    this.remainingEl.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  },

  finish() {
    this.stopLoop();
    this.running = false;
    this.phase = 'idle';
    document.getElementById('breathe-session').classList.add('hidden');
    document.getElementById('breathe-done').classList.remove('hidden');
  },

  stopLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
};
