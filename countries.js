(() => {
  'use strict';

  const screen = document.getElementById('countries-screen');
  const mapWrap = document.getElementById('map-wrap');
  const mapGrid = document.getElementById('continent-map');
  const searchWrap = document.getElementById('search-wrap');
  const searchInput = document.getElementById('country-search');
  const resultsList = document.getElementById('country-results');
  const resultsCount = document.getElementById('country-count');
  const hintEl = document.getElementById('countries-hint');
  const launchScreen = document.getElementById('launch-screen');
  const startBtn = document.getElementById('start-countries-btn');

  // Rough world-relative arrangement, not geographic accuracy —
  // a stylized cascade, not an atlas.
  const CONTINENT_LAYOUT = [
    'North America', 'Europe', 'Asia',
    'South America', 'Africa', 'Oceania',
  ];

  const continentEls = [];

  function countryCountFor(continent) {
    return COUNTRIES.filter((c) => c.continent === continent).length;
  }

  function buildMap() {
    mapGrid.innerHTML = '';
    continentEls.length = 0;
    CONTINENT_LAYOUT.forEach((name) => {
      const block = document.createElement('div');
      block.className = `continent-block cont-${name.toLowerCase().replace(/\s+/g, '-')}`;

      const label = document.createElement('span');
      label.className = 'continent-name';
      label.textContent = name;

      const count = document.createElement('span');
      count.className = 'continent-count';
      count.textContent = `${countryCountFor(name)} countries`;

      block.appendChild(label);
      block.appendChild(count);
      mapGrid.appendChild(block);
      continentEls.push(block);
    });
  }

  function cascadeMap(on) {
    continentEls.forEach((el, i) => {
      if (on) {
        el.classList.remove('revealed');
        el.style.transitionDelay = `${i * 90}ms`;
        void el.offsetWidth;
        el.classList.add('revealed');
      } else {
        el.style.transitionDelay = '0ms';
        el.classList.remove('revealed');
      }
    });
  }

  // ---------------------------------------------------------
  // Search + results
  // ---------------------------------------------------------
  const sortedCountries = [...COUNTRIES].sort((a, b) => a.country.localeCompare(b.country));

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const matches = q
      ? sortedCountries.filter((c) => c.country.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q))
      : sortedCountries;

    resultsList.innerHTML = '';
    matches.forEach(({ country, capital }) => {
      const row = document.createElement('div');
      row.className = 'country-row';

      const c = document.createElement('span');
      c.className = 'country-name';
      c.textContent = country;

      const cap = document.createElement('span');
      cap.className = 'country-capital';
      cap.textContent = capital;

      row.appendChild(c);
      row.appendChild(cap);
      resultsList.appendChild(row);
    });

    resultsCount.textContent = q
      ? `${matches.length} of ${sortedCountries.length}`
      : `${sortedCountries.length} countries`;
  }

  // ---------------------------------------------------------
  // Two screens only: the map opener, then the search tool.
  // No typing phase, no staged reveal — this is a lookup
  // companion, not a memorize-then-prove-it activity.
  // ---------------------------------------------------------
  const STEP_MAP = 0;
  const STEP_SEARCH = 1;
  const LAST_STEP = STEP_SEARCH;

  let currentStep = 0;
  let wasMapOn = false;

  function render(step) {
    const mapOn = step === STEP_MAP;
    const searchOn = step === STEP_SEARCH;

    if (mapOn !== wasMapOn) cascadeMap(mapOn);

    mapWrap.classList.toggle('hidden', !mapOn);
    searchWrap.classList.toggle('hidden', !searchOn);

    hintEl.textContent = mapOn
      ? 'Space / → search the list · Esc exit'
      : '← back to map · Esc exit';

    if (searchOn) searchInput.focus();

    wasMapOn = mapOn;
  }

  function goTo(step) {
    currentStep = Math.max(0, Math.min(LAST_STEP, step));
    render(currentStep);
  }
  function next() { if (currentStep < LAST_STEP) goTo(currentStep + 1); }
  function prev() { if (currentStep > 0) goTo(currentStep - 1); }
  function restart() {
    wasMapOn = false;
    searchInput.value = '';
    renderResults('');
    goTo(0);
  }

  function enter() {
    buildMap();
    renderResults('');
    launchScreen.classList.remove('active');
    screen.classList.add('active');

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

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
  searchInput.addEventListener('input', () => renderResults(searchInput.value));

  document.addEventListener('keydown', (e) => {
    if (!screen.classList.contains('active')) return;
    if (e.key === 'Escape') { e.preventDefault(); exit(); return; }

    // While typing in the search box, let every key behave normally
    // (Space, Home, arrows are all normal text-editing keys there).
    if (document.activeElement === searchInput) return;

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
