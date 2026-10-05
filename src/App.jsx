import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Expenses from './pages/Expenses'
import NotImplemented from './pages/NotImplemented'

/**
 * App Component — Route Definitions
 * -----------------------------------
 * Uses React Router v6 for declarative routing.
 *
 * Route structure:
 *   /login          → Login page (public)
 *   /home           → Home dashboard (protected)
 *   /expenses       → Expenses page (protected)
 *   *               → Redirect to /login (catch-all)
 *
 * ProtectedRoute checks authentication before rendering child routes.
 * Layout provides the Navbar + Sidebar wrapper for all authenticated pages.
 */
function App() {
  return (
    <Routes>
      {/* Public route — Login page */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes — require authentication */}
      <Route element={<ProtectedRoute />}>
        {/* Layout route — wraps all authenticated pages with Navbar + Sidebar */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/expenses" element={<Expenses />} />
          
          {/* Catch-all for unimplemented sidebar items */}
          <Route path="*" element={<NotImplemented />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
