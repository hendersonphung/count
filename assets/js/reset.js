function handleReset() {
  counts = {};
  
  if (typeof saveCounts === 'function') {
    saveCounts(counts);
  }
  if (typeof render === 'function') {
    render();
  }
  
  // Trigger toast injected by JS
  if (typeof showToast === 'function') {
    showToast('Count sheet reset');
  }
}