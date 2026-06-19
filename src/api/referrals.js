import Cookies from 'js-cookie';

export const API_BASE = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api';

/**
 * Logs a user in.
 * Returns the JWT token on success, throws an Error with a readable
 * message on failure.
 */
export async function signIn(email, password) {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.data?.token) {
    throw new Error(body?.message || 'Invalid email or password');
  }

  return body.data.token;
}

// Returns true if an object looks like a single referral record
// (has an id or name, and isn't one of the known wrapper shapes).
function looksLikeReferral(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    (obj.id !== undefined || obj.name !== undefined) &&
    obj.referrals === undefined &&
    obj.metrics === undefined &&
    obj.serviceSummary === undefined
  );
}

/**
 * Fetches referrals data. Supports optional search, sort and id params.
 *
 * Tries, in order:
 *  1. payload.referral               (nested single-referral wrapper)
 *  2. payload                        (single referral returned directly)
 *  3. payload.referrals[0]           (single-item list returned for an id lookup)
 *  4. payload.data.referral / payload.data (one extra level of `data` nesting)
 *
 * For list requests (no id), falls back to the metrics/serviceSummary/referrals
 * list shape, supporting both nested ({ data: {...} }) and flat layouts.
 */
export async function fetchReferrals({ search, sort, id } = {}) {
  const token = Cookies.get('jwt_token');
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  if (id !== undefined && id !== null) params.set('id', id);

  const query = params.toString();
  const url = `${API_BASE}/referrals${query ? `?${query}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || 'Unable to load referral data');
  }

  // First level: prefer `data`, fall back to the raw body.
  let payload = body?.data ?? body ?? {};

  // Some APIs wrap an extra level: { data: { data: {...} } }
  if (payload && typeof payload === 'object' && payload.data && !Array.isArray(payload.data)) {
    if (
      payload.referral === undefined &&
      payload.referrals === undefined &&
      payload.metrics === undefined &&
      payload.serviceSummary === undefined
    ) {
      payload = payload.data;
    }
  }

  // ---- Single-referral lookup (id was requested) ----
  if (id !== undefined && id !== null) {
    let referral = null;

    if (looksLikeReferral(payload?.referral)) {
      referral = payload.referral;
    } else if (looksLikeReferral(payload)) {
      referral = payload;
    } else if (Array.isArray(payload?.referrals) && payload.referrals.length > 0) {
      referral = payload.referrals[0];
    } else if (Array.isArray(payload) && payload.length > 0) {
      referral = payload[0];
    }

    return {
      metrics: payload?.metrics ?? [],
      serviceSummary: payload?.serviceSummary ?? {},
      referral,
      referrals: [],
    };
  }

  // ---- Default / search / sort list lookup ----
  return {
    metrics: payload?.metrics ?? [],
    serviceSummary: payload?.serviceSummary ?? {},
    referral: payload?.referral ?? null,
    referrals: payload?.referrals ?? (Array.isArray(payload) ? payload : []),
  };
}