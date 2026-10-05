import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getMenuItems } from '../services/menuService';

/**
 * Sidebar Component
 * ------------------
 * Hooks used: useState, useEffect, useRef, useLayoutEffect, useLocation, useNavigate
 *
 * Fetches menu items from the API (role-based) and renders a collapsible sidebar.
 * Highlights the active route using useLocation.
 *
 * HOOK LEARNING NOTES:
 *
 * useLocation() — returns the current URL location object { pathname, search, hash }
 *   Used here to highlight the active menu item by comparing route with pathname.
 *
 * useLayoutEffect() — same as useEffect but fires SYNCHRONOUSLY after DOM mutations
 *   and BEFORE the browser paints the screen.
 *   Use case: measuring DOM elements (sidebar width) to prevent visual flicker.
 *   Rule: Use useEffect for most things. Only use useLayoutEffect when you need
 *   to read/measure DOM before the user sees anything.
 *
 * useRef() — creates a mutable reference that persists across renders
 *   Unlike useState, changing a ref does NOT cause a re-render.
 *   Used here to reference the sidebar DOM element for width measurement.
 */
const Sidebar = ({ isOpen, onClose }) => {
  // useState — stores menu items fetched from API
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // useRef — reference to the sidebar DOM element (for measuring width)
  const sidebarRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);

  // React Router hooks
  const location = useLocation(); // Current URL — updates on every navigation
  const navigate = useNavigate(); // Programmatic navigation function

  // ─── useEffect: Fetch menu items on mount ──────────────────────
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        // Fallback menu if API is not available
        setMenuItems([
          { id: 1, title: 'Home', route: '/home', icon: 'home', isActive: true },
          { id: 2, title: 'Expenses', route: '/expenses', icon: 'payments', isActive: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();

    // Cleanup: this runs when the component unmounts
    // No cleanup needed here, but showing the pattern
    return () => {
      // e.g., cancel API request, clear timers, etc.
    };
  }, []); // Empty dependency array = run only once on mount

  // ─── useLayoutEffect: Measure sidebar width BEFORE paint ───────
  // This prevents a "flash" where the content shifts after measuring
  useLayoutEffect(() => {
    if (sidebarRef.current) {
      const width = sidebarRef.current.getBoundingClientRect().width;
      setSidebarWidth(width);
    }
  }, [isOpen]); // Re-measure when sidebar opens/closes

  // Handle menu item click
  const handleNavigation = (route) => {
    navigate(route);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-backdrop d-md-none"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef} // useRef — attach to DOM element
        className={`sidebar bg-dark text-white ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        data-width={sidebarWidth} // Using the measured width (useLayoutEffect demo)
      >
        {/* Sidebar Header */}
        <div className="sidebar-header p-3 border-bottom border-secondary">
          <h6 className="mb-0 d-flex align-items-center">
            <span className="material-icons me-2 text-primary fs-5">grid_view</span>
            {isOpen && <span>Navigation</span>}
          </h6>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav p-2">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-light" role="status">
                <span className="visually-hidden">Loading menu...</span>
              </div>
            </div>
          ) : (
            <ul className="nav flex-column gap-1">
              {menuItems
                .filter((item) => item.isActive)
                .map((item) => {
                  // useLocation — compare current path with menu route
                  const isActive = location.pathname === item.route;

                  // Map bi-* to material icons
                  let iconName = item.icon.replace('bi-', '');
                  // Some specific mappings if they differ
                  if (iconName === 'house-door') iconName = 'home';
                  else if (iconName === 'cash-stack') iconName = 'payments';
                  else if (iconName === 'people') iconName = 'people';
                  else if (iconName === 'gear') iconName = 'settings';

                  return (
                    <li key={item.id} className="nav-item">
                      <button
                        className={`nav-link sidebar-link w-100 text-start d-flex align-items-center gap-2 rounded ${
                          isActive
                            ? 'active bg-primary text-white'
                            : 'text-white-50'
                        }`}
                        onClick={() => handleNavigation(item.route)}
                        title={item.title}
                      >
                        <span className="material-icons fs-5">{iconName}</span>
                        {isOpen && <span>{item.title}</span>}
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer mt-auto p-3 border-top border-secondary">
          <small className="text-white-50">
            {isOpen ? `v1.0.0` : ''}
          </small>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
