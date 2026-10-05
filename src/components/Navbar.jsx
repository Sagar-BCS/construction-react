import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * -----------------
 * Hooks used: useContext (via useAuth), useNavigate
 *
 * Displays the top navigation bar with:
 * - App title
 * - Sidebar toggle button (calls onToggleSidebar from parent)
 * - User info (name, role badge)
 * - Logout button
 */
const Navbar = ({ onToggleSidebar }) => {
  // useContext — access user info from AuthContext
  const { user, logout } = useAuth();

  // useNavigate — programmatic navigation (React Router hook)
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Map roles to Bootstrap badge colors
  const roleBadgeColor = {
    SuperAdmin: 'danger',
    Admin: 'warning',
    Manager: 'info',
    Supervisor: 'primary',
    Employee: 'success',
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm sticky-top">
      {/* Sidebar toggle button (visible on all screens) */}
      <button
        className="btn btn-outline-light me-3 d-flex align-items-center justify-content-center"
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span className="material-icons fs-5">menu</span>
      </button>

      {/* Brand */}
      <span className="navbar-brand fw-bold d-flex align-items-center">
        <span className="material-icons me-2">domain</span>
        Construction Manager
      </span>

      {/* Spacer */}
      <div className="ms-auto d-flex align-items-center gap-3">
        {/* User info */}
        {user && (
          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-sm-block">
              <div className="text-white fw-semibold small">{user.name}</div>
              <span className={`badge bg-${roleBadgeColor[user.role] || 'secondary'} badge-sm`}>
                {user.role}
              </span>
            </div>
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}>
              <span className="text-white fw-bold small">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          className="btn btn-outline-danger btn-sm d-flex align-items-center"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="material-icons me-1 fs-6">logout</span>
          <span className="d-none d-md-inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
