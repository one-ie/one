// Theme initialization script
// This script runs immediately to prevent flash of incorrect theme

(function() {
  // Get theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme && ['light', 'dark', 'high-contrast'].includes(savedTheme)) {
    // Apply saved theme
    if (savedTheme !== 'light') {
      document.documentElement.classList.add(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  } else {
    // Default to dark theme to match the image
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
})(); 