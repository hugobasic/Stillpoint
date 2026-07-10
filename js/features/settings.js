'use strict';

import { Store } from '../core/store.js';
import { Cue } from './cue.js';

/* Settings — view + persisted preferences (sound / haptic / strict). */

export const template = `
  <section class="view" id="view-settings" data-route="settings">
    <header class="topbar">
      <a class="back" href="#home" aria-label="Back">‹</a>
      <h2>Settings</h2>
    </header>
    <div class="scroll">
      <p class="history-title" style="margin-top:14px">Breathing cues</p>
      <div class="settings-group">
        <label class="toggle-row">
          <span class="toggle-text">
            <strong>Sound cue</strong>
            <small>A gentle tone when the breath changes</small>
          </span>
          <input type="checkbox" id="set-sound" class="switch" />
        </label>
        <label class="toggle-row">
          <span class="toggle-text">
            <strong>Haptic cue</strong>
            <small>Vibrate when the breath changes</small>
          </span>
          <input type="checkbox" id="set-haptic" class="switch" />
        </label>
        <label class="toggle-row">
          <span class="toggle-text">
            <strong>Strict hold &amp; release</strong>
            <small>Only progress the timer while holding on the in‑breath and releasing on the out‑breath</small>
          </span>
          <input type="checkbox" id="set-strict" class="switch" />
        </label>
      </div>
      <p class="breathe-note" style="margin:18px 2px 0">Haptic feedback depends on your device and browser support.</p>
    </div>
  </section>
`;

export const Settings = {
  key: 'stillpoint.settings',
  defaults: { sound: false, haptic: false, strict: false },
  values: null,

  init() {
    this.values = Object.assign({}, this.defaults, Store.get(this.key, {}));
    this.sound = document.getElementById('set-sound');
    this.haptic = document.getElementById('set-haptic');
    this.strict = document.getElementById('set-strict');
    this.sound.checked = this.values.sound;
    this.haptic.checked = this.values.haptic;
    this.strict.checked = this.values.strict;
    this.sound.addEventListener('change', () => { this.set('sound', this.sound.checked); if (this.values.sound) { Cue.ensure(); Cue.tone(432); } });
    this.haptic.addEventListener('change', () => { this.set('haptic', this.haptic.checked); if (this.values.haptic && navigator.vibrate) navigator.vibrate(40); });
    this.strict.addEventListener('change', () => this.set('strict', this.strict.checked));
  },

  set(key, value) {
    this.values[key] = value;
    Store.set(this.key, this.values);
  }
};
