'use strict';

import { Store } from '../core/store.js';
import { esc } from '../core/utils.js';

/* Situation reflection — view + logic. */

const QUESTIONS = [
  'What happened?',
  'Where did it happen and with whom?',
  'What are my thoughts, my interpretation?',
  'How did it make me feel?',
  "What did I do that I shouldn't have?",
  'What should I have done instead?',
  'If it happens again, what small step in the right direction can I take?'
];

export const template = `
  <section class="view" id="view-situation" data-route="situation">
    <header class="topbar">
      <a class="back" href="#home" aria-label="Back">‹</a>
      <h2>Situation</h2>
    </header>
    <div class="scroll">
      <form id="situation-form" class="stack" autocomplete="off">
        <label class="qfield">
          <span class="q">What happened?</span>
          <textarea name="q1" rows="2"></textarea>
        </label>
        <label class="qfield">
          <span class="q">Where did it happen and with whom?</span>
          <textarea name="q2" rows="2"></textarea>
        </label>
        <label class="qfield">
          <span class="q">What are my thoughts, my interpretation?</span>
          <textarea name="q3" rows="2"></textarea>
        </label>
        <label class="qfield">
          <span class="q">How did it make me feel?</span>
          <textarea name="q4" rows="2"></textarea>
        </label>
        <label class="qfield">
          <span class="q">What did I do that I shouldn't have?</span>
          <textarea name="q5" rows="2"></textarea>
        </label>
        <label class="qfield">
          <span class="q">What should I have done instead?</span>
          <textarea name="q6" rows="2"></textarea>
        </label>
        <label class="qfield">
          <span class="q">If it happens again, what small step in the right direction can I take?</span>
          <textarea name="q7" rows="2"></textarea>
        </label>
        <button type="submit" class="primary">Save situation</button>
      </form>

      <div id="situation-list" class="history"></div>
    </div>
  </section>
`;

export const Situation = {
  key: 'stillpoint.situations',
  questions: QUESTIONS,
  form: null,

  init() {
    this.form = document.getElementById('situation-form');
    this.form.addEventListener('submit', e => {
      e.preventDefault();
      this.add();
    });
    const list = document.getElementById('situation-list');
    list.addEventListener('click', e => {
      if (e.target.classList.contains('del')) this.remove(e.target.dataset.id);
    });
  },

  data() { return Store.get(this.key, []); },

  add() {
    const fd = new FormData(this.form);
    const answers = [];
    for (let i = 1; i <= 7; i++) answers.push((fd.get('q' + i) || '').trim());
    if (answers.every(a => !a)) return;
    const all = this.data();
    all.unshift({ id: Date.now().toString(), date: new Date().toISOString(), answers });
    Store.set(this.key, all);
    this.form.reset();
    this.render();
  },

  remove(id) {
    Store.set(this.key, this.data().filter(s => s.id !== id));
    this.render();
  },

  render() {
    const all = this.data();
    const list = document.getElementById('situation-list');
    if (!all.length) { list.innerHTML = ''; return; }
    list.innerHTML = '<p class="history-title">Saved situations</p>' + all.map(s => {
      const when = new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const qa = s.answers.map((a, i) => a
        ? `<div class="qa"><span class="ql">${esc(this.questions[i])}</span>${esc(a)}</div>` : '').join('');
      return `<div class="history-item"><div class="h-date">${when}</div>${qa}
        <button class="del" data-id="${s.id}">Delete</button></div>`;
    }).join('');
  }
};
