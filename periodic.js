(() => {
  'use strict';

  const screen = document.getElementById('periodic-screen');
  const ptWrap = document.getElementById('pt-wrap');
  const ptTable = document.getElementById('pt-table');
  const ptFblock = document.getElementById('pt-fblock');
  const ptLegend = document.getElementById('pt-legend');
  const grid = document.getElementById('periodic-grid');
  const stageLabelEl = document.getElementById('periodic-stage-label');
  const thanksNameEl = document.getElementById('periodic-thanks-name');
  const hintEl = document.getElementById('periodic-hint');
  const launchScreen = document.getElementById('launch-screen');
  const startBtn = document.getElementById('start-periodic-btn');

  const CATEGORY_LABELS = {
    'alkali': 'Alkali metal',
    'alkaline-earth': 'Alkaline earth metal',
    'transition': 'Transition metal',
    'post-transition': 'Post-transition metal',
    'metalloid': 'Metalloid',
    'reactive-nonmetal': 'Reactive nonmetal',
    'noble-gas': 'Noble gas',
    'lanthanide': 'Lanthanide',
    'actinide': 'Actinide',
    'unknown': 'Unknown properties',
  };

  const rowEls = [];       // the two-column list (stage 2)
  const ptCellEls = [];    // real-table cells, in atomic-number order (stage 1)

  // ---------------------------------------------------------
  // Build stage 1: the real periodic table, laid out exactly like
  // the standard printed chart (18 columns x 7 periods, f-block
  // pulled out below), colour-coded by category, with a legend.
  // ---------------------------------------------------------
  function buildRealTable() {
    ptTable.innerHTML = '';
    ptFblock.innerHTML = '';
    ptLegend.innerHTML = '';
    ptCellEls.length = 0;

    ELEMENTS.forEach((el) => {
      const pos = positionForElement(el.number);
      const cell = document.createElement('div');
      cell.className = `pt-cell cat-${el.category}`;

      const num = document.createElement('span');
      num.className = 'pt-num';
      num.textContent = el.number;

      const sym = document.createElement('span');
      sym.className = 'pt-sym';
      sym.textContent = el.symbol;

      const nm = document.createElement('span');
      nm.className = 'pt-name';
      nm.textContent = el.name;

      const wt = document.createElement('span');
      wt.className = 'pt-weight';
      wt.textContent = el.weight;

      cell.appendChild(num);
      cell.appendChild(sym);
      cell.appendChild(nm);
      cell.appendChild(wt);

      if (pos.fBlock) {
        cell.style.gridColumn = String(pos.fCol + 1);
        cell.style.gridRow = pos.period === 6 ? '1' : '2';
        ptFblock.appendChild(cell);
      } else {
        cell.style.gridColumn = String(pos.group);
        cell.style.gridRow = String(pos.period);
        ptTable.appendChild(cell);
      }
      ptCellEls.push(cell);
    });

    Object.keys(CATEGORY_LABELS).forEach((cat) => {
      const item = document.createElement('span');
      item.className = 'pt-legend-item';
      const swatch = document.createElement('span');
      swatch.className = `pt-legend-swatch cat-${cat}`;
      const label = document.createElement('span');
      label.textContent = CATEGORY_LABELS[cat];
      item.appendChild(swatch);
      item.appendChild(label);
      ptLegend.appendChild(item);
    });
  }

  // ---------------------------------------------------------
  // Build stage 2: the two-column (number, name) list — all 118
  // visible at once, tiled into column-groups so nothing scrolls.
  // ---------------------------------------------------------
  function buildList() {
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
  // Stage 1: real table cascades in, period by period.
  // Stage 2: the simpler list format cascades in instead.
  // ---------------------------------------------------------
  const STEP_TABLE = 0;
  const STEP_LIST = 1;
  const STEP_FINALE = 2;
  const STEP_THANKS = 3;
  const LAST_STEP = STEP_THANKS;

  const STAGE_NAMES = { 0: 'PERIODIC TABLE', 1: 'PERIODIC TABLE', 2: 'PERIODIC TABLE', 3: 'THANK YOU' };
  const TABLE_GAP = 5;   // ms between successive elements in the table cascade
  const LIST_GAP = 9;    // ms between successive entries in the list cascade

  let currentStep = 0;
  let lastStage = null;
  let wasTableOn = false;
  let wasListOn = false;

  function showStageLabel(text) {
    stageLabelEl.textContent = text;
    stageLabelEl.classList.add('show');
  }

  function cascade(els, on, gap) {
    els.forEach((el, i) => {
      if (on) {
        el.classList.remove('revealed');
        el.style.transitionDelay = `${i * gap}ms`;
        void el.offsetWidth; // restart transition
        el.classList.add('revealed');
      } else {
        el.style.transitionDelay = '0ms';
        el.classList.remove('revealed');
      }
    });
  }

  function render(step) {
    const tableOn = step === STEP_TABLE;
    const listOn = step >= STEP_LIST;
    const stage = STAGE_NAMES[step];

    if (tableOn !== wasTableOn) cascade(ptCellEls, tableOn, TABLE_GAP);
    if (listOn !== wasListOn) cascade(rowEls, listOn, LIST_GAP);

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

    ptWrap.classList.toggle('hidden', !tableOn);
    grid.classList.toggle('hidden', step === STEP_THANKS || !listOn);
    stageLabelEl.classList.toggle('thanks', step === STEP_THANKS);
    thanksNameEl.classList.toggle('show', step === STEP_THANKS);

    wasTableOn = tableOn;
    wasListOn = listOn;
  }

  function goTo(step) {
    currentStep = Math.max(0, Math.min(LAST_STEP, step));
    render(currentStep);
  }
  function next() { if (currentStep < LAST_STEP) goTo(currentStep + 1); }
  function prev() { if (currentStep > 0) goTo(currentStep - 1); }
  function restart() {
    lastStage = null;
    wasTableOn = false;
    wasListOn = false;
    ptCellEls.forEach((cell) => { cell.style.transitionDelay = '0ms'; });
    rowEls.forEach((row) => {
      row.classList.remove('finale-wave');
      row.style.transitionDelay = '0ms';
    });
    ptWrap.classList.remove('hidden');
    grid.classList.remove('hidden');
    stageLabelEl.classList.remove('show', 'thanks');
    thanksNameEl.classList.remove('show');
    goTo(0);
  }

  function enter() {
    buildRealTable();
    buildList();
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
