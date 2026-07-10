'use strict';

/* Hash-based view router. Toggles the active `.view` and notifies a listener. */

export const routes = ['home', 'top3', 'breathe', 'situation', 'settings'];

let listener = () => {};

/* Let feature modules add their own routes (e.g. Learn sub-pages). */
export function registerRoutes(extra) {
  for (const r of extra) {
    if (!routes.includes(r)) routes.push(r);
  }
}

export function onRoute(fn) {
  listener = fn;
}

export function startRouter() {
  window.addEventListener('hashchange', apply);
  apply();
}

function apply() {
  let route = location.hash.replace('#', '') || 'home';
  if (!routes.includes(route)) route = 'home';
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.dataset.route === route);
  });
  listener(route);
  window.scrollTo(0, 0);
}
