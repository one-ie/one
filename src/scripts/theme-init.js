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

document.addEventListener('DOMContentLoaded', () => {
  // Log current theme
  console.log('Current theme:', document.documentElement.getAttribute('data-theme'));
  
  // Add theme description to console
  const themeDescriptions = {
    'light': 'Light theme - Clean, bright interface',
    'dark': 'Dark theme - Sleek, minimal dark interface with subtle borders',
    'high-contrast': 'Slate high contrast theme - Sophisticated slate color palette with improved accessibility'
  };
  
  const currentTheme = document.documentElement.getAttribute('data-theme');
  console.log(themeDescriptions[currentTheme] || 'Unknown theme');
  
  // Initialize any theme-dependent components
  document.dispatchEvent(new CustomEvent('theme-initialized', { 
    detail: { theme: currentTheme }
  }));
}); 