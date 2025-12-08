import { useEffect } from 'react';

export const PerformanceOptimizations = () => {
  useEffect(() => {
    // Lazy load images
    const lazyImages = document.querySelectorAll('.lazy-image');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.classList.remove('lazy-image');
          }
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    lazyImages.forEach(img => imageObserver.observe(img));

    return () => {
      lazyImages.forEach(img => imageObserver.unobserve(img));
    };
  }, []);

  return null;
};