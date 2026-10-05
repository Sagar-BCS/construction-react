import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * Layout Component
 * -----------------
 * Hooks used: useState
 *
 * This is the main layout wrapper for authenticated pages.
 * It renders: Navbar (top) + Sidebar (left) + Page Content (center via Outlet)
 *
 * React Router's <Outlet /> renders whatever child route matches.
 * Example: if URL is /home, <Outlet /> renders <Home />
 *          if URL is /expenses, <Outlet /> renders <Expenses />
 */
const Layout = () => {
  // useState — controls sidebar open/closed state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout-wrapper d-flex flex-column vh-100">
      {/* Top Navbar — full width */}
      <Navbar onToggleSidebar={toggleSidebar} />

      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area */}
        <main className={`main-content flex-grow-1 overflow-auto p-4 bg-light ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          {/* Outlet renders the matched child route component */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
