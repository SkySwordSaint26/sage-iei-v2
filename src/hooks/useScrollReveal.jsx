import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let observer = null;
    let mutationObserver = null;

    const revealElement = (el) => {
      el.classList.add('is-visible');
      el.dataset.revealed = 'true';
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      const revealAll = () => {
        document.querySelectorAll('.reveal').forEach(revealElement);
      };
      revealAll();
      mutationObserver = new MutationObserver(revealAll);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
      return () => mutationObserver.disconnect();
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px 0px 50px 0px',
        threshold: 0
      }
    );

    const observeUnrevealed = () => {
      const els = document.querySelectorAll('.reveal');
      const winHeight = window.innerHeight;
      els.forEach((el) => {
        if (el.dataset.revealed === 'true' || el.classList.contains('is-visible')) {
          return;
        }

        const rect = el.getBoundingClientRect();
        // If element is in viewport (or within 100px of view), reveal immediately
        if (rect.top <= winHeight + 100 && rect.bottom >= -50) {
          revealElement(el);
        } else {
          observer.observe(el);
        }
      });
    };

    // Initial check
    observeUnrevealed();

    // Check after microtask and brief settle times
    const t1 = setTimeout(observeUnrevealed, 50);
    const t2 = setTimeout(observeUnrevealed, 200);
    const t3 = setTimeout(observeUnrevealed, 500);

    // Scroll & resize event listener backup
    let scrollScheduled = false;
    const handleScrollOrResize = () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(() => {
          observeUnrevealed();
          scrollScheduled = false;
        });
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    // Watch for DOM mutations (lazy-loaded pages or dynamic rendering)
    mutationObserver = new MutationObserver(() => {
      observeUnrevealed();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
    };
  }, [location.pathname, location.hash]);
}

