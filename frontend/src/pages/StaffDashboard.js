import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StaffDashboard() {
  const [distribution, setDistribution] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredAction, setHoveredAction] = useState(null);

  const navigate = useNavigate();
  

  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/blood');
      const bloodData = response.data;

      const groupMap = {};
      bloodData.forEach(item => {
        groupMap[item.bloodGroup] = (groupMap[item.bloodGroup] || 0) + item.quantity;
      });

      const listData = Object.entries(groupMap).map(([group, count]) => ({
        bloodGroup: group,
        units: count
      }));

      setDistribution(listData);
    } catch (err) {
      setError('Failed to load blood inventory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/blood/alerts");
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  const totalUnits = distribution.reduce((sum, item) => sum + item.units, 0);
  const lowStock = distribution.filter(item => item.units < 10).length;

  if (loading) {
    return <div style={styles.loading}>Loading Blood Bank Dashboard... 🩸</div>;
  }

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🩸 Blood Bank Staff Dashboard</h1>
          <p style={styles.welcome}>Welcome back, Staff Member</p>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.roleBadge}>STAFF</div>
          <button 
            onClick={handleLogout} 
            style={styles.logoutBtn}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a02d23'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* STATS CARDS */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Blood Units</p>
          <p style={styles.cardValue}>{totalUnits}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Blood Types</p>
          <p style={styles.cardValue}>{distribution.length}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Low Stock</p>
          <p style={{ ...styles.cardValue, color: lowStock > 0 ? '#c0392b' : '#1a7a4a' }}>
            {lowStock}
          </p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Critical Alerts</p>
          <p style={{ ...styles.cardValue, color: '#c0392b' }}>
            {alerts.filter(a => a.status === "Low").length}
          </p>
        </div>
      </div>

      {/* BLOOD AVAILABILITY */}
      <h2 style={styles.sectionTitle}>📦 Blood Availability</h2>
      <div style={styles.chartBox}>
        {distribution.length === 0 ? (
          <p style={styles.noData}>No blood units available</p>
        ) : (
          <div style={styles.bloodList}>
            {distribution.map((item, index) => (
              <div key={index} style={styles.bloodItem}>
                <strong style={{ fontSize: '18px' }}>{item.bloodGroup}</strong>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: item.units < 10 ? '#c0392b' : '#1a7a4a'
                }}>
                  {item.units} units
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ALERTS */}
      <h2 style={styles.sectionTitle}>⚠️ Critical Alerts</h2>
      <div style={styles.chartBox}>
        {alerts.length === 0 || alerts.every(a => a.status === "Normal") ? (
          <p style={styles.noData}>✅ All blood levels are normal</p>
        ) : (
          alerts.map((item, index) => (
            item.status !== "Normal" && (
              <div key={index} style={{
                ...styles.alertItem,
                backgroundColor: item.status === "Low" ? "#fdecea" : "#fff3cd",
                borderLeft: `5px solid ${item.status === "Low" ? "#c0392b" : "#f4a100"}`
              }}>
                <strong>{item.bloodGroup}</strong> — {item.status} Stock
              </div>
            )
          ))
        )}
      </div>

      {/* STAFF ACTIONS */}
      <h2 style={styles.sectionTitle}>🛠️ Staff Actions</h2>
      <div style={styles.cardRow}>
        {[
          { icon: "🧪", label: "Update Inventory", sub: "Add or update blood units", path: "/add-blood" },
          { icon: "📋", label: "View Full Inventory", sub: "Detailed stock management", path: "/inventory" },
          { icon: "🩸", label: "Register Donor", sub: "Add blood via donation", path: "/register-donor" }
        ].map((action, index) => (
          <div
            key={index}
            style={
              hoveredAction === index
                ? { ...styles.actionCard, ...styles.actionCardHover }
                : styles.actionCard
            }
            onMouseEnter={() => setHoveredAction(index)}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={() => navigate(action.path)}
          >
            <div style={styles.actionIcon}>{action.icon}</div>
            <p style={styles.actionLabel}>{action.label}</p>
            <p style={styles.actionSub}>{action.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const colors = {
  primary: '#c0392b',
  primaryDark: '#a02d23',
  success: '#1a7a4a',
  text: '#2c3e50',
  textLight: '#555',
  textMuted: '#888',
  border: '#e8e8e8',
  background: '#f8f9fa',
  white: '#ffffff',
  shadowLight: 'rgba(0, 0, 0, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.12)',
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    padding: '32px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: '24px 32px',
    borderRadius: '20px',
    marginBottom: '32px',
    boxShadow: `0 8px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
  },

  title: {
    margin: '0',
    fontSize: '28px',
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: '-0.025em',
  },

  welcome: {
    color: colors.textMuted,
    fontSize: '15px',
    margin: '4px 0 0 0',
  },

  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  roleBadge: {
    padding: '6px 18px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '700',
    backgroundColor: '#fff0f0',
    color: colors.primary,
  },

  logoutBtn: {
    padding: '12px 26px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.25s ease',
  },

  cardRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '32px 28px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
    minWidth: '240px',
    flex: '1',
  },

  cardLabel: {
    color: colors.textMuted,
    fontSize: '14.5px',
    marginBottom: '10px',
    fontWeight: '500',
  },

  cardValue: {
    fontSize: '52px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0',
    lineHeight: '1',
  },

  sectionTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: colors.text,
    margin: '12px 0 18px 0',
  },

  chartBox: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '32px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
    marginBottom: '32px',
  },

  bloodList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  bloodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: `1px solid ${colors.border}`,
  },

  alertItem: {
    padding: '16px 20px',
    marginBottom: '12px',
    borderRadius: '12px',
    fontSize: '15px',
  },

  actionCard: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '28px 20px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
    minWidth: '220px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  actionCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${colors.shadow}`,
  },

  actionIcon: {
    fontSize: '42px',
    marginBottom: '16px',
  },

  actionLabel: {
    fontWeight: '700',
    fontSize: '16px',
    color: colors.text,
    margin: '0 0 8px',
  },

  actionSub: {
    fontSize: '13.5px',
    color: colors.textMuted,
    margin: '0',
  },

  error: {
    color: colors.primary,
    backgroundColor: '#fdecea',
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    borderLeft: `5px solid ${colors.primary}`,
  },

  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '21px',
    color: colors.textMuted,
  },

  noData: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '16px',
  },
};

export default StaffDashboard;