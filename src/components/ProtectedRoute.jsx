import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * -------------------------
 * Hooks used: useContext (via useAuth)
 *
 * Acts as an authentication guard for routes.
 * If the user is NOT authenticated, redirects to /login.
 * If authenticated, renders the child routes via <Outlet />.
 *
 * HOW IT WORKS with React Router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/home" element={<Home />} />
 *     <Route path="/expenses" element={<Expenses />} />
 *   </Route>
 *
 * ProtectedRoute wraps all nested routes.
 * <Outlet /> renders the matched child route.
 */
const ProtectedRoute = () => {
  // useContext (via custom useAuth hook) — reads auth state from context
  const { isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  // `replace` prevents the user from going "back" to the protected page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child route
  // <Outlet /> is a React Router concept — it renders the matched nested route
  return <Outlet />;
};

export default ProtectedRoute;
