'use strict';

/* ============================================================
   Install prompt (Add to Home Screen) — view + logic
   - Chromium (Android/desktop): custom banner + native prompt()
   - iOS Safari: manual "Add to Home Screen" instructions
   - Respects install state and a snooze after dismissal
   ============================================================ */

export const template = `
  <div class="install-ui" id="install-ui" hidden>
    <!-- Custom banner: native prompt on Chromium, instructions trigger on iOS -->
    <div class="install-banner" id="install-banner" hidden>
      <span class="install-banner__icon" aria-hidden="true">
        <img src="icons/icon-192.png" alt="" width="40" height="40" />
      </span>
      <span class="install-banner__text">
        <strong>Install Stillpoint</strong>
        <small>Add it to your home screen for quick, offline access.</small>
      </span>
      <span class="install-banner__actions">
        <button type="button" class="install-btn" id="install-accept">Install</button>
        <button type="button" class="install-dismiss" id="install-dismiss" aria-label="Dismiss">✕</button>
      </span>
    </div>

    <!-- iOS Safari manual instructions -->
    <div class="install-ios" id="install-ios" hidden role="dialog" aria-modal="true" aria-labelledby="install-ios-title">
      <div class="install-ios__card">
        <button type="button" class="install-ios__close" id="install-ios-close" aria-label="Close">✕</button>
        <span class="install-ios__icon" aria-hidden="true">
          <img src="icons/icon-192.png" alt="" width="52" height="52" />
        </span>
        <h3 id="install-ios-title">Install Stillpoint</h3>
        <p>Add this app to your home screen in three steps.</p>
        <ol class="install-ios__steps">
          <li>Tap the
            <span class="ios-share" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 15V3" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
              </svg>
            </span>
            <strong>Share</strong> button.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong> to finish.</li>
        </ol>
      </div>
    </div>
  </div>
`;

const SNOOZE_KEY = 'stillpoint.install.snoozeUntil';
const SNOOZE_DAYS = 14;

let deferredPrompt = null;
let mode = null; // 'native' | 'ios'
const el = {};

/* ---------- Environment checks ---------- */
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

function isIos() {
  const ua = navigator.userAgent;
  const iOSDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as "MacIntel" but exposes touch points.
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

function isIosSafari() {
  // On iOS only Safari can Add to Home Screen (other browsers use WebKit
  // but lack the option), so exclude the known third-party wrappers.
  return isIos() && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent);
}

function isSnoozed() {
  const until = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
  return Date.now() < until;
}

function snooze() {
  const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  try { localStorage.setItem(SNOOZE_KEY, String(until)); } catch (e) { /* ignore */ }
}

function clearSnooze() {
  try { localStorage.removeItem(SNOOZE_KEY); } catch (e) { /* ignore */ }
}

/* ---------- DOM ---------- */
function cacheDom() {
  el.root = document.getElementById('install-ui');
  el.banner = document.getElementById('install-banner');
  el.accept = document.getElementById('install-accept');
  el.dismiss = document.getElementById('install-dismiss');
  el.ios = document.getElementById('install-ios');
  el.iosClose = document.getElementById('install-ios-close');
}

function showBanner() {
  if (!el.root || !el.banner) return;
  el.root.hidden = false;
  el.banner.hidden = false;
  // Force reflow so the entry transition runs.
  void el.banner.offsetWidth;
  el.banner.classList.add('is-visible');
}

function hideBanner() {
  if (!el.banner) return;
  el.banner.classList.remove('is-visible');
}

function openIosSheet() {
  if (!el.ios) return;
  el.root.hidden = false;
  el.ios.hidden = false;
  void el.ios.offsetWidth;
  el.ios.classList.add('is-visible');
}

function closeIosSheet() {
  if (!el.ios) return;
  el.ios.classList.remove('is-visible');
}

/* ---------- Actions ---------- */
async function onAccept() {
  if (mode === 'ios') {
    openIosSheet();
    return;
  }
  if (!deferredPrompt) return;
  hideBanner();
  deferredPrompt.prompt();
  try {
    const choice = await deferredPrompt.userChoice;
    if (choice && choice.outcome === 'dismissed') snooze();
  } catch (e) { /* ignore */ }
  deferredPrompt = null;
}

function onDismiss() {
  snooze();
  hideBanner();
}

/* ---------- Wire up ---------- */
function bind() {
  if (el.accept) el.accept.addEventListener('click', onAccept);
  if (el.dismiss) el.dismiss.addEventListener('click', onDismiss);
  if (el.iosClose) el.iosClose.addEventListener('click', closeIosSheet);
  if (el.ios) {
    el.ios.addEventListener('click', function (e) {
      if (e.target === el.ios) closeIosSheet(); // tap backdrop to close
    });
  }
}

export function initInstallPrompt() {
  cacheDom();
  if (!el.root) return;
  bind();

  if (isStandalone()) return; // already installed — nothing to offer

  // Chromium fires this when the app is installable.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    mode = 'native';
    if (!isSnoozed()) showBanner();
  });

  // Clean up once installed.
  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    hideBanner();
    closeIosSheet();
    clearSnooze();
  });

  // iOS has no beforeinstallprompt — offer manual instructions instead.
  if (isIosSafari() && !isSnoozed()) {
    mode = 'ios';
    showBanner();
  }
}
