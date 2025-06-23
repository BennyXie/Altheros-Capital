import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 *
 * Automatically scrolls to top of page when navigating to a new route.
 * Essential for proper multi-page navigation experience.
 *
 * @component
 * @example
 * <Router>
 *   <ScrollToTop />
 *   <Routes>...</Routes>
 * </Router>
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
