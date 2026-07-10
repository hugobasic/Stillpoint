'use strict';

import { Store } from '../core/store.js';
import { todayKey, formatDate, esc } from '../core/utils.js';

/* Top 3 of the Day — view + logic. */

export const template = `
  <section class="view" id="view-top3" data-route="top3">
    <header class="topbar">
      <a class="back" href="#home" aria-label="Back">‹</a>
      <h2>Top 3 of the Day</h2>
    </header>
    <div class="scroll">
      <p class="date-label" id="top3-date"></p>
      <form id="top3-form" class="stack" autocomplete="off">
        <label class="field">
          <span class="field-num">1</span>
          <input type="text" name="t1" placeholder="First good moment…" maxlength="160" />
        </label>
        <label class="field">
          <span class="field-num">2</span>
          <input type="text" name="t2" placeholder="Second good moment…" maxlength="160" />
        </label>
        <label class="field">
          <span class="field-num">3</span>
          <input type="text" name="t3" placeholder="Third good moment…" maxlength="160" />
        </label>
      </form>
      <p class="saved-hint" id="top3-hint">Saved automatically</p>

      <div id="top3-history" class="history"></div>
    </div>
  </section>
`;

export const Top3 = {
  key: 'stillpoint.top3',
  form: null,
  hintTimer: null,

  init() {
    this.form = document.getElementById('top3-form');
    document.getElementById('top3-date').textContent = formatDate(todayKey());
    this.form.addEventListener('input', () => this.save());
  },

  data() { return Store.get(this.key, {}); },

  save() {
    const all = this.data();
    const fd = new FormData(this.form);
    all[todayKey()] = { t1: fd.get('t1').trim(), t2: fd.get('t2').trim(), t3: fd.get('t3').trim() };
    if (!all[todayKey()].t1 && !all[todayKey()].t2 && !all[todayKey()].t3) delete all[todayKey()];
    Store.set(this.key, all);
    this.flashHint();
  },

  flashHint() {
    const hint = document.getElementById('top3-hint');
    hint.classList.add('show');
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => hint.classList.remove('show'), 1200);
  },

  render() {
    const all = this.data();
    const today = all[todayKey()] || {};
    this.form.t1.value = today.t1 || '';
    this.form.t2.value = today.t2 || '';
    this.form.t3.value = today.t3 || '';

    const past = Object.keys(all).filter(k => k !== todayKey()).sort().reverse();
    const box = document.getElementById('top3-history');
    if (!past.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<p class="history-title">Earlier days</p>' + past.map(k => {
      const e = all[k];
      const items = [e.t1, e.t2, e.t3].filter(Boolean).map(t => `<li>${esc(t)}</li>`).join('');
      return `<div class="history-item"><div class="h-date">${formatDate(k)}</div><ul>${items}</ul></div>`;
    }).join('');
  }
};
