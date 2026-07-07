'use strict';

/* ============ Simple hash router ============ */
const routes = ['home', 'top3', 'breathe', 'situation', 'settings'];

function showRoute() {
  let route = location.hash.replace('#', '') || 'home';
  if (!routes.includes(route)) route = 'home';
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.dataset.route === route);
  });
  if (route === 'top3') Top3.render();
  if (route === 'situation') Situation.render();
  if (route === 'breathe') Breathe.reset();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', showRoute);

/* ============ Storage helpers ============ */
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

function todayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function formatDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ============ Top 3 of the Day ============ */
const Top3 = {
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

/* ============ Situation ============ */
const Situation = {
  key: 'stillpoint.situations',
  questions: [
    'What happened?',
    'Where did it happen and with whom?',
    'What are my thoughts, my interpretation?',
    'How did it make me feel?',
    "What did I do that I shouldn't have?",
    'What should I have done instead?',
    'If it happens again, what small step in the right direction can I take?'
  ],
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

/* ============ Settings ============ */
const Settings = {
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

/* ============ Sound + haptic cues ============ */
const Cue = {
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

/* ============ Breathing exercise ============ */
const Breathe = {
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

/* ============ Boot ============ */
Settings.init();
Top3.init();
Situation.init();
Breathe.init();
showRoute();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
