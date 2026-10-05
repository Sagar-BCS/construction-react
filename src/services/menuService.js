import api from './api';

/**
 * Menu Service
 * -------------
 * Fetches role-based menu items from the backend.
 * Endpoint: GET api/Menu
 */

/**
 * Get menu items for the logged-in user's role
 * @returns {Promise<Array<{ id, title, route, icon, roles, isActive }>>}
 */
export const getMenuItems = async () => {
  const response = await api.get('Menu');
  return response.data;
};
