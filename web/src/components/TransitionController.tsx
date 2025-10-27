/**
 * TransitionController
 * Manages elegant view transitions between pages with direction awareness
 *
 * Features:
 * - Detects forward/backward navigation
 * - Applies directional CSS classes for slide animations
 * - Respects prefers-reduced-motion
 * - Handles all transition timing automatically
 *
 * Usage: Add to your Layout.astro in <body>
 * <TransitionController client:load />
 */

export function TransitionController() {
  if (typeof window === 'undefined') return null;

  // Track navigation direction
  let navigationDirection: 'forward' | 'back' | 'none' = 'none';

  // Listen for Astro view transitions
  document.addEventListener('astro:before-preparation', (event) => {
    const currentPath = window.location.pathname;
    const toPath = event.to.pathname;

    // Simple heuristic: if going to root or parent path, it's back navigation
    if (toPath.length < currentPath.length && currentPath.startsWith(toPath)) {
      navigationDirection = 'back';
    } else if (toPath.length > currentPath.length) {
      navigationDirection = 'forward';
    } else {
      navigationDirection = 'none';
    }

    // Apply direction class to document
    if (navigationDirection !== 'none') {
      document.documentElement.setAttribute('data-direction', navigationDirection);
    }
  });

  // Clean up after transition
  document.addEventListener('astro:after-swap', () => {
    // Remove direction attribute after transition completes
    setTimeout(() => {
      document.documentElement.removeAttribute('data-direction');
    }, 500);
  });

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) {
    document.documentElement.style.setProperty(
      '--view-transition-duration',
      '0.01ms'
    );
  }

  return null;
}

export default TransitionController;
