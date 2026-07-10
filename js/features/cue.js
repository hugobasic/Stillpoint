'use strict';

import { Settings } from './settings.js';

/* Shared sound + haptic cues used by the breathing exercise and settings. */
export const Cue = {
  ctx: null,

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  tone(freq) {
    if (!Settings.values.sound) return;
    this.ensure();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    o.connect(g);
    g.connect(this.ctx.destination);
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.start(t);
    o.stop(t + 0.65);
  },

  vibrate(pattern) {
    if (Settings.values.haptic && navigator.vibrate) navigator.vibrate(pattern);
  }
};
