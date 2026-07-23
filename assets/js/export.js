function handleExport() {
  if (typeof downloadCSV === 'function') {
    downloadCSV(counts);
  }
  const csvModalEl = document.getElementById('csvModal');
  const modalInstance = bootstrap.Modal.getInstance(csvModalEl) || new bootstrap.Modal(csvModalEl);
  modalInstance.hide();
}