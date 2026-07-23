let counts = {};
let query = "";
let collapsedLocs = new Set();
let currentView = 'count';

function matchesQuery(item) {
  if (!query) return true;
  const q = query.toLowerCase();
  return item.name.toLowerCase().includes(q) || String(item.seq).includes(q);
}

function updateProgress() {
  const totalCounted = ITEMS.filter(i => isCounted(i, counts)).length;
  const label = document.getElementById('progressLabel');
  const fill = document.getElementById('progressFill');
  if (label) label.textContent = `${totalCounted} / ${ITEMS.length} counted`;
  if (fill) fill.style.width = `${(totalCounted / ITEMS.length * 100).toFixed(0)}%`;
}

function renderCountView() {
  const list = document.getElementById('list');
  const emptyNote = document.getElementById('emptyNote');
  list.innerHTML = "";

  const visible = ITEMS.filter(matchesQuery);
  emptyNote.style.display = visible.length === 0 ? 'block' : 'none';

  updateProgress();

  LOC_ORDER.forEach(loc => {
    const items = visible.filter(i => i.location === loc);
    if (items.length === 0) return;

    const section = document.createElement('div');
    section.className = 'loc-section';

    const locCounted = ITEMS.filter(i => i.location === loc && isCounted(i, counts)).length;
    const locTotal = ITEMS.filter(i => i.location === loc).length;

    const isCollapsed = query ? false : collapsedLocs.has(loc);

    const header = document.createElement('div');
    header.className = 'loc-header d-flex justify-content-between align-items-center role-button';
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';

    header.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <svg class="loc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; transition: transform 0.2s ease;">
          <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
        <span class="loc-title fw-bold">${loc}</span>
      </div>
      <span class="loc-count badge">${locCounted}/${locTotal}</span>
    `;

    header.addEventListener('click', () => {
      if (collapsedLocs.has(loc)) {
        collapsedLocs.delete(loc);
      } else {
        collapsedLocs.add(loc);
      }
      renderCountView();
    });

    section.appendChild(header);

    const content = document.createElement('div');
    content.className = 'loc-content';
    if (isCollapsed) {
      content.style.display = 'none';
    }

    items.sort((a, b) => a.seq - b.seq).forEach(item => {
      content.appendChild(renderItem(item));
    });

    section.appendChild(content);
    list.appendChild(section);
  });
}

function renderItem(item) {
  const row = document.createElement('div');
  row.className = 'item-card';
  const c = counts[item.seq] || {};
  const { value, formula } = computeOnHand(item, counts);

  const isDone = value !== null;
  const badgeClass = isDone ? 'is-counted' : 'is-pending';

  row.innerHTML = `
    <div class="item-body">
      <div class="item-header">
        <span class="item-title">${item.name}</span>
        <span class="item-seq">Seq ${item.seq}</span>
      </div>
      <div class="item-pack">${item.packSize || 'No pack size on file'}</div>
      <div class="item-inputs">
        <div class="field-group">
          <label class="field-label">Case</label>
          <input type="number" inputmode="decimal" min="0" step="any" placeholder="0" class="input-count" value="${c.caseCount ?? ''}" data-seq="${item.seq}" data-field="caseCount">
        </div>
        <span class="field-separator">+</span>
        <div class="field-group">
          <label class="field-label">Loose</label>
          <input type="number" inputmode="decimal" min="0" step="any" placeholder="0" class="input-count" value="${c.looseCount ?? ''}" data-seq="${item.seq}" data-field="looseCount">
        </div>
        <div class="field-group on-hand-group">
          <label class="field-label">On hand</label>
          <div class="badge-onhand ${badgeClass}">${value !== null ? fmtNum(value) : '—'}</div>
        </div>
      </div>
      ${formula ? `<div class="item-formula">${formula}</div>` : ''}
    </div>
  `;

  row.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', onInputChange);
  });

  return row;
}

function onInputChange(e) {
  const seq = e.target.getAttribute('data-seq');
  const field = e.target.getAttribute('data-field');
  const val = e.target.value;
  if (!counts[seq]) counts[seq] = {};
  counts[seq][field] = val;
  saveCounts(counts);

  const item = ITEMS.find(i => String(i.seq) === String(seq));
  const rowEl = e.target.closest('.item-card');
  const { value, formula } = computeOnHand(item, counts);

  const onhandEl = rowEl.querySelector('.badge-onhand');

  if (onhandEl) {
    onhandEl.textContent = value !== null ? fmtNum(value) : '—';
    onhandEl.className = `badge-onhand ${value !== null ? 'is-counted' : 'is-pending'}`;
  }

  let formulaEl = rowEl.querySelector('.item-formula');
  if (formula) {
    if (!formulaEl) {
      formulaEl = document.createElement('div');
      formulaEl.className = 'item-formula';
      rowEl.querySelector('.item-body').appendChild(formulaEl);
    }
    formulaEl.textContent = formula;
  } else if (formulaEl) {
    formulaEl.remove();
  }

  updateProgress();

  const loc = item.location;
  const locCounted = ITEMS.filter(i => i.location === loc && isCounted(i, counts)).length;
  const locTotal = ITEMS.filter(i => i.location === loc).length;
  const headerCountEl = rowEl.closest('.loc-section').querySelector('.loc-count');
  if (headerCountEl) headerCountEl.textContent = `${locCounted}/${locTotal}`;
}

function renderTotalsView() {
  const list = document.getElementById('totalsList');
  list.innerHTML = "";

  updateProgress();

  itemsInPosSequence().forEach(item => {
    list.appendChild(renderTotalsRow(item));
  });
}

function renderTotalsRow(item) {
  const { value } = computeOnHand(item, counts);
  const notCounted = value === null;

  const row = document.createElement('div');
  row.className = 'totals-row';
  row.innerHTML = `
    <span class="row-seq">${item.seq}</span>
    <span class="row-name">${item.name}</span>
    <span class="row-value ${notCounted ? 'is-empty' : ''}">${notCounted ? '—' : fmtNum(value)}</span>
  `;

  return row;
}

function renderCurrentView() {
  if (currentView === 'count') {
    renderCountView();
  } else {
    renderTotalsView();
  }
}

function render() {
  renderCurrentView();
}

function switchView(view) {
  currentView = view;
  const isCount = view === 'count';

  document.getElementById('countView').style.display = isCount ? '' : 'none';
  document.getElementById('totalsView').style.display = isCount ? 'none' : '';
  document.getElementById('searchRow').style.display = isCount ? '' : 'none';
  document.getElementById('totalsHeaderExtra').style.display = isCount ? 'none' : '';
  document.getElementById('countActions').style.display = isCount ? '' : 'none';
  document.getElementById('printBtn').style.display = isCount ? 'none' : '';
  document.getElementById('pageTitle').textContent = isCount ? 'Weekly Count Page' : 'POS Key-In / Totals';

  const countBtn = document.getElementById('viewCountBtn');
  const totalsBtn = document.getElementById('viewTotalsBtn');
  countBtn.classList.toggle('btn-dark', isCount);
  countBtn.classList.toggle('btn-outline-dark', !isCount);
  totalsBtn.classList.toggle('btn-dark', !isCount);
  totalsBtn.classList.toggle('btn-outline-dark', isCount);
  countBtn.setAttribute('aria-pressed', String(isCount));
  totalsBtn.setAttribute('aria-pressed', String(!isCount));

  renderCurrentView();
}

document.getElementById('viewCountBtn').addEventListener('click', () => switchView('count'));
document.getElementById('viewTotalsBtn').addEventListener('click', () => switchView('totals'));

document.getElementById('searchInput').addEventListener('input', (e) => {
  query = e.target.value;
  renderCountView();
});


document.getElementById('printBtn').addEventListener('click', () => {
  window.print();
});

window.addEventListener('beforeprint', () => {
  const timestampEl = document.getElementById('printTimestamp');
  if (timestampEl) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    timestampEl.textContent = `Printed on ${formattedDate} at ${formattedTime}`;
  }
});

window.addEventListener('afterprint', () => {
  const timestampEl = document.getElementById('printTimestamp');
  if (timestampEl) {
    timestampEl.textContent = '';
  }
});

(function init() {
  injectModals();
  counts = loadCounts();
  collapsedLocs = new Set(LOC_ORDER);
  switchView('count');
})();
