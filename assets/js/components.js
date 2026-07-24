function injectModals() {
  const container = document.getElementById('modalContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold" id="helpModalLabel">Count Sheet Instructions</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <ul class="mb-0 ps-3">
              <li class="mb-2"><strong>Entering Counts:</strong> Enter full case quantities under <em>Case</em> and individual items under <em>Loose</em>. The <em>On Hand</em> total calculates automatically based on the item pack size.</li>
              <li class="mb-2"><strong>Search:</strong> Use the search bar to filter by item name or sequence number.</li>
              <li class="mb-2"><strong>POS Key-In:</strong> Click <strong>Totals →</strong> to view all counts ordered in POS sequence for fast entry or printing.</li>
              <li class="mb-2"><strong>Exporting:</strong> Click <strong>Export</strong> to choose a CSV download or a PDF export of the totals view.</li>
              <li><strong>Resetting:</strong> Click <strong>Reset</strong> to clear all counts for a new sheet.</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Got it</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="csvModal" tabindex="-1" aria-labelledby="csvModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold" id="csvModalLabel">Export Inventory</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Choose how to export the current totals view.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-outline-success" id="confirmCsvBtn" data-bs-dismiss="modal">Export CSV</button>
            <button type="button" class="btn btn-primary" id="confirmPdfBtn" data-bs-dismiss="modal">Export PDF</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="resetModal" tabindex="-1" aria-labelledby="resetModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold" id="resetModalLabel">Reset Count Sheet</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Clear all counts for a fresh count sheet? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmResetBtn" data-bs-dismiss="modal">Reset Counts</button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!document.getElementById('toast')) {
    const toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'position-fixed start-50 translate-middle-x bg-danger text-white rounded px-3 py-2 text-nowrap small fw-medium';
    toastEl.style.bottom = '76px';
    toastEl.style.zIndex = '1050';
    toastEl.style.display = 'none';
    document.body.appendChild(toastEl);
  }

  const csvBtn = document.getElementById('confirmCsvBtn');
  if (csvBtn) {
    csvBtn.addEventListener('click', () => {
      if (typeof handleExport === 'function') handleExport('csv');
    });
  }

  const pdfBtn = document.getElementById('confirmPdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      if (typeof handleExport === 'function') handleExport('pdf');
    });
  }

  const resetBtn = document.getElementById('confirmResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeof handleReset === 'function') handleReset();
    });
  }
}

// Helper function for displaying the toast
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}