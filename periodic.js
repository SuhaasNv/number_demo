(() => {
  'use strict';

  const screen = document.getElementById('periodic-screen');
  const grid = document.getElementById('periodic-grid');
  const stageLabelEl = document.getElementById('periodic-stage-label');
  const thanksNameEl = document.getElementById('periodic-thanks-name');
  const hintEl = document.getElementById('periodic-hint');
  const launchScreen = document.getElementById('launch-screen');
  const startBtn = document.getElementById('start-periodic-btn');

  const rowEls = [];

  // ---------------------------------------------------------
  // Build the 118-entry list — all visible at once, tiled into
  // column-groups (see periodic.css) so nothing needs to scroll.
  // ---------------------------------------------------------
  function build() {
    grid.innerHTML = '';
    rowEls.length = 0;
    ELEMENTS.forEach(({ number, name }) => {
      const row = document.createElement('div');
      row.className = 'element-row';

      const num = document.createElement('span');
      num.className = 'element-num';
      num.textContent = number;

      const nm = document.createElement('span');
      nm.className = 'element-name';
      nm.textContent = name;

      row.appendChild(num);
      row.appendChild(nm);
      grid.appendChild(row);
      rowEls.push(row);
    });
  }

  // ---------------------------------------------------------
  // Step engine — same interaction philosophy as the other
  // activities (Space/→ advance, ← back, Home replay, Esc exit).
  // ---------------------------------------------------------
  const STEP_READY = 0;
  const STEP_REVEAL = 1;
  const STEP_FINALE = 2;
  const STEP_THANKS = 3;
  const LAST_STEP = STEP_THANKS;

  const STAGE_NAMES = { 0: 'PERIODIC TABLE', 1: 'PERIODIC TABLE', 2: 'COMPLETE', 3: 'THANK YOU' };
  const REVEAL_GAP = 9; // ms between successive elements — fast but readable over 118 entries

  let currentStep = 0;
  let lastStage = null;
  let wasRevealed = false;

  function showStageLabel(text) {
    stageLabelEl.textContent = text;
    stageLabelEl.classList.add('show');
  }

  function cascade(on) {
    rowEls.forEach((el, i) => {
      if (on) {
        el.classList.remove('revealed');
        el.style.transitionDelay = `${i * REVEAL_GAP}ms`;
        void el.offsetWidth; // restart transition
        el.classList.add('revealed');
      } else {
        el.style.transitionDelay = '0ms';
        el.classList.remove('revealed');
      }
    });
  }

  function render(step) {
    const revealed = step >= STEP_REVEAL;
    const stage = STAGE_NAMES[step];

    if (revealed !== wasRevealed) cascade(revealed);

    if (step === STEP_FINALE) {
      rowEls.forEach((row, i) => {
        row.classList.remove('finale-wave');
        row.style.animationDelay = `${i * 6}ms`;
        void row.offsetWidth;
        row.classList.add('finale-wave');
      });
    }

    if (stage !== lastStage) {
      showStageLabel(stage);
      lastStage = stage;
    }

    grid.classList.toggle('hidden', step === STEP_THANKS);
    stageLabelEl.classList.toggle('thanks', step === STEP_THANKS);
    thanksNameEl.classList.toggle('show', step === STEP_THANKS);

    wasRevealed = revealed;
  }

  function goTo(step) {
    currentStep = Math.max(0, Math.min(LAST_STEP, step));
    render(currentStep);
  }
  function next() { if (currentStep < LAST_STEP) goTo(currentStep + 1); }
  function prev() { if (currentStep > 0) goTo(currentStep - 1); }
  function restart() {
    lastStage = null;
    wasRevealed = false;
    rowEls.forEach((row) => {
      row.classList.remove('finale-wave');
      row.style.transitionDelay = '0ms';
    });
    grid.classList.remove('hidden');
    stageLabelEl.classList.remove('show', 'thanks');
    thanksNameEl.classList.remove('show');
    goTo(0);
  }

  function enter() {
    build();
    launchScreen.classList.remove('active');
    screen.classList.add('active');

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

    hintEl.textContent = 'Space / → next stage · ← back · Home replay · Esc exit';
    restart();
  }

  function exit() {
    screen.classList.remove('active');
    launchScreen.classList.add('active');
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  startBtn.addEventListener('click', enter);

  document.addEventListener('keydown', (e) => {
    if (!screen.classList.contains('active')) return;
    if (e.key === 'Escape') { e.preventDefault(); exit(); return; }
    if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); restart(); }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && screen.classList.contains('active')) {
      exit();
    }
  });
})();
