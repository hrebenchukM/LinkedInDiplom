import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getNavDirection,
  getPublicNavDirection,
  getPublicTransitionKey,
  getTransitionKey,
} from './pageTransitionUtils.js';
import { PAGE_TRANSITION_MS } from './pageTransitionTimings.js';

export function usePageTransition({ publicRoutes = false } = {}) {
  const location = useLocation();
  const resolveKey = publicRoutes ? getPublicTransitionKey : getTransitionKey;

  const transitionKey = resolveKey(location.pathname);
  const prevKeyRef = useRef(transitionKey);
  const isFirstPaintRef = useRef(true);
  const hasMountedRef = useRef(false);

  const [direction, setDirection] = useState('neutral');

  useLayoutEffect(() => {
    document.documentElement.dataset.route = transitionKey;

    if (isFirstPaintRef.current) {
      isFirstPaintRef.current = false;
      prevKeyRef.current = transitionKey;
      return;
    }

    const prev = prevKeyRef.current;
    if (prev === transitionKey) return;

    setDirection(
      publicRoutes
        ? getPublicNavDirection(prev, transitionKey)
        : getNavDirection(prev, transitionKey),
    );

    prevKeyRef.current = transitionKey;
  }, [transitionKey, publicRoutes]);

  useEffect(() => {
    document.documentElement.dataset.pageDir = direction;
    document.documentElement.dataset.route = transitionKey;
  }, [transitionKey, direction]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, Math.round(PAGE_TRANSITION_MS * 0.85));

    return () => window.clearTimeout(timer);
  }, [transitionKey]);

  return { transitionKey, direction, location };
}
