
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AllReporter.css";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${
  API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`
}/reporters`;

export default function AllReporter() {
  const navigate = useNavigate();

  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("id-asc");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("All");
  const [appliedSort, setAppliedSort] = useState("id-asc");

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  // FETCH REPORTERS FROM DATABASE
  const fetchReporters = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(API_URL);

      // Handle invalid/non-JSON server responses safely
      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid server response. Please check your backend API."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load reporters.");
      }

      const actualReporters = (data.reporters || []).map((reporter) => {
        const numericId = Number(reporter.id);

        return {
          ...reporter,
          id: numericId,
          reporterCode:
            String(reporter.reporterCode || "").trim() ||
            `REP-${String(numericId).padStart(3, "0")}`,
          name: String(reporter.name || "Unnamed Reporter"),
          email: String(reporter.email || ""),
          total: Number(reporter.total) || 0,
          pending: Number(reporter.pending) || 0,
          approved: Number(reporter.approved) || 0,
          rejected: Number(reporter.rejected) || 0,
          published: Number(reporter.published) || 0,
          status: String(reporter.status || "Active"),
        };
      });

      setReporters(actualReporters);

      setSelected((previous) =>
        previous.filter((id) =>
          actualReporters.some((reporter) => reporter.id === id)
        )
      );

      if (isRefresh) {
        toast.success("Reporter list refreshed successfully.");
      }
    } catch (err) {
      console.error("FETCH REPORTERS ERROR:", err);

      const message =
        err.message === "Failed to fetch"
          ? "Backend connection failed. Check whether the server is running."
          : err.message ||
            "Could not connect to the backend. Please check your server.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReporters();
  }, [fetchReporters]);

  // DATABASE STATISTICS
  const totalReporters = reporters.length;

  const activeReporters = reporters.filter(
    (reporter) => reporter.status.toLowerCase() === "active"
  ).length;

  const totalNews = reporters.reduce(
    (sum, reporter) => sum + reporter.total,
    0
  );

  const totalPending = reporters.reduce(
    (sum, reporter) => sum + reporter.pending,
    0
  );

  // SEARCH, FILTER AND SORT
  const filtered = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();

    const result = reporters.filter((reporter) => {
      const matchesSearch =
        reporter.name.toLowerCase().includes(term) ||
        reporter.reporterCode.toLowerCase().includes(term) ||
        reporter.email.toLowerCase().includes(term);

      const matchesStatus =
        appliedStatus === "All" ||
        reporter.status.toLowerCase() === appliedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      switch (appliedSort) {
        case "id-asc":
          return a.id - b.id;

        case "id-desc":
          return b.id - a.id;

        case "name-desc":
          return b.name.localeCompare(a.name);

        case "news-high":
          return b.total - a.total;

        case "news-low":
          return a.total - b.total;

        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [reporters, appliedSearch, appliedStatus, appliedSort]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);

  const visibleReporters = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // APPLY FILTERS
  const applyFilters = () => {
    setAppliedSearch(search.trim());
    setAppliedStatus(statusFilter);
    setAppliedSort(sortBy);
    setPage(1);
    setSelected([]);

    toast.success("Reporter filters applied successfully.");
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSortBy("id-asc");

    setAppliedSearch("");
    setAppliedStatus("All");
    setAppliedSort("id-asc");

    setPage(1);
    setSelected([]);

    toast.info("Reporter filters have been reset.");
  };

  // SELECT / DESELECT REPORTER
  const toggleReporter = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAll = (checked) => {
    if (checked) {
      setSelected((previous) => [
        ...new Set([
          ...previous,
          ...visibleReporters.map((reporter) => reporter.id),
        ]),
      ]);
    } else {
      setSelected((previous) =>
        previous.filter(
          (id) => !visibleReporters.some((reporter) => reporter.id === id)
        )
      );
    }
  };

  // REPORTER INITIALS
  const getInitials = (name) => {
    return String(name || "UR")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  // OPEN REPORTER PROFILE
  const openReporterProfile = (reporter) => {
    navigate("/editor/reporter-profile", {
      state: {
        reporter: {
          ...reporter,
          reporterId: reporter.id,
        },
      },
    });
  };

  return (
    <main className="reporters-page">
      {/* PAGE BANNER */}
      <section className="reporters-banner">
        <div className="banner-icon">♟</div>

        <div className="banner-text">
          <h1>All Reporters</h1>
          <p>
            Manage registered reporters and track their news submissions.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() => fetchReporters(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "⟳ Refreshing..." : "⟳ Refresh"}
        </button>
      </section>

      {/* DATABASE STATISTICS */}
      <section className="reporter-stats">
        <article className="stat-card blue">
          <div className="stat-icon blue-icon">♟</div>
          <div>
            <p>Total Reporters</p>
            <h2>{loading ? "—" : totalReporters}</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>

        <article className="stat-card green">
          <div className="stat-icon green-icon">✓</div>
          <div>
            <p>Active Reporters</p>
            <h2>{loading ? "—" : activeReporters}</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>

        <article className="stat-card purple">
          <div className="stat-icon purple-icon">▤</div>
          <div>
            <p>Total News Submitted</p>
            <h2>{loading ? "—" : totalNews}</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>

        <article className="stat-card orange">
          <div className="stat-icon orange-icon">◷</div>
          <div>
            <p>Pending Review</p>
            <h2>{loading ? "—" : totalPending}</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="filter-panel">
        <input
          className="reporter-search"
          type="text"
          placeholder="⌕ Search by reporter name, ID, or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applyFilters();
            }
          }}
        />

        <div className="filter-row">
          <label className="filter-field">
            <span>Account Status</span>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <label className="filter-field sort-field">
            <span>Sort By</span>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="id-asc">Reporter ID A-Z</option>
              <option value="id-desc">Reporter ID Z-A</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="news-high">Most News</option>
              <option value="news-low">Least News</option>
            </select>
          </label>

          <button
            type="button"
            className="apply-button"
            onClick={applyFilters}
          >
            Apply Filters
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* REPORTERS TABLE */}
      <section className="reporters-table-card">
        <div className="table-heading">
          <div className="table-heading-title">
            <h2>All Reporters</h2>
          </div>

          <span>
            {loading
              ? "Loading records..."
              : `Showing ${filtered.length} records`}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              margin: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f2",
              color: "#be123c",
            }}
          >
            <strong>Unable to load reporters.</strong>
            <p>{error}</p>

            <button
              type="button"
              className="refresh-button"
              onClick={() => fetchReporters(true)}
              disabled={refreshing}
            >
              {refreshing ? "Retrying..." : "Try Again"}
            </button>
          </div>
        )}

        <div className="table-scroll">
          <table className="reporters-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all reporters on this page"
                    checked={
                      visibleReporters.length > 0 &&
                      visibleReporters.every((reporter) =>
                        selected.includes(reporter.id)
                      )
                    }
                    onChange={(event) => toggleAll(event.target.checked)}
                    disabled={loading || visibleReporters.length === 0}
                  />
                </th>

                <th>Reporter</th>
                <th>Reporter ID</th>
                <th>Email</th>
                <th>Total</th>
                <th>Pending</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Published</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="no-reporters">
                    Loading reporters from database...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={11} className="no-reporters">
                    Reporter data could not be loaded.
                  </td>
                </tr>
              ) : visibleReporters.length > 0 ? (
                visibleReporters.map((reporter) => (
                  <tr key={reporter.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${reporter.name}`}
                        checked={selected.includes(reporter.id)}
                        onChange={() => toggleReporter(reporter.id)}
                      />
                    </td>

                    <td>
                      <div className="reporter-name-cell">
                        <span className="reporter-avatar">
                          {getInitials(reporter.name)}
                        </span>

                        <strong>{reporter.name}</strong>
                      </div>
                    </td>

                    <td>{reporter.reporterCode}</td>
                    <td>{reporter.email}</td>
                    <td>{reporter.total}</td>
                    <td>{reporter.pending}</td>
                    <td>{reporter.approved}</td>
                    <td>{reporter.rejected}</td>
                    <td>{reporter.published}</td>

                    <td>
                      <span
                        className={`status-pill ${
                          reporter.status.toLowerCase() === "active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {reporter.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="view-profile-button"
                        onClick={() => openReporterProfile(reporter)}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="no-reporters">
                    No reporters found. Try changing your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
        <div className="table-footer">
          <div className="rows-control">
            <span>Rows per page:</span>

            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <span className="page-summary">
            Showing{" "}
            {filtered.length > 0 ? (currentPage - 1) * perPage + 1 : 0}
            {" – "}
            {Math.min(currentPage * perPage, filtered.length)}
            {" of "}
            {filtered.length} records
          </span>

          <div className="pagination">
            <button
              type="button"
              disabled={currentPage === 1 || loading}
              onClick={() =>
                setPage((previous) => Math.max(1, previous - 1))
              }
            >
              ‹ Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={
                    currentPage === pageNumber ? "page-active" : ""
                  }
                  onClick={() => setPage(pageNumber)}
                  disabled={loading}
                >
                  {pageNumber}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setPage((previous) => Math.min(totalPages, previous + 1))
              }
            >
              Next ›
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
