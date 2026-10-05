import { useNavigate, useLocation } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

/**
 * Not Implemented Page
 * --------------------
 * Hooks used: useNavigate, useLocation
 * Custom hooks: useDocumentTitle
 *
 * This page is shown as a catch-all for routes inside the authenticated Layout
 * that haven't been implemented yet.
 */
const NotImplemented = () => {
  useDocumentTitle('Coming Soon');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the page name from the path (e.g. "/settings" -> "Settings")
  // Just for a nicer display in the UI
  const pathName = location.pathname.split('/').pop();
  const displayTitle = pathName 
    ? pathName.charAt(0).toUpperCase() + pathName.slice(1) 
    : 'This Feature';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center py-5">
      <div className="bg-light rounded-circle p-4 mb-4 shadow-sm">
        <span className="material-icons text-primary" style={{ fontSize: '4rem' }}>build</span>
      </div>
      
      <h2 className="fw-bold mb-3">{displayTitle} Not Implemented</h2>
      
      <p className="text-muted mb-4 max-w-md mx-auto" style={{ maxWidth: '500px' }}>
        We're still working on the <strong>{displayTitle}</strong> module. 
        This feature is part of our roadmap and will be available in a future update.
      </p>
      
      <button 
        className="btn btn-primary d-flex align-items-center"
        onClick={() => navigate('/home')}
      >
        <span className="material-icons me-2">arrow_back</span>
        Back to Dashboard
      </button>
    </div>
  );
};

export default NotImplemented;
