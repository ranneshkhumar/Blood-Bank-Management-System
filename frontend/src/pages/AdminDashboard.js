import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/request");
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(sorted);
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

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/request/approve/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Approval failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/request/reject/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Reject failed");
    }
  };

  // Calculate Stats
  const totalRequests = requests.length;
  const pending = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const rejected = requests.filter(r => r.status === "rejected").length;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🩸 Admin Dashboard</h1>
          <p style={styles.welcome}>Welcome back, Administrator</p>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.roleBadge}>ADMIN</div>
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

      {/* STATS CARDS */}
      <div style={styles.cardRow}>
        <div 
          style={hoveredCard === 1 ? { ...styles.card, ...styles.cardHover } : styles.card}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <p style={styles.cardLabel}>Total Requests</p>
          <p style={styles.cardValue}>{totalRequests}</p>
        </div>

        <div 
          style={hoveredCard === 2 ? { ...styles.card, ...styles.cardHover } : styles.card}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <p style={styles.cardLabel}>Pending</p>
          <p style={styles.cardValue}>{pending}</p>
        </div>

        <div 
          style={hoveredCard === 3 ? { ...styles.card, ...styles.cardHover } : styles.card}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <p style={styles.cardLabel}>Approved</p>
          <p style={styles.cardValue}>{approved}</p>
        </div>

        <div 
          style={hoveredCard === 4 ? { ...styles.card, ...styles.cardHover } : styles.card}
          onMouseEnter={() => setHoveredCard(4)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <p style={styles.cardLabel}>Rejected</p>
          <p style={styles.cardValue}>{rejected}</p>
        </div>
      </div>

      {/* REQUESTS SECTION */}
      <h2 style={styles.sectionTitle}>📥 Blood Requests</h2>

      <div style={styles.tableContainer}>
        {/* TABLE HEADER */}
        <div style={styles.headerRow}>
          <span>Hospital</span>
          <span>Blood Group</span>
          <span>Units</span>
          <span>Required Date</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {/* TABLE BODY */}
        {requests.length === 0 ? (
          <p style={styles.noData}>No blood requests found</p>
        ) : (
          requests.map((req) => (
            <div 
              key={req._id}
              style={
                hoveredRow === req._id 
                  ? { ...styles.dataRow, ...styles.dataRowHover } 
                  : styles.dataRow
              }
              onMouseEnter={() => setHoveredRow(req._id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <span style={{ fontWeight: '500' }}>{req.hospitalName}</span>
              <span style={{ fontWeight: '600', color: '#c0392b' }}>{req.bloodGroup}</span>
              <span style={{ fontWeight: '600' }}>{req.units}</span>
              <span>{new Date(req.requiredDate).toLocaleDateString('en-IN')}</span>

              <span style={{
                color: 
                  req.status === "approved" ? "#1a7a4a" :
                  req.status === "rejected" ? "#c0392b" : "#e67e22",
                fontWeight: "bold",
                textTransform: 'capitalize'
              }}>
                {req.status}
              </span>

              <span>
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleApprove(req._id)}
                      style={styles.approve}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#14643c'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a7a4a'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      style={styles.reject}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#9c2a22'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span style={{ color: "#888", fontWeight: "500" }}>—</span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */
const colors = {
  primary: '#c0392b',
  primaryDark: '#a02d23',
  success: '#1a7a4a',
  successDark: '#14643c',
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

  sectionTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: colors.text,
    marginBottom: '18px',
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
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  cardHover: {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 45px ${colors.shadow}`,
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

  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '12px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  },

  headerRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.6fr 1.2fr 1.6fr',
    padding: '18px 24px',
    fontWeight: '600',
    fontSize: '13.8px',
    color: colors.textLight,
    backgroundColor: '#f8f9fa',
    borderRadius: '14px',
    marginBottom: '10px',
  },

  dataRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1.6fr 1.2fr 1.6fr',
    alignItems: 'center',
    padding: '18px 24px',
    marginBottom: '8px',
    borderRadius: '14px',
    backgroundColor: colors.white,
    transition: 'all 0.25s ease',
  },

  dataRowHover: {
    backgroundColor: '#fffaf8',
    boxShadow: `0 10px 25px ${colors.shadow}`,
    transform: 'scale(1.01)',
  },

  approve: {
    padding: '9px 18px',
    backgroundColor: colors.success,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginRight: '8px',
    transition: 'all 0.2s ease',
  },

  reject: {
    padding: '9px 18px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },

  noData: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '16px',
  },
};

export default AdminDashboard;