import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollReveal() {
  const location = useLocation();

  useEffect(() => {
    let observer = null;

    // Small delay to ensure the DOM is settled after route switch
    const timeoutId = setTimeout(() => {
      const els = document.querySelectorAll('.reveal');
      if (!els.length) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              entry.target.dataset.revealed = "true";
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      els.forEach((el) => {
        if (el.dataset.revealed === "true") {
          el.classList.add('is-visible');
        } else {
          observer.observe(el);
        }
      });
    }, 60);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [location.pathname, location.hash]);
}

