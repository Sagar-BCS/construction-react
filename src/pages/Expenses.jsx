import {
  useState,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useId,
  useDeferredValue,
  useEffect,
} from "react";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { createExpense, getAssignableSites } from "../services/expenseService";
import { environment } from "../config/environment";
import Loader from "../components/Loader";
import HookInfoCard from "../components/HookInfoCard";

/**
 * Expenses Page
 * --------------
 * Hooks used: useState, useReducer, useCallback, useMemo, useRef, useId,
 *             useDeferredValue, useEffect, useContext (via useAuth)
 * Custom hooks: useFetch, useDebounce, useDocumentTitle
 *
 * This is the HOOK SHOWCASE page — every major React hook is used here.
 *
 * HOOK LEARNING NOTES:
 *
 * useReducer() — alternative to useState for COMPLEX state logic.
 *   Instead of multiple useState calls, you define a "reducer" function
 *   that handles all state transitions in one place.
 *   Pattern: const [state, dispatch] = useReducer(reducer, initialState);
 *   dispatch({ type: 'ACTION_NAME', payload: data })
 *   Think of it like a mini Redux inside your component.
 *
 * useMemo() — memoizes a COMPUTED VALUE.
 *   The value is only recalculated when its dependencies change.
 *   Without useMemo, expensive computations run on every render.
 *   Rule: Use for expensive calculations or complex filtering.
 *   Don't overuse — React is fast enough for most things.
 *
 * useDeferredValue() — defers updating a value during urgent renders.
 *   When the user types in a search box, React prioritizes showing the
 *   keystroke immediately and defers the expensive filtering work.
 *   This prevents the UI from feeling laggy during rapid typing.
 */

// ─── useReducer: Expense Form Reducer ───────────────────────────
// Defines all possible state transitions for the expense creation form.
// This is better than multiple useState when state fields are related.

// Initial state for the form
const initialFormState = {
  expenseName: "",
  details: "",
  paymentMethod: "Cash",
  siteID: "",
  file: null,
  paymentProofFile: null,
  submitting: false,
  submitError: "",
  submitSuccess: "",
};

/**
 * Reducer function — handles all form state changes
 * @param {object} state - Current state
 * @param {object} action - { type, payload }
 * @returns {object} New state
 */
const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      // Update a single form field
      return {
        ...state,
        [action.field]: action.value,
        submitError: "",
        submitSuccess: "",
      };
    case "SET_FILE":
      return { ...state, [action.field]: action.file };
    case "SUBMIT_START":
      return { ...state, submitting: true, submitError: "", submitSuccess: "" };
    case "SUBMIT_SUCCESS":
      return { ...initialFormState, submitSuccess: action.message };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, submitError: action.message };
    case "RESET":
      return { ...initialFormState };
    default:
      // Good practice: throw on unknown actions to catch bugs
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

const Expenses = () => {
  // ─── Custom Hooks ─────────────────────────────────────────────
  useDocumentTitle("Expenses");

  // ─── Context ──────────────────────────────────────────────────
  const { user } = useAuth();

  // ─── useId — unique IDs for form fields (accessibility) ───────
  const expenseNameId = useId();
  const detailsId = useId();
  const paymentMethodId = useId();
  const siteSelectId = useId();
  const fileInputId = useId();
  const proofInputId = useId();
  const searchInputId = useId();

  // ─── useState — search input and create form toggle ───────────
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // ─── useDebounce — debounce search input ──────────────────────
  // Only updates 300ms after the user stops typing
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ─── useDeferredValue — defers the debounced search value ─────
  // React will prioritize rendering the search input (urgent)
  // and defer the filtered list update (non-urgent)
  const deferredSearch = useDeferredValue(debouncedSearch);

  // ─── useReducer — complex form state management ───────────────
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // ─── useRef — reference to file input elements ────────────────
  // Used to programmatically clear file inputs after form submission
  const fileInputRef = useRef(null);
  const proofInputRef = useRef(null);

  // ─── useFetch — fetch expenses list ───────────────────────────
  const {
    data: expenses,
    loading: expensesLoading,
    error: expensesError,
    refetch: refetchExpenses,
  } = useFetch("Expense/view");

  // ─── useState + useEffect — fetch assignable sites ────────────
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);

  useEffect(() => {
    const fetchSites = async () => {
      setSitesLoading(true);
      try {
        const data = await getAssignableSites();
        setSites(data);
        // Auto-select if only one site
        if (data.length === 1) {
          dispatch({
            type: "SET_FIELD",
            field: "siteID",
            value: data[0].siteID,
          });
        }
      } catch (error) {
        console.error("Failed to fetch assignable sites:", error);
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

  // ─── useMemo — filter expenses based on deferred search ───────
  // This computation only re-runs when expenses or deferredSearch changes.
  // Without useMemo, it would run on EVERY render (even when unrelated
  // state like formState changes).
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    if (!deferredSearch) return expenses;

    const searchLower = deferredSearch.toLowerCase();
    return expenses.filter(
      (expense) =>
        expense.expenseName?.toLowerCase().includes(searchLower) ||
        expense.details?.toLowerCase().includes(searchLower) ||
        expense.siteName?.toLowerCase().includes(searchLower) ||
        expense.createdByUserName?.toLowerCase().includes(searchLower) ||
        expense.paymentMethod?.toLowerCase().includes(searchLower),
    );
  }, [expenses, deferredSearch]);

  // ─── useCallback — memoized form submit handler ───────────────
  // Without useCallback, this function is re-created on every render.
  // Since it uses dispatch and refetchExpenses (stable references),
  // it doesn't need to change.
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      dispatch({ type: "SUBMIT_START" });

      try {
        // Build FormData for multipart upload
        const formData = new FormData();
        if (formState.siteID) formData.append("SiteID", formState.siteID);
        formData.append("ExpenseName", formState.expenseName);
        formData.append("Details", formState.details);
        formData.append("PaymentMethod", formState.paymentMethod);
        if (formState.file) formData.append("file", formState.file);
        if (formState.paymentProofFile)
          formData.append("paymentProofFile", formState.paymentProofFile);

        const result = await createExpense(formData);
        dispatch({
          type: "SUBMIT_SUCCESS",
          message: result.message || "Expense created!",
        });

        // Clear file inputs using useRef (DOM manipulation)
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (proofInputRef.current) proofInputRef.current.value = "";

        // Refetch expenses list to show the new expense
        refetchExpenses();
      } catch (err) {
        dispatch({
          type: "SUBMIT_ERROR",
          message:
            err.response?.data?.message ||
            err.response?.data ||
            "Failed to create expense.",
        });
      }
    },
    [formState, refetchExpenses],
  );

  // ─── useCallback — memoized toggle handler ────────────────────
  const toggleCreateForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
    dispatch({ type: "RESET" });
  }, []);

  const hookInfo = [
    {
      name: "useReducer",
      description:
        "Replaces multiple useState calls with a single state object and a dispatch function. Used here to manage the complex state of the New Expense form.",
    },
    {
      name: "useMemo",
      description:
        "Caches an expensive computation so it doesn't re-run on every render. Used here to efficiently filter the expenses list based on the search term.",
    },
    {
      name: "useDeferredValue",
      description:
        "Allows React to delay updating a value during urgent renders. Used here to keep the search bar feeling fast and snappy while the filtering happens in the background.",
    },
    {
      name: "useRef",
      description:
        "Creates a mutable reference to a DOM element. Used here to manually clear the file inputs after a successful form submission.",
    },
    {
      name: "useId",
      description:
        "Generates unique IDs for form accessibility, ensuring labels and inputs are correctly linked without hardcoding IDs.",
    },
    {
      name: "useCallback",
      description:
        "Memoizes function definitions to prevent unnecessary re-renders of child components. Used here for the form submission and toggle handlers.",
    },
    {
      name: "useFetch (Custom)",
      description:
        "A custom hook wrapping fetch/axios to automatically handle loading, error, and data states for API calls.",
    },
    {
      name: "useDebounce (Custom)",
      description:
        "A custom hook that delays updating a value until a specified time has passed since the last change.",
    },
  ];

  return (
    <div className="expenses-page">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <span className="material-icons me-2 text-primary fs-2">
              payments
            </span>
            Expenses
          </h2>
          <p className="text-muted mb-0">
            {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={refetchExpenses}
          >
            <span className="material-icons me-1 fs-6">refresh</span>
            Refresh
          </button>
          {(user?.role === "Employee" || user?.role === "Supervisor") && (
            <button
              className={`btn ${showCreateForm ? "btn-secondary" : "btn-primary"} d-flex align-items-center`}
              onClick={toggleCreateForm}
            >
              <span className="material-icons me-1 fs-6">
                {showCreateForm ? "close" : "add"}
              </span>
              {showCreateForm ? "Cancel" : "New Expense"}
            </button>
          )}
        </div>
      </div>

      <HookInfoCard title="Hooks Showcase: Expenses Page" hooks={hookInfo} />

      {/* ─── Create Expense Form (useReducer demo) ────────────── */}
      {showCreateForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-primary text-white d-flex align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <span className="material-icons me-2">add_circle</span>
              Create New Expense
            </h5>
          </div>
          <div className="card-body">
            {/* Success Message */}
            {formState.submitSuccess && (
              <div className="alert alert-success d-flex align-items-center">
                <span className="material-icons me-2 text-success">
                  check_circle
                </span>
                {formState.submitSuccess}
              </div>
            )}

            {/* Error Message */}
            {formState.submitError && (
              <div className="alert alert-danger d-flex align-items-center">
                <span className="material-icons me-2 text-danger">warning</span>
                {formState.submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Site Selection (shown if user has multiple sites) */}
                {sites.length > 1 && (
                  <div className="col-md-6">
                    <label
                      htmlFor={siteSelectId}
                      className="form-label fw-semibold"
                    >
                      Site
                    </label>
                    <select
                      id={siteSelectId}
                      className="form-select"
                      value={formState.siteID}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "siteID",
                          value: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select a site...</option>
                      {sites.map((site) => (
                        <option key={site.siteID} value={site.siteID}>
                          {site.siteName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Expense Name */}
                <div className="col-md-6">
                  <label
                    htmlFor={expenseNameId}
                    className="form-label fw-semibold"
                  >
                    Expense Name
                  </label>
                  <input
                    type="text"
                    id={expenseNameId}
                    className="form-control"
                    placeholder="e.g., Cement Purchase"
                    value={formState.expenseName}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "expenseName",
                        value: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Details */}
                <div className="col-12">
                  <label htmlFor={detailsId} className="form-label fw-semibold">
                    Details
                  </label>
                  <textarea
                    id={detailsId}
                    className="form-control"
                    rows="2"
                    placeholder="Describe the expense..."
                    value={formState.details}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "details",
                        value: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>

                {/* Payment Method */}
                <div className="col-md-6">
                  <label
                    htmlFor={paymentMethodId}
                    className="form-label fw-semibold"
                  >
                    Payment Method
                  </label>
                  <select
                    id={paymentMethodId}
                    className="form-select"
                    value={formState.paymentMethod}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FIELD",
                        field: "paymentMethod",
                        value: e.target.value,
                      })
                    }
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                {/* Bill File Upload */}
                <div className="col-md-6">
                  <label
                    htmlFor={fileInputId}
                    className="form-label fw-semibold"
                  >
                    Bill Image (optional)
                  </label>
                  <input
                    ref={fileInputRef} // useRef — for clearing after submit
                    type="file"
                    id={fileInputId}
                    className="form-control"
                    accept="image/*"
                    onChange={(e) =>
                      dispatch({
                        type: "SET_FILE",
                        field: "file",
                        file: e.target.files[0] || null,
                      })
                    }
                  />
                </div>

                {/* UPI Payment Proof (shown only for UPI) */}
                {formState.paymentMethod === "UPI" && (
                  <div className="col-md-6">
                    <label
                      htmlFor={proofInputId}
                      className="form-label fw-semibold"
                    >
                      Payment Proof Screenshot
                      <span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      ref={proofInputRef} // useRef — for clearing after submit
                      type="file"
                      id={proofInputId}
                      className="form-control"
                      accept="image/*"
                      onChange={(e) =>
                        dispatch({
                          type: "SET_FILE",
                          field: "paymentProofFile",
                          file: e.target.files[0] || null,
                        })
                      }
                      required
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center justify-content-center"
                    disabled={formState.submitting}
                  >
                    {formState.submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <span className="material-icons me-1 fs-6">check</span>
                        Create Expense
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Search Bar (useDebounce + useDeferredValue demo) ──── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-2">
          <div className="input-group align-items-center">
            <span className="input-group-text bg-transparent border-end-0 d-flex align-items-center justify-content-center">
              <span className="material-icons text-muted">search</span>
            </span>
            <input
              type="text"
              id={searchInputId}
              className="form-control border-start-0 ps-0"
              placeholder="Search expenses by name, details, site, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                onClick={() => setSearchTerm("")}
              >
                <span className="material-icons fs-6">close</span>
              </button>
            )}
          </div>
          {/* Show visual indicator when deferred value hasn't caught up */}
          {deferredSearch !== searchTerm && (
            <small className="text-muted mt-1 d-block">
              <span className="spinner-border spinner-border-sm me-1"></span>
              Filtering...
            </small>
          )}
        </div>
      </div>

      {/* ─── Expenses Table (useMemo demo) ────────────────────── */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {expensesLoading ? (
            <Loader message="Loading expenses..." />
          ) : expensesError ? (
            <div className="alert alert-warning m-3 d-flex align-items-center">
              <span className="material-icons me-2">warning</span>
              {expensesError}
            </div>
          ) : filteredExpenses.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Expense</th>
                    <th>Details</th>
                    <th>Site</th>
                    <th>Payment</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th>Bill</th>
                  </tr>
                </thead>
                <tbody>
                  {/* filteredExpenses is computed via useMemo — only recalculates when needed */}
                  {filteredExpenses.map((expense, index) => (
                    <tr key={expense.expenseID}>
                      <td className="text-muted">{index + 1}</td>
                      <td className="fw-semibold">{expense.expenseName}</td>
                      <td>
                        <span className="text-muted small">
                          {expense.details}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {expense.siteName}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            expense.paymentMethod === "UPI"
                              ? "bg-info bg-opacity-10 text-info"
                              : "bg-success bg-opacity-10 text-success"
                          }`}
                        >
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <div>
                          <small className="fw-semibold">
                            {expense.createdByUserName}
                          </small>
                          <br />
                          <small className="text-muted">
                            {expense.createdByUserRole}
                          </small>
                        </div>
                      </td>
                      <td>
                        <small>
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        {expense.filePath && (
                          <a
                            href={`${environment.noApiUrl}${expense.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center"
                            title="View Bill"
                          >
                            <span className="material-icons fs-6">image</span>
                          </a>
                        )}
                        {expense.paymentProofPath && (
                          <a
                            href={`${environment.noApiUrl}${expense.paymentProofPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-info btn-sm ms-1 d-inline-flex align-items-center justify-content-center"
                            title="View Payment Proof"
                          >
                            <span className="material-icons fs-6">receipt</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <span
                className="material-icons text-muted mb-2"
                style={{ fontSize: "3rem" }}
              >
                inbox
              </span>
              <p className="text-muted mb-0">
                {searchTerm
                  ? "No expenses match your search."
                  : "No expenses found."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
