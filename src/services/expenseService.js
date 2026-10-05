import api from './api';

/**
 * Expense Service
 * ----------------
 * Handles all Expense API calls.
 * All endpoints require JWT authentication.
 */

/**
 * Get expenses visible to the logged-in user (role-filtered)
 * Endpoint: GET api/Expense/view
 * @returns {Promise<Array<ExpenseViewDto>>}
 */
export const getExpenses = async () => {
  const response = await api.get('Expense/view');
  return response.data;
};

/**
 * Get sites the user can create expenses for
 * Endpoint: GET api/Expense/assignable-sites
 * @returns {Promise<Array<{ siteID, siteName }>>}
 */
export const getAssignableSites = async () => {
  const response = await api.get('Expense/assignable-sites');
  return response.data;
};

/**
 * Create a new expense (multipart/form-data)
 * Endpoint: POST api/Expense/create
 * @param {FormData} formData - Contains: SiteID?, ExpenseName, Details, PaymentMethod, file?, paymentProofFile?
 * @returns {Promise<{ success, message }>}
 */
export const createExpense = async (formData) => {
  const response = await api.post('Expense/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
