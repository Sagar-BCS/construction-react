import { useState, useRef, useId, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/authService';
import useDocumentTitle from '../hooks/useDocumentTitle';
import HookInfoCard from '../components/HookInfoCard';

/**
 * Login Page
 * -----------
 * Hooks used: useState, useRef, useId, useEffect, useNavigate, useContext (via useAuth)
 * Custom hooks: useDocumentTitle
 *
 * HOOK LEARNING NOTES:
 *
 * useRef() — used here to auto-focus the email input on page load.
 *   Unlike getElementById, useRef gives you a direct reference to a DOM element
 *   that persists across renders. Use it when you need to interact with DOM directly.
 *
 * useId() — generates a unique ID for form accessibility.
 *   In React, if you render the same component multiple times, hardcoded IDs
 *   would clash. useId() guarantees unique IDs across all instances.
 *   Essential for connecting <label htmlFor> with <input id>.
 *
 * useNavigate() — React Router hook for programmatic navigation.
 *   Instead of <Link to="/home">, you call navigate('/home') in code.
 *   Use `replace: true` to prevent the user from going "back" to login.
 */
const Login = () => {
  // ─── Custom Hooks ─────────────────────────────────────────────
  useDocumentTitle('Login'); // Sets browser tab title

  // ─── React Router Hooks ───────────────────────────────────────
  const navigate = useNavigate();

  // ─── Context Hook (via useAuth) ───────────────────────────────
  const { login, isAuthenticated } = useAuth();

  // ─── useId — generates unique IDs for form accessibility ──────
  // Each call to useId() returns a unique string like ":r1:" or ":r2:"
  const emailId = useId();
  const passwordId = useId();

  // ─── useState — manages form state ────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── useRef — reference to the email input DOM element ────────
  // This lets us call .focus() on the actual HTML element
  const emailInputRef = useRef(null);

  // ─── useEffect — auto-focus email input on mount ──────────────
  useEffect(() => {
    // .current holds the actual DOM element after render
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []); // Empty deps = run only once after first render

  // ─── useEffect — redirect if already authenticated ────────────
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ─── Form Submit Handler ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    setError('');
    setLoading(true);

    try {
      const result = await loginApi(email, password);

      if (result.success) {
        // Save token via AuthContext (which also decodes user info)
        login(result.token);
        navigate('/home', { replace: true });
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Server error. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hookInfo = [
    { name: 'useRef', description: 'Gives direct access to a DOM element. Used here to automatically focus the email input box as soon as the page loads.' },
    { name: 'useId', description: 'Generates unique string IDs. Used here to connect the <label> with its corresponding <input> for accessibility.' },
    { name: 'useNavigate', description: 'A hook from React Router that allows programmatic navigation. Used here to redirect the user to /home after a successful login.' }
  ];

  return (
    <div className="login-page d-flex align-items-center justify-content-center min-vh-100 bg-dark py-5">
      <div className="container">
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <HookInfoCard hooks={hookInfo} />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            {/* Login Card */}
            <div className="card shadow-lg border-0">
              {/* Card Header */}
              <div className="card-header bg-primary text-white text-center py-4">
                <span className="material-icons fs-1 mb-2 d-block">domain</span>
                <h4 className="mb-1 fw-bold">Construction Manager</h4>
                <p className="mb-0 opacity-75 small">Sign in to your account</p>
              </div>

              {/* Card Body */}
              <div className="card-body p-4">
                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center py-2" role="alert">
                    <span className="material-icons me-2">warning</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-3">
                    {/* htmlFor={emailId} connects label to input — useId ensures uniqueness */}
                    <label htmlFor={emailId} className="form-label fw-semibold d-flex align-items-center">
                      <span className="material-icons me-1 fs-6">email</span>Email
                    </label>
                    <input
                      ref={emailInputRef} // useRef — attaches to this DOM element
                      type="email"
                      className="form-control form-control-lg"
                      id={emailId} // useId — unique ID for this instance
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor={passwordId} className="form-label fw-semibold d-flex align-items-center">
                      <span className="material-icons me-1 fs-6">lock</span>Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg"
                        id={passwordId} // useId — unique ID for this instance
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        className="btn btn-outline-secondary d-flex align-items-center"
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        <span className="material-icons">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mt-2 d-flex align-items-center justify-content-center"
                    disabled={loading || !email || !password}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <span className="material-icons me-2">login</span>
                        Sign In
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Card Footer */}
              <div className="card-footer text-center py-3 bg-light">
                <small className="text-muted d-inline-flex align-items-center">
                  <span className="material-icons me-1 fs-6">security</span>
                  Secured with JWT Authentication
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
