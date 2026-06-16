import AnimatedOutlet from './AnimatedOutlet.jsx';

/** @deprecated Use PublicTransitionLayout route wrapper instead. */
export default function PageTransitionShell({ children }) {
  return children ?? <AnimatedOutlet publicRoutes />;
}
