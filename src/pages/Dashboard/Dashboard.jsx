import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReferrals } from '../../api/referrals.js';
import './Dashboard.css';

const PAGE_SIZE = 10;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// Converts an ISO date string to YYYY/MM/DD.
function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState({});
  const [referral, setReferral] = useState(null);
  const [referrals, setReferrals] = useState([]);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const navigate = useNavigate();

  const loadData = useCallback(async (params) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchReferrals(params);
      setMetrics(result.metrics);
      setServiceSummary(result.serviceSummary);
      setReferral(result.referral);
      setReferrals(result.referrals);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({ search, sort });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleCopy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopyMessage(`${label} copied to clipboard`);
      setTimeout(() => setCopyMessage(''), 2000);
    } catch {
      setCopyMessage('Unable to copy. Please copy manually.');
    }
  };

  // ---- Client-side pagination ----
  const total = referrals.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);
  const pageRows = referrals.slice(startIndex, endIndex);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Referral Dashboard</h1>
        <p>Track your referrals, earnings, and partner activity in one place.</p>
      </header>

      {loading && <p className="status-message" role="status">Loading dashboard data…</p>}
      {!loading && error && (
        <p className="status-message status-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {/* OVERVIEW */}
          <section className="card" aria-labelledby="overview-heading">
            <h2 id="overview-heading">Overview</h2>
            <div className="metrics-grid">
              {metrics.length === 0 && <p className="empty-text">No metrics available</p>}
              {metrics.map((metric, index) => (
                <div className="metric-card" key={metric.label ?? index}>
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-value">{metric.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SERVICE SUMMARY */}
          <section className="card" aria-labelledby="service-summary-heading">
            <h2 id="service-summary-heading">Service summary</h2>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Service</th>
                    <th scope="col">Your Referrals</th>
                    <th scope="col">Active Referrals</th>
                    <th scope="col">Total Ref. Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{serviceSummary.service ?? '—'}</td>
                    <td>{serviceSummary.yourReferrals ?? '—'}</td>
                    <td>{serviceSummary.activeReferrals ?? '—'}</td>
                    <td>{serviceSummary.totalRefEarnings ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SHARE REFERRAL */}
          <section className="card" aria-labelledby="share-referral-heading">
            <h2 id="share-referral-heading">Refer friends and earn more</h2>
            <div className="share-grid">
              <div className="share-field">
                <label htmlFor="referral-link">Your Referral Link</label>
                <div className="share-row">
                  <input
                    id="referral-link"
                    type="text"
                    readOnly
                    value={referral?.link ?? ''}
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleCopy(referral?.link, 'Referral link')}
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="share-field">
                <label htmlFor="referral-code">Your Referral Code</label>
                <div className="share-row">
                  <input
                    id="referral-code"
                    type="text"
                    readOnly
                    value={referral?.code ?? ''}
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleCopy(referral?.code, 'Referral code')}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            {copyMessage && (
              <p className="copy-message" role="status">
                {copyMessage}
              </p>
            )}
          </section>

          {/* ALL REFERRALS */}
          <section className="card" aria-labelledby="all-referrals-heading">
            <div className="referrals-toolbar">
              <h2 id="all-referrals-heading">All referrals</h2>

              <form className="search-form" onSubmit={handleSearchSubmit} role="search">
                <label htmlFor="referral-search" className="visually-hidden">
                  Search referrals
                </label>
                <input
                  id="referral-search"
                  type="search"
                  placeholder="Name or service…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="secondary-button">
                  Search
                </button>
              </form>

              <div className="sort-control">
                <label htmlFor="sort-by-date">Sort by date</label>
                <select
                  id="sort-by-date"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Service</th>
                    <th scope="col">Date</th>
                    <th scope="col">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-text">
                        No matching entries
                      </td>
                    </tr>
                  )}
                  {pageRows.map((row) => (
                    <tr
                      key={row.id}
                      className="clickable-row"
                      tabIndex={0}
                      onClick={() => navigate(`/referral/${row.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(`/referral/${row.id}`);
                      }}
                    >
                      <td>{row.name}</td>
                      <td>{row.serviceName ?? row.service ?? '—'}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>{currencyFormatter.format(row.profit ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <div className="pagination">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  Previous
                </button>

                {totalPages > 1 && (
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        type="button"
                        key={num}
                        className={num === safePage ? 'page-number active' : 'page-number'}
                        onClick={() => goToPage(num)}
                        aria-current={num === safePage ? 'page' : undefined}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  Next
                </button>
              </div>
            )}

            <p className="pagination-footer">
              Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total} entries
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
