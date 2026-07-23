function injectModals() {
  const container = document.getElementById('modalContainer');
  if (!container) return;

  container.innerHTML = `
    <!-- Help Modal -->
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
              <li class="mb-2"><strong>Exporting:</strong> Click <strong>Download CSV</strong> to save a local spreadsheet file of your completed inventory count.</li>
              <li><strong>Resetting:</strong> Click <strong>Reset</strong> to clear all counts for a new sheet.</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Got it</button>
          </div>
        </div>
      </div>
    </div>

    <!-- CSV Modal -->
    <div class="modal fade" id="csvModal" tabindex="-1" aria-labelledby="csvModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title fw-bold" id="csvModalLabel">Export Inventory CSV</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Download the current inventory count as a CSV file?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" id="confirmCsvBtn" data-bs-dismiss="modal">Download</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Modal -->
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

  // Inject dynamic Toast container if missing
  if (!document.getElementById('toast')) {
    const toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'position-fixed start-50 translate-middle-x bg-dark text-white rounded px-3 py-2 text-nowrap small fw-medium';
    toastEl.style.bottom = '76px';
    toastEl.style.zIndex = '1050';
    toastEl.style.display = 'none';
    document.body.appendChild(toastEl);
  }

  // Attach button event listeners safely
  const csvBtn = document.getElementById('confirmCsvBtn');
  if (csvBtn) {
    csvBtn.addEventListener('click', () => {
      if (typeof handleExport === 'function') handleExport();
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