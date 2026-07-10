'use strict';

/* Home / menu view — presentational only. */
export const template = `
  <section class="view" id="view-home" data-route="home">
    <div class="home-inner">
      <div class="logo" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.35"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.55"/>
          <circle cx="50" cy="50" r="22" fill="none" stroke="var(--accent)" stroke-width="1.5" opacity="0.8"/>
          <circle cx="50" cy="50" r="9" fill="var(--accent)" opacity="0.9"/>
        </svg>
      </div>
      <h1 class="app-title">Stillpoint</h1>
      <p class="app-tagline">A calm space to reflect and breathe.</p>

      <nav class="menu">
        <a class="menu-card" href="#top3">
          <span class="menu-icon">✧</span>
          <span class="menu-text">
            <strong>Top 3 of the Day</strong>
            <small>Note your best moments</small>
          </span>
        </a>
        <a class="menu-card" href="#breathe">
          <span class="menu-icon">◯</span>
          <span class="menu-text">
            <strong>Breathing Exercise</strong>
            <small>Slow down and reset</small>
          </span>
        </a>
        <a class="menu-card" href="#situation">
          <span class="menu-icon">❋</span>
          <span class="menu-text">
            <strong>Situation</strong>
            <small>Reflect on a moment</small>
          </span>
        </a>
        <a class="menu-card" href="#settings">
          <span class="menu-icon">⚙</span>
          <span class="menu-text">
            <strong>Settings</strong>
            <small>Cues &amp; timer options</small>
          </span>
        </a>
      </nav>
    </div>
  </section>
`;
