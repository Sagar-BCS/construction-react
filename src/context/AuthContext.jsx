import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";
import useLocalStorage from "../hooks/useLocalStorage";

/**
 * AuthContext
 * -----------
 * Hooks used: createContext, useContext, useState, useCallback, useMemo
 * Custom hook used: useLocalStorage
 *
 * Provides global authentication state across the entire app.
 * Any component can access user info, token, and login/logout functions.
 *
 * HOW CONTEXT WORKS:
 * 1. createContext() — creates a "container" for shared data
 * 2. AuthProvider wraps the app — fills the container with data
 * 3. useContext(AuthContext) — any child component can read the data
 */

// Step 1: Create the context object
const AuthContext = createContext(null);

/**
 * Custom hook to consume AuthContext
 * Instead of: const auth = useContext(AuthContext)
 * You write:  const { user, login, logout } = useAuth()
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Helper: Decode JWT token to extract user info
 * JWT claims from our backend:
 *   sub → userId
 *   email → user email
 *   http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name → FullName
 *   http://schemas.microsoft.com/ws/2008/06/identity/claims/role → Role
 */
const decodeToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ] || decoded.unique_name || decoded.name,
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] || decoded.role,
    };
  } catch {
    return null;
  }
};

/**
 * AuthProvider Component
 * Wraps the app and provides auth state to all children
 */
export const AuthProvider = ({ children }) => {
  // useLocalStorage — persists token across page refreshes
  const [token, setToken] = useLocalStorage("token", null);

  // useState — stores decoded user info (derived from token)
  const [user, setUser] = useState(() => {
    // Lazy initializer: decode token on first render if it exists
    return token ? decodeToken(token) : null;
  });

  // useCallback — memoizes the login function
  // Without useCallback, a new function is created on every render,
  // which would cause unnecessary re-renders in child components
  const login = useCallback(
    (newToken) => {
      setToken(newToken);
      const userData = decodeToken(newToken);
      setUser(userData);
    },
    [setToken],
  );

  // useCallback — memoizes the logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [setToken]);

  // useMemo — memoizes the context value object
  // Without useMemo, a new object is created on every render,
  // causing ALL consumers of this context to re-render even if
  // the actual values haven't changed
  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      logout,
    }),
    [user, token, login, logout],
  );

  // Step 2: Provide the context value to all children
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
