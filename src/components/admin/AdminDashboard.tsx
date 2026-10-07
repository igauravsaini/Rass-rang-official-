import React, { useState, useEffect, useCallback } from 'react';
import { safeParseJson } from '../../lib/api';
import '../../styles/booking.css';

export const AdminDashboard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => sessionStorage.getItem('rrg_admin_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(sessionStorage.getItem('rrg_admin_key')));

  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, perStatus: {}, perPass: {}, perSpot: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [passFilter, setPassFilter] = useState('ALL');

  const fetchBookings = useCallback(async (currentKey: string) => {
    if (!currentKey) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (passFilter !== 'ALL') params.append('pass', passFilter);

      const res = await fetch(`/api/admin-bookings?${params.toString()}`, {
        headers: {
          'x-api-key': currentKey,
        },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('rrg_admin_key');
        throw new Error('Invalid API Key. Please re-enter.');
      }

      const data = await safeParseJson(res);
      if (!data.success) {
        throw new Error(data.error || 'Failed to load bookings');
      }

      setBookings(data.bookings || []);
      setStats(data.stats || { total: 0, perStatus: {}, perPass: {}, perSpot: {} });
    } catch (err: any) {
      setError(err.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, passFilter]);

  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchBookings(apiKey);
    }
  }, [isAuthenticated, apiKey, fetchBookings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem('rrg_admin_key', keyInput.trim());
    setApiKey(keyInput.trim());
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rrg_admin_key');
    setApiKey('');
    setIsAuthenticated(false);
    setBookings([]);
  };

  const handleStatusChange = async (ticketNo: string, newStatus: 'COLLECTED' | 'CANCELLED') => {
    if (!confirm(`Are you sure you want to mark ticket ${ticketNo} as ${newStatus}?`)) return;

    try {
      const res = await fetch('/api/admin-bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          ticketNo,
          status: newStatus,
        }),
      });

      const data = await safeParseJson(res);
      if (!data.success) {
        alert(data.error || 'Failed to update status');
        return;
      }

      // Refresh list
      fetchBookings(apiKey);
    } catch (err) {
      alert('Error updating ticket status');
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append('search', search.trim());
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (passFilter !== 'ALL') params.append('pass', passFilter);
    params.append('export', 'csv');

    fetch(`/api/admin-bookings?${params.toString()}`, {
      headers: { 'x-api-key': apiKey },
    })
      .then((res) => {
        if (!res.ok) throw new Error('CSV export failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raas_rang_bookings_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
      })
      .catch((err) => alert(err.message));
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-badge">Raas~Rang 2026 Admin Portal</div>
          <h2>Authentication Required</h2>
          <p>Please enter your administrative or volunteer API secret key to access ticket records.</p>
          <form onSubmit={handleLogin} className="admin-login-form">
            <input
              type="password"
              placeholder="Enter x-api-key"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Access Dashboard
            </button>
          </form>
          <a href="/" className="admin-back-link">← Return to Public Website</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="admin-nav-brand">
          <span className="brand-dot"></span>
          <h1>Raas~Rang 2026 — Ticket Management & Volunteer Desk</h1>
        </div>
        <div className="admin-nav-actions">
          <a href="/admin/scan" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
            📷 Open QR Scanner
          </a>
          <button type="button" onClick={handleExportCsv} className="btn btn-outline btn-sm">
            📥 Export CSV
          </button>
          <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        {error && <div className="admin-error-banner">⚠️ {error}</div>}

        {/* Aggregate Metrics Grid */}
        <section className="admin-metrics-grid">
          <div className="metric-box total">
            <span className="metric-num">{stats.total || 0}</span>
            <span className="metric-title">Total Bookings</span>
          </div>

          <div className="metric-box prebooked">
            <span className="metric-num">{stats.perStatus?.PRE_BOOKED || 0}</span>
            <span className="metric-title">Pre-Booked (Pending Handover)</span>
          </div>

          <div className="metric-box collected">
            <span className="metric-num">{stats.perStatus?.COLLECTED || 0}</span>
            <span className="metric-title">Collected Passes (Paid)</span>
          </div>

          <div className="metric-box checkedin">
            <span className="metric-num">{stats.perStatus?.CHECKED_IN || 0}</span>
            <span className="metric-title">Gate Checked In</span>
          </div>

          <div className="metric-box cancelled">
            <span className="metric-num">{stats.perStatus?.CANCELLED || 0}</span>
            <span className="metric-title">Cancelled</span>
          </div>
        </section>

        {/* Filter Controls Bar */}
        <section className="admin-filter-bar">
          <input
            type="text"
            placeholder="Search by Name, Mobile, or Ticket Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="PRE_BOOKED">PRE_BOOKED</option>
            <option value="COLLECTED">COLLECTED</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select value={passFilter} onChange={(e) => setPassFilter(e.target.value)}>
            <option value="ALL">All Pass Types</option>
            <option value="SIGMA">SIGMA Pass</option>
            <option value="COUPLE">COUPLE Pass</option>
            <option value="FAMILY">FAMILY Pass</option>
          </select>

          <button type="button" onClick={() => fetchBookings(apiKey)} className="btn btn-secondary btn-sm">
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </section>

        {/* Bookings Data Table */}
        <section className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket No</th>
                <th>Attendee Name</th>
                <th>Mobile</th>
                <th>Pass Type</th>
                <th>Collection Spot</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#a09585' }}>
                    {loading ? 'Loading reservations...' : 'No bookings found matching filters.'}
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="ticket-code-cell">{b.ticket_no}</td>
                    <td className="attendee-name-cell">{b.name}</td>
                    <td>{b.mobile}</td>
                    <td>
                      <span className="pass-pill">{b.passes?.code}</span> (₹{b.passes?.price})
                    </td>
                    <td className="spot-cell">{b.spots?.name}</td>
                    <td>
                      <span className={`status-tag status-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(b.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="action-buttons-cell">
                      {b.status === 'PRE_BOOKED' && (
                        <button
                          type="button"
                          className="table-action-btn collect"
                          title="Mark Physical Pass Collected & Paid"
                          onClick={() => handleStatusChange(b.ticket_no, 'COLLECTED')}
                        >
                          Mark Collected
                        </button>
                      )}
                      {b.status !== 'CANCELLED' && b.status !== 'CHECKED_IN' && (
                        <button
                          type="button"
                          className="table-action-btn cancel"
                          title="Cancel Reservation"
                          onClick={() => handleStatusChange(b.ticket_no, 'CANCELLED')}
                        >
                          Cancel
                        </button>
                      )}
                      {b.status === 'CHECKED_IN' && (
                        <span className="entry-granted-badge">✓ Admitted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};
