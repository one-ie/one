import { useEffect } from 'react';

export function SmoothScroll() {
  useEffect(() => {
    const handleSmoothScroll = (e: Event) => {
      if (!(e instanceof MouseEvent)) return;
      const target = e.target;
      if (!(target instanceof HTMLAnchorElement) || !target.hash) return;

      e.preventDefault();
      const targetElement = document.querySelector(target.hash);
      if (!targetElement) return;

      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 1500; // 1.5 seconds
      let start: number | null = null;

      function animation(currentTime: number): void {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smoother animation
        const ease = (t: number): number => 
          t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      }
      
      requestAnimationFrame(animation);
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleSmoothScroll);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, []);

  return null;
} 