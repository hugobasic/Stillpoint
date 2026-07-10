'use strict';

/* ============================================================
   Stillpoint — application entry point
   Mounts feature views, wires the router, and boots services.
   ============================================================ */

import { onRoute, startRouter, registerRoutes } from './core/router.js';
import { registerServiceWorker } from './core/sw-register.js';

import { template as homeView } from './features/home.js';
import { template as top3View, Top3 } from './features/top3.js';
import { template as breatheView, Breathe } from './features/breathe.js';
import { template as learnView, routes as learnRoutes, syncVideos } from './features/learn.js';
import { template as situationView, Situation } from './features/situation.js';
import { template as settingsView, Settings } from './features/settings.js';
import { template as installView, initInstallPrompt } from './features/install.js';

/* Views are rendered in menu order. */
const VIEWS = [homeView, top3View, breatheView, learnView, situationView, settingsView, installView];

function mount() {
  const app = document.getElementById('app');
  app.innerHTML = VIEWS.join('');
}

function initFeatures() {
  Settings.init();
  Top3.init();
  Situation.init();
  Breathe.init();
  initInstallPrompt();
}

function wireRouter() {
  registerRoutes(learnRoutes);
  onRoute(route => {
    if (route === 'top3') Top3.render();
    if (route === 'situation') Situation.render();
    if (route === 'breathe') Breathe.reset();
    // Load the active course video; unload (and stop) all others.
    syncVideos();
  });
  startRouter();
}

function boot() {
  mount();
  initFeatures();
  wireRouter();
  registerServiceWorker();
}

boot();
