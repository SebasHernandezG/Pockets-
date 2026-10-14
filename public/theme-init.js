// Run before the app paints; served locally so strict CSP needs no inline script.
try {
  const theme = localStorage.getItem('pockets.theme');
  document.documentElement.dataset.theme = theme === 'light' || theme === 'dark' ? theme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch {
  document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
