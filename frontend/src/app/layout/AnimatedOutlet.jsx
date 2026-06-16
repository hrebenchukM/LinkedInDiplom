import { useLayoutEffect, useRef } from 'react';
import { useOutlet } from 'react-router-dom';
import { usePageTransition } from './usePageTransition.js';
import { PAGE_TRANSITION_MS } from './pageTransitionTimings.js';
import './PageTransition.css';

export default function AnimatedOutlet({ publicRoutes = false, className = '' }) {
  const outlet = useOutlet();
  const { transitionKey, direction } = usePageTransition({ publicRoutes });
  const surfaceRef = useRef(null);
  const firstPaintRef = useRef(true);
  const timerRef = useRef(null);

  useLayoutEffect(() => {
    if (firstPaintRef.current) {
      firstPaintRef.current = false;
      return undefined;
    }

    const surface = surfaceRef.current;
    if (!surface) return undefined;

    document.documentElement.dataset.pageDir = direction;

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    surface.classList.remove('page-route--animate');
    void surface.offsetHeight;
    surface.classList.add('page-route--animate');

    timerRef.current = window.setTimeout(() => {
      surface.classList.remove('page-route--animate');
      timerRef.current = null;
    }, PAGE_TRANSITION_MS);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [transitionKey, direction]);

  const shellClass = [
    'page-route-shell',
    publicRoutes ? 'page-route-shell--public' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      <div
        ref={surfaceRef}
        className={`page-route page-route__view page-route--${direction}`}
        data-route={transitionKey}
      >
        {outlet}
      </div>
    </div>
  );
}
