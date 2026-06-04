import { useEffect, useRef, useState } from "react";
import { useLocation, useRoutes } from "react-router-dom";
import { layoutChildRoutes } from "./layoutRoutes";

const ROUTE_ORDER = ["/home", "/network", "/vacancies", "/chat", "/profile"];
const EXIT_MS = 300;
const ENTER_MS = 680;

function getRouteDirection(fromPath, toPath) {
  const from = ROUTE_ORDER.indexOf(fromPath);
  const to = ROUTE_ORDER.indexOf(toPath);
  if (from < 0 || to < 0 || from === to) return "forward";
  return to > from ? "forward" : "back";
}

export function PageTransitionOutlet({ onTransitionStart, onTransitionEnd }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const rendered = useRoutes(layoutChildRoutes, displayLocation);
  const prevPath = useRef(location.pathname);
  const isFirst = useRef(true);
  const endTimerRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const fromPath = prevPath.current;
    const toPath = location.pathname;

    const clearEndTimer = () => {
      if (endTimerRef.current) {
        window.clearTimeout(endTimerRef.current);
        endTimerRef.current = null;
      }
    };

    if (isFirst.current) {
      isFirst.current = false;
      prevPath.current = toPath;
      root.dataset.pageDir = "forward";
      root.classList.add("page-route-enter");
      endTimerRef.current = window.setTimeout(() => {
        root.classList.remove("page-route-enter");
        onTransitionEnd?.();
      }, ENTER_MS);
      return clearEndTimer;
    }

    if (fromPath === toPath) return clearEndTimer;

    root.dataset.pageDir = getRouteDirection(fromPath, toPath);
    prevPath.current = toPath;
    onTransitionStart?.();

    root.classList.remove("page-route-enter");
    root.classList.add("page-route-exit");

    const swapTimer = window.setTimeout(() => {
      window.scrollTo(0, 0);
      setDisplayLocation(location);
      root.classList.remove("page-route-exit");
      root.classList.add("page-route-enter");

      endTimerRef.current = window.setTimeout(() => {
        root.classList.remove("page-route-enter");
        onTransitionEnd?.();
      }, ENTER_MS);
    }, EXIT_MS);

    return () => {
      window.clearTimeout(swapTimer);
      clearEndTimer();
    };
  }, [location, onTransitionStart, onTransitionEnd]);

  return <div className="page-route__view">{rendered}</div>;
}
