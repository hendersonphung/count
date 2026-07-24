function handleReset() {
  counts = {};
  
  if (typeof saveCounts === 'function') {
    saveCounts(counts);
  }
  if (typeof render === 'function') {
    render();
  }
  
  if (typeof showToast === 'function') {
    showToast('Count sheet reset');
  }
}