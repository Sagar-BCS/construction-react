import { useState } from 'react';

/**
 * HookInfoCard
 * A reusable component to display which advanced hooks are being used on the page.
 */
const HookInfoCard = ({ title = "Advanced Hooks in Action", hooks }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card border-info mb-4 shadow-sm hook-info-card">
      <div 
        className="card-header bg-info bg-opacity-10 text-info-emphasis d-flex justify-content-between align-items-center border-info"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
        onMouseEnter={(e) => e.currentTarget.classList.add('bg-opacity-25')}
        onMouseLeave={(e) => e.currentTarget.classList.remove('bg-opacity-25')}
      >
        <div className="fw-bold d-flex align-items-center">
          <span className="material-icons me-2 text-info">lightbulb</span>
          {title}
        </div>
        <div className="d-flex align-items-center text-muted small">
          <span className="me-2">{isOpen ? 'Hide' : 'Click to learn'}</span>
          <span className="material-icons">{isOpen ? 'expand_less' : 'expand_more'}</span>
        </div>
      </div>
      {isOpen && (
        <div className="card-body bg-light rounded-bottom">
          <ul className="mb-0 list-unstyled">
            {hooks.map((hook, idx) => (
              <li key={idx} className="mb-3 last-child-mb-0">
                <div className="d-flex">
                  <div className="me-3 mt-1">
                    <span className="badge bg-info text-dark rounded-pill">
                      {hook.name}
                    </span>
                  </div>
                  <div>
                    <p className="mb-0 text-secondary">{hook.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HookInfoCard;
