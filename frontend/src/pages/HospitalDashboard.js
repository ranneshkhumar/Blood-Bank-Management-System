import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HospitalDashboard() {
  const [form, setForm] = useState({
    hospitalName: "",
    bloodGroup: "",
    units: "",
    requiredDate: ""
  });

  const [requests, setRequests] = useState([]);
  const [hoveredRequest, setHoveredRequest] = useState(null);

  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  // Auto-fill hospital name from email
  useEffect(() => {
    if (email) {
      setForm(prev => ({ ...prev, hospitalName: email }));
    }
  }, [email]);

  // Fetch my requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/request/my/${email}`);
        setRequests(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (email) fetchRequests();
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/request", {
        ...form,
        hospitalEmail: email
      });

      alert("✅ Blood Request Sent Successfully!");

      // Reset form except hospital name
      setForm({
        hospitalName: email,
        bloodGroup: "",
        units: "",
        requiredDate: ""
      });

      // Refresh requests
      const res = await axios.get(`http://localhost:5000/api/request/my/${email}`);
      setRequests(res.data);

    } catch (err) {
      console.log("🔥 ERROR:", err.response?.data);
      alert(err.response?.data?.error || "❌ Failed to send request");
    }
  };

  // Stats
  const total = requests.length;
  const pending = requests.filter(r => r.status === "pending").length;
  const approved = requests.filter(r => r.status === "approved").length;
  const rejected = requests.filter(r => r.status === "rejected").length;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🏥 Hospital Dashboard</h1>
          <p style={styles.welcome}>Welcome back, {email?.split('@')[0] || "Hospital"}</p>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.roleBadge}>HOSPITAL</div>
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
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Requests</p>
          <p style={styles.cardValue}>{total}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending</p>
          <p style={styles.cardValue}>{pending}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Approved</p>
          <p style={styles.cardValue}>{approved}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Rejected</p>
          <p style={styles.cardValue}>{rejected}</p>
        </div>
      </div>

      <div style={styles.grid}>

        {/* LEFT - REQUEST FORM */}
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>🩸 Request Blood</h2>

          <input
            name="hospitalName"
            placeholder="Hospital Name"
            value={form.hospitalName}
            onChange={handleChange}
            style={styles.input}
            readOnly
          />

          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <input
            name="units"
            type="number"
            placeholder="Number of Units"
            value={form.units}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="requiredDate"
            type="date"
            value={form.requiredDate}
            onChange={handleChange}
            style={styles.input}
          />

          <button onClick={handleSubmit} style={styles.submitButton}>
            Send Blood Request
          </button>
        </div>

        {/* RIGHT - MY REQUESTS */}
        <div style={styles.requestsCard}>
          <h2 style={styles.sectionTitle}>📋 My Requests</h2>

          {requests.length === 0 ? (
            <p style={styles.noData}>No requests submitted yet</p>
          ) : (
            requests.map((req, i) => (
              <div 
                key={i} 
                style={
                  hoveredRequest === i 
                    ? { ...styles.requestCard, ...styles.requestCardHover } 
                    : styles.requestCard
                }
                onMouseEnter={() => setHoveredRequest(i)}
                onMouseLeave={() => setHoveredRequest(null)}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#c0392b' }}>{req.bloodGroup}</strong> — 
                  <span> {req.units} units</span>
                  <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                    {new Date(req.requiredDate).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: 
                    req.status === "approved" ? "#e6f4ea" :
                    req.status === "rejected" ? "#fce8e6" : "#fff4e5",
                  color: 
                    req.status === "approved" ? "#1a7a4a" :
                    req.status === "rejected" ? "#c0392b" : "#e67e22"
                }}>
                  {req.status.toUpperCase()}
                </div>
              </div>
            ))
          )}
        </div>

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

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '28px',
  },

  formCard: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '32px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
  },

  requestsCard: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '32px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  },

  sectionTitle: {
    fontSize: '19px',
    fontWeight: '700',
    color: colors.text,
    marginBottom: '24px',
  },

  input: {
    display: 'block',
    width: '100%',
    padding: '14px 16px',
    marginBottom: '18px',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.2s',
  },

  submitButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },

  requestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    backgroundColor: '#fff',
    borderRadius: '14px',
    marginBottom: '12px',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.25s ease',
  },

  requestCardHover: {
    transform: 'translateY(-3px)',
    boxShadow: `0 12px 30px ${colors.shadow}`,
    borderColor: '#ffd6d6',
  },

  noData: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '16px',
  },
};

export default HospitalDashboard;