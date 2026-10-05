import { useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Loader from "../components/Loader";

/**
 * Home Page (Dashboard)
 * ----------------------
 * Hooks used: useEffect, useCallback, useContext (via useAuth)
 * Custom hooks: useFetch, useDocumentTitle
 *
 * HOOK LEARNING NOTES:
 *
 * useCallback() — returns a memoized version of a function.
 *   Without useCallback, a new function is created on EVERY render.
 *   This matters when you pass functions as props to child components —
 *   if the function reference changes, the child re-renders unnecessarily.
 *
 *   Rule: Use useCallback when:
 *   1. Passing a function as a prop to a child component
 *   2. Using a function as a dependency in useEffect
 */
const Home = () => {
  // ─── Custom Hooks ─────────────────────────────────────────────
  useDocumentTitle("Home");

  // ─── Context ──────────────────────────────────────────────────
  const { user } = useAuth();

  // ─── useFetch — fetch site info, schedule, and attendance ─────
  // Each useFetch call manages its own loading, error, and data state
  const {
    data: siteInfo,
    loading: siteLoading,
    error: siteError,
    refetch: refetchSite,
  } = useFetch("Home/siteinfo");

  const {
    data: schedule,
    loading: scheduleLoading,
    error: scheduleError,
  } = useFetch("Home/schedule");

  const {
    data: attendance,
    loading: attendanceLoading,
    error: attendanceError,
  } = useFetch("Home/attendance");

  // ─── useCallback — memoized refresh handler ──────────────────
  // This function reference stays the same across renders
  // unless refetchSite changes (which it won't, since it's from useFetch)
  const handleRefresh = useCallback(() => {
    refetchSite();
  }, [refetchSite]);

  // ─── useEffect — log when data arrives (demo) ────────────────
  useEffect(() => {
    if (siteInfo) {
      console.log("Site info loaded:", siteInfo.name);
      console.log("User loaded:", user);
    }
  }, [siteInfo]); // Only runs when siteInfo changes

  // Loading state
  if (siteLoading && scheduleLoading && attendanceLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <div className="home-page">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center">
            <span className="material-icons me-2 text-primary fs-2">home</span>
            Dashboard
          </h2>
          <p className="text-muted mb-0">
            Welcome back, <strong>{user?.name}</strong>
          </p>
        </div>
        <button
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={handleRefresh} // useCallback — stable reference
        >
          <span className="material-icons me-1 fs-6">refresh</span>
          Refresh
        </button>
      </div>

      {/* ─── Site Info Card ────────────────────────────────────── */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white d-flex align-items-center">
              <span className="material-icons me-2">location_on</span>
              <h5 className="mb-0">Site Information</h5>
            </div>
            <div className="card-body">
              {siteLoading ? (
                <Loader message="Loading site info..." />
              ) : siteError ? (
                <div className="alert alert-warning mb-0 d-flex align-items-center">
                  <span className="material-icons me-2">warning</span>
                  {siteError}
                </div>
              ) : siteInfo ? (
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <span className="material-icons text-primary fs-4">
                          domain
                        </span>
                      </div>
                      <div>
                        <small className="text-muted">Site Name</small>
                        <div className="fw-semibold">{siteInfo.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <span className="material-icons text-success fs-4">
                          pin_drop
                        </span>
                      </div>
                      <div>
                        <small className="text-muted">Location</small>
                        <div className="fw-semibold">{siteInfo.location}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <span className="material-icons text-info fs-4">
                          badge
                        </span>
                      </div>
                      <div>
                        <small className="text-muted">Supervisor</small>
                        <div className="fw-semibold">{siteInfo.supervisor}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3 d-flex align-items-center justify-content-center">
                        <span className="material-icons text-warning fs-4">
                          assignment_turned_in
                        </span>
                      </div>
                      <div>
                        <small className="text-muted">Today's Work</small>
                        <div className="fw-semibold">
                          {siteInfo.todayWork || "Not scheduled"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {siteInfo.googleMapsUrl && (
                    <div className="col-12">
                      <a
                        href={siteInfo.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center"
                      >
                        <span className="material-icons me-1 fs-6">map</span>
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No site information available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Schedule & Attendance Row ─────────────────────────── */}
      <div className="row g-4">
        {/* Work Schedule Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success text-white d-flex align-items-center">
              <span className="material-icons me-2">calendar_today</span>
              <h5 className="mb-0">Work Schedule</h5>
            </div>
            <div className="card-body">
              {scheduleLoading ? (
                <Loader message="Loading schedule..." />
              ) : scheduleError ? (
                <div className="alert alert-warning mb-0 d-flex align-items-center">
                  <span className="material-icons me-2">warning</span>
                  {scheduleError}
                </div>
              ) : schedule ? (
                <div className="list-group list-group-flush">
                  {[
                    {
                      label: "Yesterday",
                      data: schedule.yesterday,
                      icon: "arrow_circle_left",
                    },
                    { label: "Today", data: schedule.today, icon: "circle" },
                    {
                      label: "Tomorrow",
                      data: schedule.tomorrow,
                      icon: "arrow_circle_right",
                    },
                  ].map((day) => (
                    <div
                      key={day.label}
                      className={`list-group-item d-flex justify-content-between align-items-center px-0 ${
                        day.label === "Today"
                          ? "bg-success bg-opacity-10 px-2 rounded"
                          : ""
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <span
                          className={`material-icons me-2 ${day.label === "Today" ? "text-success" : "text-muted"}`}
                        >
                          {day.icon}
                        </span>
                        <div>
                          <strong>{day.label}</strong>
                          {day.data && (
                            <small className="d-block text-muted">
                              {day.data.date}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        {day.data ? (
                          <span className="badge bg-light text-dark">
                            {day.data.timeFrom} — {day.data.timeTo}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">
                            No schedule
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No schedule data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Attendance History Card */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-info text-white d-flex align-items-center">
              <span className="material-icons me-2">history</span>
              <h5 className="mb-0">Attendance History</h5>
            </div>
            <div className="card-body">
              {attendanceLoading ? (
                <Loader message="Loading attendance..." />
              ) : attendanceError ? (
                <div className="alert alert-warning mb-0 d-flex align-items-center">
                  <span className="material-icons me-2">warning</span>
                  {attendanceError}
                </div>
              ) : attendance && attendance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Entry</th>
                        <th>Exit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record, index) => (
                        <tr key={index}>
                          <td className="fw-semibold">{record.date}</td>
                          <td>
                            <span className="badge bg-success bg-opacity-10 text-success">
                              {record.entryTime}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-danger bg-opacity-10 text-danger">
                              {record.exitTime}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">No attendance records found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
