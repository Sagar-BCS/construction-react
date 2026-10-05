import api from './api';

/**
 * Auth Service
 * -------------
 * Handles login API call.
 * Endpoint: POST api/Login/email
 */

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, message: string, token?: string }>}
 */
export const login = async (email, password) => {
  const response = await api.post('Login/email', { email, password });
  return response.data;
};

/**
 * Check if a mobile number exists
 * @param {string} mobileNumber
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const checkNumber = async (mobileNumber) => {
  const response = await api.get(`Login/Check-Number?mobileNumber=${mobileNumber}`);
  return response.data;
};
