(() => {
  'use strict';

  const MAX_TOTAL = 50;
  const MAX_COLS = 10;
  let ROWS = 5;
  let COLS = MAX_COLS;
  let TOTAL = MAX_TOTAL; // set from the "How many?" step
  const STORAGE_KEYS = { numbers: 'numberDemoData', colors: 'colorDemoData' };

  // Change this before the show. Client-side only — stops casual snooping,
  // not a determined technical visitor (it's readable in the page source).
  const PIN = '2110';
  const PIN_SESSION_KEY = 'memoryDemoUnlocked';
  const PALETTE = [
    { name: 'Black', hex: '#111111' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Red', hex: '#e53935' },
  ];

  const pinScreen = document.getElementById('pin-screen');
  const pinForm = document.getElementById('pin-form');
  const pinInput = document.getElementById('pin-input');
  const pinError = document.getElementById('pin-error');
  const launchScreen = document.getElementById('launch-screen');
  const demoScreen = document.getElementById('demo-screen');
  const demoGrid = document.getElementById('demo-grid');
  const demoTitleEl = document.getElementById('demo-title');
  const stageLabelEl = document.getElementById('stage-label');
  const thanksNameEl = document.getElementById('thanks-name');
  const hintEl = document.getElementById('hint');
  const clearBtn = document.getElementById('clear-btn');
  const paletteEl = document.getElementById('palette');
  const startNumbersBtn = document.getElementById('start-numbers-btn');
  const startColorsBtn = document.getElementById('start-colors-btn');

  let mode = null; // 'numbers' | 'colors'
  let phase = 'typing'; // 'typing' | 'reveal'

  let boxEls = [];
  let inputEls = [];   // numbers mode
  let cornerEls = [];
  let rowBadgeEls = [];
  let colBadgeEls = [];
  let colorState = []; // colors mode
  let currentIndex = 0;                        // colors mode "cursor"

  // ---------------------------------------------------------
  // Build the one persistent grid — used for typing AND the reveal.
  // Rebuilt fresh every time a demo is entered, shaped for the active mode.
  // ---------------------------------------------------------
  function buildGrid() {
    demoGrid.innerHTML = '';
    boxEls = new Array(TOTAL);
    inputEls = new Array(TOTAL);
    cornerEls = new Array(TOTAL);
    rowBadgeEls = new Array(ROWS);
    colBadgeEls = new Array(COLS);
    demoGrid.style.setProperty('--rows', String(ROWS));
    demoGrid.style.setProperty('--cols', String(COLS));

    const cornerBlank = document.createElement('div');
    demoGrid.appendChild(cornerBlank);

    for (let c = 0; c < COLS; c++) {
      const b = document.createElement('div');
      b.className = 'badge';
      b.textContent = String(c + 1);
      demoGrid.appendChild(b);
      colBadgeEls[c] = b;
    }

    for (let r = 0; r < ROWS; r++) {
      const rb = document.createElement('div');
      rb.className = 'badge';
      rb.textContent = String(r + 1);
      demoGrid.appendChild(rb);
      rowBadgeEls[r] = rb;

      for (let c = 0; c < COLS && r * COLS + c < TOTAL; c++) {
        const i = r * COLS + c;
        const box = document.createElement('div');
        box.className = 'box revealed'; // visible immediately — she needs to see what she's filling in

        if (mode === 'numbers') {
          const input = document.createElement('input');
          input.className = 'cell-input';
          input.maxLength = 2;
          input.inputMode = 'numeric';
          input.autocomplete = 'off';
          input.dataset.index = String(i);
          box.appendChild(input);
          inputEls[i] = input;
        } else {
          box.dataset.index = String(i);
          box.addEventListener('click', () => selectColorCell(i));
        }

        const corner = document.createElement('span');
        corner.className = 'corner';
        corner.textContent = String(i + 1);
        box.appendChild(corner);

        demoGrid.appendChild(box);
        boxEls[i] = box;
        cornerEls[i] = corner;
      }
    }
  }

  // ---------------------------------------------------------
  // Numbers mode
  // ---------------------------------------------------------
  function loadSavedNumbers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.numbers);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      for (let i = 0; i < TOTAL; i++) {
        if (typeof saved[i] === 'string') inputEls[i].value = saved[i];
      }
    } catch (e) { /* ignore corrupt storage */ }
  }

  // Overlay the first TOTAL values onto what is already saved, so cells past N keep their value.
  function saveMerged(key, values) {
    try {
      let saved = [];
      try { const old = JSON.parse(localStorage.getItem(key)); if (Array.isArray(old)) saved = old; } catch (e) { /* ignore corrupt storage */ }
      values.forEach((v, i) => { saved[i] = v; });
      localStorage.setItem(key, JSON.stringify(saved));
    } catch (e) { /* ignore */ }
  }

  function persistNumbers() {
    saveMerged(STORAGE_KEYS.numbers, inputEls.map((el) => el.value));
  }

  function focusCell(i) {
    if (i >= 0 && i < TOTAL) {
      inputEls[i].focus();
      inputEls[i].select();
    }
  }

  function attachInputHandlers() {
    inputEls.forEach((input, i) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 2);
        persistNumbers();
        updateHint();
        if (input.value.length === 2) focusCell(i + 1);
      });

      input.addEventListener('blur', () => {
        if (input.value.length === 1) input.value = '0' + input.value;
        persistNumbers();
        updateHint();
      });

      input.addEventListener('keydown', (e) => {
        if (phase !== 'typing') return;
        if (e.key === 'ArrowRight') { e.preventDefault(); focusCell(i + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); focusCell(i - 1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); focusCell(i + COLS); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); focusCell(i - COLS); }
        else if (e.key === 'Backspace' && input.value === '') { focusCell(i - 1); }
      });
    });
  }

  // ---------------------------------------------------------
  // Colours mode
  // ---------------------------------------------------------
  function loadSavedColors() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.colors);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      for (let i = 0; i < TOTAL; i++) {
        if (typeof saved[i] === 'string') {
          colorState[i] = saved[i];
          paintBox(i, saved[i]);
        }
      }
    } catch (e) { /* ignore corrupt storage */ }
  }

  function persistColors() {
    saveMerged(STORAGE_KEYS.colors, colorState);
  }

  // Picks black or white for the box-number corner label based on the
  // fill colour's brightness, so it stays legible from the back of an
  // auditorium no matter which of the 7 swatches was used.
  function contrastColor(hex) {
    const clean = (hex || '').replace('#', '');
    if (clean.length !== 6) return '#1a73e8'; // no fill yet — default accent
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? '#000000' : '#ffffff';
  }

  function paintBox(i, hex) {
    boxEls[i].style.background = hex || '';
    cornerEls[i].style.color = mode === 'colors' ? contrastColor(hex) : '';
  }

  function updateCurrentHighlight() {
    boxEls.forEach((box, i) => box.classList.toggle('current', mode === 'colors' && phase === 'typing' && i === currentIndex));
  }

  function selectColorCell(i) {
    if (mode !== 'colors' || phase !== 'typing') return;
    currentIndex = i;
    updateCurrentHighlight();
  }

  function pickColor(hex) {
    if (mode !== 'colors' || phase !== 'typing') return;
    colorState[currentIndex] = hex;
    paintBox(currentIndex, hex);
    persistColors();

    let nextIndex = colorState.findIndex((c, idx) => idx > currentIndex && c === '');
    if (nextIndex === -1) nextIndex = colorState.findIndex((c) => c === '');
    if (nextIndex !== -1) currentIndex = nextIndex;

    updateCurrentHighlight();
    updateHint();
  }

  function buildPalette() {
    paletteEl.innerHTML = '';
    PALETTE.forEach(({ name, hex }) => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'swatch';
      sw.style.background = hex;
      sw.dataset.color = hex;
      sw.title = name;
      sw.setAttribute('aria-label', name);
      sw.addEventListener('click', () => pickColor(hex));
      paletteEl.appendChild(sw);
    });
  }

  // ---------------------------------------------------------
  // Shared typing-phase helpers
  // ---------------------------------------------------------
  function allFilled() {
    return mode === 'numbers'
      ? inputEls.every((el) => /^\d{2}$/.test(el.value))
      : colorState.every((c) => c !== '');
  }

  function updateHint() {
    if (phase === 'typing') {
      if (allFilled()) {
        hintEl.textContent = 'Press Enter to begin';
      } else if (mode === 'numbers') {
        hintEl.textContent = `Type the ${TOTAL * 2} digits, 2 per box · Tab / arrows to move`;
      } else {
        hintEl.textContent = 'Pick a colour for each box · click a box to jump to it';
      }
    } else {
      hintEl.textContent = 'Space / → next stage · ← back · Home replay · Esc exit';
    }
    clearBtn.classList.toggle('hide', phase !== 'typing' || mode === 'numbers'); // numbers boxes are read-only, nothing to clear
    paletteEl.classList.toggle('show', mode === 'colors' && phase === 'typing');
  }

  function clearAll() {
    unlock();
    if (mode === 'numbers') {
      inputEls.forEach((input) => { input.value = ''; });
      persistNumbers();
      focusCell(0);
    } else {
      colorState = new Array(TOTAL).fill('');
      boxEls.forEach((box) => { box.style.background = ''; });
      persistColors();
      currentIndex = 0;
      updateCurrentHighlight();
    }
    updateHint();
  }

  // ---------------------------------------------------------
  // Reveal step engine — rows -> columns -> box numbers -> finale -> thanks
  // (mode-agnostic: only ever touches box/badge/corner classes)
  // ---------------------------------------------------------
  const STEP_START = 0;
  const STEP_ROWS = 1;
  const STEP_COLUMNS = 2;
  const STEP_BOXES = 3;
  const STEP_FINALE = 4;
  const STEP_THANKS = 5;
  const LAST_STEP = STEP_THANKS;

  const STAGE_NAMES = { 1: 'ROWS', 2: 'COLUMNS', 3: 'BOXES', 4: 'COMPLETE', 5: 'THANK YOU' };
  function stageNameFor(step) {
    if (step === STEP_START) return mode === 'numbers' ? 'NUMBERS' : 'COLOURS';
    return STAGE_NAMES[step];
  }

  const ROW_GAP = 90;
  const COL_BADGE_GAP = 55;
  const BOX_INDEX_GAP = 16;

  let currentStep = 0;
  let lastStage = null;
  let wasRowsOn = false;
  let wasColsOn = false;
  let wasBoxesOn = false;

  function showStageLabel(text) {
    stageLabelEl.textContent = text;
    stageLabelEl.classList.add('show');
  }

  function cascade(els, className, on, delayFn) {
    els.forEach((el, i) => {
      if (on) {
        el.classList.remove(className);
        el.style.transitionDelay = `${delayFn(i)}ms`;
        void el.offsetWidth;
        el.classList.add(className);
      } else {
        el.style.transitionDelay = '0ms';
        el.classList.remove(className);
      }
    });
  }

  function render(step) {
    const rowsOn = step === STEP_ROWS || step >= STEP_BOXES; // rows reappear once we're revealing box numbers
    const colsOn = step >= STEP_COLUMNS;
    const boxesOn = step >= STEP_BOXES;
    const finale = step >= STEP_FINALE;
    const stage = stageNameFor(step);

    if (rowsOn !== wasRowsOn) {
      cascade(rowBadgeEls, 'revealed', rowsOn, (r) => r * ROW_GAP);
    }
    if (colsOn !== wasColsOn) {
      cascade(colBadgeEls, 'revealed', colsOn, (c) => c * COL_BADGE_GAP);
      cascade(boxEls, 'col-highlight', colsOn, (i) => (i % COLS) * COL_BADGE_GAP);
    }
    if (boxesOn !== wasBoxesOn) {
      cascade(cornerEls, 'show', boxesOn, (i) => i * BOX_INDEX_GAP);
    }
    if (finale && step === STEP_FINALE) {
      boxEls.forEach((box, i) => {
        box.classList.remove('finale-wave');
        box.style.animationDelay = `${i * 12}ms`;
        void box.offsetWidth;
        box.classList.add('finale-wave');
      });
    }

    if (stage !== lastStage) {
      showStageLabel(stage);
      lastStage = stage;
    }

    demoGrid.classList.toggle('hidden', step === STEP_THANKS);
    stageLabelEl.classList.toggle('thanks', step === STEP_THANKS);
    thanksNameEl.classList.toggle('show', step === STEP_THANKS);

    wasRowsOn = rowsOn;
    wasColsOn = colsOn;
    wasBoxesOn = boxesOn;
  }

  function goTo(step) {
    currentStep = Math.max(0, Math.min(LAST_STEP, step));
    render(currentStep);
  }
  function next() { if (currentStep < LAST_STEP) goTo(currentStep + 1); }
  function prev() { if (currentStep > 0) goTo(currentStep - 1); }
  function restartReveal() {
    lastStage = null;
    wasRowsOn = false;
    wasColsOn = false;
    wasBoxesOn = false;
    boxEls.forEach((box) => {
      box.classList.remove('col-highlight', 'finale-wave');
      box.style.transitionDelay = '0ms';
    });
    cornerEls.forEach((el) => {
      el.classList.remove('show');
      el.style.transitionDelay = '0ms';
    });
    rowBadgeEls.forEach((el) => el.classList.remove('revealed'));
    colBadgeEls.forEach((el) => el.classList.remove('revealed'));
    goTo(0);
  }

  function lock() {
    phase = 'reveal';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.getSelection().removeAllRanges();
    if (mode === 'numbers') inputEls.forEach((input) => { input.disabled = true; });
    updateCurrentHighlight();
    updateHint();
    restartReveal();
  }

  function unlock() {
    phase = 'typing';
    if (mode === 'numbers') inputEls.forEach((input) => { input.disabled = false; });
    stageLabelEl.classList.remove('show');
    lastStage = null;
    boxEls.forEach((box) => box.classList.remove('col-highlight', 'finale-wave'));
    cornerEls.forEach((el) => el.classList.remove('show'));
    rowBadgeEls.forEach((el) => el.classList.remove('revealed'));
    colBadgeEls.forEach((el) => el.classList.remove('revealed'));
    demoGrid.classList.remove('hidden');
    stageLabelEl.classList.remove('thanks');
    thanksNameEl.classList.remove('show');
    currentStep = 0;
    updateCurrentHighlight();
    updateHint();
  }

  // ---------------------------------------------------------
  // Screen flow
  // ---------------------------------------------------------
  function enterDemo(chosenMode, count) {
    mode = chosenMode;
    phase = 'typing';
    TOTAL = count;
    COLS = Math.min(MAX_COLS, count);
    ROWS = Math.ceil(count / COLS);
    demoTitleEl.textContent = mode === 'numbers' ? 'Number Memory Demo' : 'Colour Memory Demo';

    buildGrid();

    if (mode === 'numbers') {
      loadSavedNumbers();
      attachInputHandlers();
    } else {
      colorState = new Array(TOTAL).fill('');
      loadSavedColors();
      buildPalette();
      const firstEmpty = colorState.findIndex((c) => c === '');
      currentIndex = firstEmpty === -1 ? 0 : firstEmpty;
      updateCurrentHighlight();
    }

    launchScreen.classList.remove('active');
    demoScreen.classList.add('active');

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

    updateHint();
    if (mode === 'numbers') {
      const firstEmpty = inputEls.findIndex((input) => input.value.length < 2);
      focusCell(firstEmpty === -1 ? 0 : firstEmpty);
    }
  }

  function exitDemo() {
    demoScreen.classList.remove('active');
    launchScreen.classList.add('active');
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    unlock();
  }

  // ---------------------------------------------------------
  // PIN gate
  // ---------------------------------------------------------
  function unlockApp() {
    pinScreen.classList.remove('active');
    launchScreen.classList.add('active');
  }

  function logout() {
    try { sessionStorage.removeItem(PIN_SESSION_KEY); } catch (e) { /* ignore */ }
    launchScreen.classList.remove('active');
    pinScreen.classList.add('active');
    pinInput.value = '';
    pinError.textContent = '';
    pinInput.focus();
  }

  const MAX_PIN_ATTEMPTS = 5;
  const LOCKOUT_MS = 30000;
  let failedAttempts = 0;
  let lockedOut = false;

  function setPinLocked(locked, message) {
    lockedOut = locked;
    pinInput.disabled = locked;
    pinForm.querySelector('.unlock-btn').disabled = locked;
    if (message !== undefined) pinError.textContent = message;
  }

  function tryPin() {
    if (lockedOut) return;
    if (pinInput.value === PIN) {
      failedAttempts = 0;
      try { sessionStorage.setItem(PIN_SESSION_KEY, '1'); } catch (e) { /* ignore */ }
      pinError.textContent = '';
      unlockApp();
      return;
    }

    failedAttempts++;
    pinInput.value = '';
    pinForm.classList.remove('shake');
    void pinForm.offsetWidth;
    pinForm.classList.add('shake');

    if (failedAttempts >= MAX_PIN_ATTEMPTS) {
      setPinLocked(true, `Too many attempts — try again in ${LOCKOUT_MS / 1000}s`);
      setTimeout(() => {
        failedAttempts = 0;
        setPinLocked(false, '');
        pinInput.focus();
      }, LOCKOUT_MS);
    } else {
      pinError.textContent = `Incorrect PIN (${MAX_PIN_ATTEMPTS - failedAttempts} attempt${MAX_PIN_ATTEMPTS - failedAttempts === 1 ? '' : 's'} left)`;
      pinInput.focus();
    }
  }

  pinForm.addEventListener('submit', (e) => { e.preventDefault(); tryPin(); });

  let alreadyUnlocked = false;
  try { alreadyUnlocked = sessionStorage.getItem(PIN_SESSION_KEY) === '1'; } catch (e) { /* ignore */ }
  if (alreadyUnlocked) unlockApp();
  else pinInput.focus();

  // "How many?" step
  const sizeScreen = document.getElementById('size-screen');
  const sizeForm = document.getElementById('size-form');
  const sizeInput = document.getElementById('size-input');
  const sizeError = document.getElementById('size-error');
  const sizeSubtitle = document.getElementById('size-subtitle');
  let pendingMode = null;

  function openSize(m) {
    pendingMode = m;
    sizeError.textContent = '';
    const digits = m === 'numbers'; // numbers: 2 digits per box; colours: 1 box each
    sizeInput.value = String(digits ? MAX_TOTAL * 2 : MAX_TOTAL);
    sizeSubtitle.textContent = digits ? `Choose 2 to ${MAX_TOTAL * 2} digits` : `Choose 1 to ${MAX_TOTAL} boxes`;
    launchScreen.classList.remove('active');
    sizeScreen.classList.add('active');
    sizeInput.focus();
    sizeInput.select();
  }

  function closeSize() {
    sizeScreen.classList.remove('active');
    launchScreen.classList.add('active');
  }

  sizeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = sizeInput.value.trim();
    const n = Number(raw);
    const per = pendingMode === 'numbers' ? 2 : 1; // digits per box
    if (!/^\d+$/.test(raw) || n < per || n > MAX_TOTAL * per || n % per) {
      sizeError.textContent = per === 2
        ? `Enter an even number of digits from 2 to ${MAX_TOTAL * 2}`
        : `Enter a whole number from 1 to ${MAX_TOTAL}`;
      sizeInput.focus();
      return;
    }
    sizeScreen.classList.remove('active');
    if (pendingMode === 'numbers') openLine(n); else enterDemo(pendingMode, n / per);
  });

  // "Type the digits" step (numbers only)
  const lineScreen = document.getElementById('line-screen');
  const lineForm = document.getElementById('line-form');
  const lineInput = document.getElementById('line-input');
  const lineError = document.getElementById('line-error');
  const lineSubtitle = document.getElementById('line-subtitle');
  const lineFill = document.getElementById('line-fill');
  let lineDigits = 0;
  let lineLast = 0;
  const lineDigitsOnly = () => lineInput.value.replace(/\D/g, '');

  function openLine(n) {
    lineDigits = n;
    lineInput.value = '';
    lineError.textContent = '';
    lineSubtitle.textContent = `0 / ${n} digits`;
    lineLast = 0;
    lineFill.style.width = '0';
    lineInput.style.height = '';
    lineScreen.classList.add('active');
    lineInput.focus();
  }

  function closeLine() {
    lineScreen.classList.remove('active');
    sizeScreen.classList.add('active');
    sizeInput.focus();
    sizeInput.select();
  }

  lineInput.addEventListener('input', (e) => {
    let d = lineDigitsOnly().slice(0, lineDigits);
    // Backspace that only removed a space/newline: drop the last digit instead
    if (e.inputType === 'deleteContentBackward' && d.length === lineLast) d = d.slice(0, -1);
    lineLast = d.length;
    const pairs = d.match(/\d{1,2}/g) || [];
    lineInput.value = pairs.map((p, i) => (i ? (i % 10 ? ' ' : '\n') : '') + p).join('');
    lineInput.style.height = 'auto';
    lineInput.style.height = lineInput.scrollHeight + 'px';
    lineFill.style.width = `${(100 * d.length) / lineDigits}%`;
    lineSubtitle.textContent = `${d.length} / ${lineDigits} digits`;
    lineError.textContent = '';
  });

  document.getElementById('line-clear-btn').addEventListener('click', () => openLine(lineDigits));

  lineInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); lineForm.requestSubmit(); } // stop: the demo-screen Enter handler must not also see this keypress
  });

  lineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = lineDigitsOnly();
    if (d.length !== lineDigits) {
      lineError.textContent = `Enter all ${lineDigits} digits (${d.length} so far)`;
      lineInput.focus();
      return;
    }
    lineScreen.classList.remove('active');
    enterDemo('numbers', lineDigits / 2);
    inputEls.forEach((el, i) => { el.value = d.slice(2 * i, 2 * i + 2); el.readOnly = true; }); // typed on the line screen; boxes are display only
    persistNumbers();
    updateHint();
    focusCell(0);
  });
  document.getElementById('line-back-btn').addEventListener('click', closeLine);
  document.getElementById('size-back-btn').addEventListener('click', closeSize);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (lineScreen.classList.contains('active')) { e.preventDefault(); closeLine(); }
    else if (sizeScreen.classList.contains('active')) { e.preventDefault(); closeSize(); }
  });

  startNumbersBtn.addEventListener('click', () => openSize('numbers'));
  startColorsBtn.addEventListener('click', () => openSize('colors'));
  document.getElementById('logout-btn').addEventListener('click', logout);
  clearBtn.addEventListener('click', clearAll);

  document.addEventListener('keydown', (e) => {
    if (!demoScreen.classList.contains('active')) return;
    if (e.key === 'Escape') { e.preventDefault(); exitDemo(); return; }

    if (phase === 'typing') {
      if (mode === 'colors') {
        if (e.key === 'ArrowRight') { e.preventDefault(); selectColorCell(Math.min(TOTAL - 1, currentIndex + 1)); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); selectColorCell(Math.max(0, currentIndex - 1)); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); if (currentIndex + COLS < TOTAL) selectColorCell(currentIndex + COLS); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (currentIndex - COLS >= 0) selectColorCell(currentIndex - COLS); }
        else if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          colorState[currentIndex] = '';
          paintBox(currentIndex, '');
          persistColors();
          updateHint();
        } else if ((e.key === 'Enter' || e.key === ' ') && allFilled()) { e.preventDefault(); lock(); }
      }
      // numbers mode: arrows/backspace live on the per-input listeners; Enter works even when no box has focus
      else if ((e.key === 'Enter' || e.key === ' ') && allFilled()) { e.preventDefault(); lock(); }
      return;
    }

    if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); restartReveal(); }
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && demoScreen.classList.contains('active')) {
      exitDemo();
    }
  });
})();
