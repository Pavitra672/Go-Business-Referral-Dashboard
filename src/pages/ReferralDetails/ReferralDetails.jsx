import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchReferrals } from '../../api/referrals.js';
import './ReferralDetails.css';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function ReferralDetails() {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await fetchReferrals({ id });
        // Temporary debug aid: check the browser console to confirm the
        // exact field names the API is returning for this referral.
        console.log('Referral details payload:', result.referral);
        if (isMounted) {
          setReferral(result.referral);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Unable to load referral details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="referral-details">
      <Link to="/" className="back-link">
        ← Back to dashboard
      </Link>

      {loading && <p className="status-message" role="status">Loading referral details…</p>}
      {!loading && error && (
        <p className="status-message status-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && !referral && (
        <div className="card">
          <h1>Referral not found</h1>
        </div>
      )}

      {!loading && !error && referral && (
        <div className="card">
          <h2 className="section-title">Referral Details</h2>
          <h1>{referral.name ?? referral.partnerName ?? '—'}</h1>

          <dl className="details-list">
            <div className="details-row">
              <dt>Referral ID</dt>
              <dd>{referral.id ?? '—'}</dd>
            </div>
            <div className="details-row">
              <dt>Service Name</dt>
              <dd>{referral.serviceName ?? referral.service ?? '—'}</dd>
            </div>
            <div className="details-row">
              <dt>Date</dt>
              <dd>{formatDate(referral.date)}</dd>
            </div>
            <div className="details-row">
              <dt>Profit</dt>
              <dd>{currencyFormatter.format(referral.profit ?? 0)}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

export default ReferralDetails;