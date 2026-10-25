
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AllReporter.css";


const initialReporters = [
  {
    name: "Tanavi Vanjare",
    id: "REP-001",
    email: "tanavi@example.com",
    total: 32,
    pending: 4,
    approved: 10,
    rejected: 3,
    published: 15,
    status: "Active",
    icon: "👩",
  },
  {
    name: "Kamal Vadar",
    id: "REP-002",
    email: "kamal@example.com",
    total: 27,
    pending: 3,
    approved: 8,
    rejected: 2,
    published: 14,
    status: "Active",
    icon: "👨",
  },
  {
    name: "Vaishnavi Varak",
    id: "REP-003",
    email: "vaishnavi@example.com",
    total: 19,
    pending: 2,
    approved: 7,
    rejected: 1,
    published: 9,
    status: "Active",
    icon: "👧",
  },
  {
    name: "Tanashri Zarapkar",
    id: "REP-004",
    email: "tanashri@example.com",
    total: 24,
    pending: 3,
    approved: 6,
    rejected: 2,
    published: 13,
    status: "Inactive",
    icon: "👩‍🎓",
  },
];

export default function AllReporter() {
  const navigate = useNavigate();

  const [reporters] = useState(initialReporters);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("id-asc");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("All");
  const [appliedSort, setAppliedSort] = useState("id-asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    const result = reporters.filter((reporter) => {
      const term = appliedSearch.toLowerCase();

      const matchesSearch =
        reporter.name.toLowerCase().includes(term) ||
        reporter.id.toLowerCase().includes(term) ||
        reporter.email.toLowerCase().includes(term);

      const matchesStatus =
        appliedStatus === "All" ||
        reporter.status === appliedStatus;

      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (appliedSort === "id-asc") {
        return a.id.localeCompare(b.id);
      }

      if (appliedSort === "id-desc") {
        return b.id.localeCompare(a.id);
      }

      if (appliedSort === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      if (appliedSort === "news-high") {
        return b.total - a.total;
      }

      if (appliedSort === "news-low") {
        return a.total - b.total;
      }

      return a.name.localeCompare(b.name);
    });
  }, [reporters, appliedSearch, appliedStatus, appliedSort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleReporters = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const applyFilters = () => {
    setAppliedSearch(search.trim());
    setAppliedStatus(statusFilter);
    setAppliedSort(sortBy);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setSortBy("id-asc");
    setAppliedSearch("");
    setAppliedStatus("All");
    setAppliedSort("id-asc");
    setPage(1);
    setSelected([]);
  };

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
          (id) =>
            !visibleReporters.some((reporter) => reporter.id === id)
        )
      );
    }
  };

  return (
    <main className="reporters-page">
      <section className="reporters-banner">
        <div className="banner-icon">♟</div>

        <div className="banner-text">
          <h1>All Reporters</h1>
          <p>
            Manage registered reporters and track their news submissions.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
        >
          ⟳ Refresh
        </button>
      </section>

      <section className="reporter-stats">
        <article className="stat-card blue">
          <div className="stat-icon blue-icon">♟</div>
          <div>
            <p>Total Reporters</p>
            <h2>24</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>

        <article className="stat-card green">
          <div className="stat-icon green-icon">✓</div>
          <div>
            <p>Active Reporters</p>
            <h2>20</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>

        <article className="stat-card purple">
          <div className="stat-icon purple-icon">▤</div>
          <div>
            <p>Total News Submitted</p>
            <h2>156</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>

        <article className="stat-card orange">
          <div className="stat-icon orange-icon">◷</div>
          <div>
            <p>Pending Review</p>
            <h2>18</h2>
          </div>
          <span className="stat-arrow">›</span>
        </article>
      </section>

      <section className="filter-panel">
        <input
          className="reporter-search"
          type="text"
          placeholder="⌕ Search by reporter name, ID, or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyFilters();
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

          <button className="apply-button" onClick={applyFilters}>
            Apply Filters
          </button>

          <button className="reset-button" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </section>

      <section className="reporters-table-card">
        <div className="table-heading">
          <div className="table-heading-title">
            <h2>All Reporters</h2>
          </div>
          <span>Showing {filtered.length} records</span>
        </div>

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
              {visibleReporters.map((reporter) => (
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
                        {reporter.icon}
                      </span>
                      <strong>{reporter.name}</strong>
                    </div>
                  </td>

                  <td>{reporter.id}</td>
                  <td>{reporter.email}</td>
                  <td>{reporter.total}</td>
                  <td>{reporter.pending}</td>
                  <td>{reporter.approved}</td>
                  <td>{reporter.rejected}</td>
                  <td>{reporter.published}</td>

                  <td>
                    <span
                      className={`status-pill ${
                        reporter.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {reporter.status}
                    </span>
                  </td>

                  <td>
                    <button
  className="view-profile-button"
  onClick={() => {
  navigate("/editor/reporter-profile", {
    state: { reporter },
  });
}}
>
  View Profile
</button>
                  </td>
                </tr>
              ))}

              {visibleReporters.length === 0 && (
                <tr>
                  <td colSpan="11" className="no-reporters">
                    No reporters found. Try changing your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
            {filtered.length ? (currentPage - 1) * perPage + 1 : 0}
            {" – "}
            {Math.min(currentPage * perPage, filtered.length)}
            {" of "}
            {filtered.length} records
          </span>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage((previous) => previous - 1)}
            >
              ‹ Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                className={
                  currentPage === pageNumber ? "page-active" : ""
                }
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage((previous) => previous + 1)}
            >
              Next ›
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
