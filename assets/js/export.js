function handleExport(format = 'csv') {
  const csvModalEl = document.getElementById('csvModal');
  const modalInstance = bootstrap.Modal.getInstance(csvModalEl) || new bootstrap.Modal(csvModalEl);

  if (format === 'pdf') {
    if (typeof switchView === 'function') {
      switchView('totals');
    }

    window.setTimeout(() => {
      window.print();
      modalInstance.hide();
    });

    return;
  }

  if (typeof downloadCSV === 'function') {
    downloadCSV(counts);
  }

  modalInstance.hide();
}