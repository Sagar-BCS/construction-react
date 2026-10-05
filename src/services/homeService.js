import api from './api';

/**
 * Home Service
 * -------------
 * Handles all Home/Dashboard API calls.
 * All endpoints require JWT authentication.
 */

/**
 * Get site info for the logged-in user
 * Endpoint: GET api/Home/siteinfo
 * @returns {Promise<{ name, location, supervisor, todayWork, googleMapsUrl }>}
 */
export const getSiteInfo = async () => {
  const response = await api.get('Home/siteinfo');
  return response.data;
};

/**
 * Get 3-day work schedule (yesterday, today, tomorrow)
 * Endpoint: GET api/Home/schedule
 * @returns {Promise<{ yesterday, today, tomorrow }>}
 */
export const getWorkSchedule = async () => {
  const response = await api.get('Home/schedule');
  return response.data;
};

/**
 * Get last 3 attendance records
 * Endpoint: GET api/Home/attendance
 * @returns {Promise<Array<{ date, entryTime, exitTime }>>}
 */
export const getAttendanceHistory = async () => {
  const response = await api.get('Home/attendance');
  return response.data;
};
