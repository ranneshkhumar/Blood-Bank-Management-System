import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StaffDashboard() {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();

    axios.get("http://localhost:5000/api/blood/alerts")
      .then(res => setAlerts(res.data));
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  navigate("/");
};
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

    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading dashboard... 🩸</div>;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🩸 Blood Bank Staff Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
    Logout
  </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {/* 🔥 BLOOD LIST */}
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>Blood Availability</h3>

        {distribution.length === 0 ? (
          <p style={styles.noData}>No blood units available</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {distribution.map((item, index) => (
              <div key={index} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
              }}>
                <strong>{item.bloodGroup}</strong>
                <span style={{
                  color: item.units < 10 ? "#c0392b" : "#1a7a4a",
                  fontWeight: "bold"
                }}>
                  {item.units} units
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🔥 ALERTS */}
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>⚠️ Alerts</h3>

        {alerts.length === 0 ? (
          <p style={styles.noData}>No alerts</p>
        ) : (
          alerts.map((item, index) => (
            item.status !== "Normal" && (
              <div key={index} style={{
                background: item.status === "Low" ? "#fdecea" : "#fff3cd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px"
              }}>
                <strong>{item.bloodGroup}</strong> — {item.status}
              </div>
            )
          ))
        )}
      </div>

      {/* STAFF ACTIONS */}
      <div style={styles.sectionTitle}>Staff Actions</div>
      <div style={styles.cardRow}>
        <div style={{ ...styles.actionCard, borderColor: '#1a7a4a' }} onClick={() => navigate("/add-blood")}>
          <div style={styles.actionIcon}>🧪</div>
          <p style={styles.actionLabel}>Update Inventory</p>
          <p style={styles.actionSub}>Add or update blood units</p>
        </div>

        <div style={{ ...styles.actionCard, borderColor: '#1a7a4a' }}onClick={() => navigate("/inventory")}>
          <div style={styles.actionIcon}>👁️</div>
          <p style={styles.actionLabel}>View Inventory</p>
        </div>

        <div style={{ ...styles.actionCard, borderColor: '#1a7a4a' }} onClick={() => navigate("/register-donor")}>
  <div style={styles.actionIcon}>🩸</div>
  <p style={styles.actionLabel}>Register Donor</p>
  <p style={styles.actionSub}>Add blood via donor</p>
</div>

        <div style={{ ...styles.actionCard, borderColor: '#1a7a4a' }}>
          <div style={styles.actionIcon}>🆘</div>
          <p style={styles.actionLabel}>Blood Request</p>
        </div>
      </div>

    </div>
  );
}



const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '30px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px 30px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  title: {
    margin: '0',
    fontSize: '22px',
    color: '#c0392b',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  welcome: {
    color: '#888',
    fontSize: '14px',
  },
  roleBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
    marginTop: '8px',
  },
  cardRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    minWidth: '220px',
  },
  cardLabel: {
    color: '#888',
    fontSize: '14px',
    margin: '0 0 8px',
  },
  cardValue: {
    fontSize: '42px',
    color: '#c0392b',
    margin: '0',
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#aaa',
    fontSize: '12px',
    margin: '4px 0 0',
  },
  chartBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  chartTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '18px',
  },
  noData: {
    color: '#888',
    textAlign: 'center',
    padding: '40px',
  },
  roleSection: {
    marginTop: '8px',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    minWidth: '160px',
    borderTop: '4px solid',
    textAlign: 'center',
    cursor: 'pointer',
  },
  actionIcon: {
    fontSize: '30px',
    marginBottom: '8px',
  },
  actionLabel: {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#333',
    margin: '0 0 4px',
  },
  actionSub: {
    fontSize: '12px',
    color: '#888',
    margin: '0',
  },
  error: {
    color: '#c0392b',
    backgroundColor: '#fdecea',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '20px',
  },
 
};

export default StaffDashboard;