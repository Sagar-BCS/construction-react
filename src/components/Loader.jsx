/**
 * Loader Component
 * -----------------
 * A simple Bootstrap spinner used as a loading indicator.
 * Used by pages while API data is being fetched.
 */
const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default Loader;
