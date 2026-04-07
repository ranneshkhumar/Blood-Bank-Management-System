import React, { useEffect, useState } from "react";
import axios from "axios";

function SuperAdminDashboard() {
  const [form, setForm] = useState({
    hospitalName: "",
    bloodGroup: "",
    units: "",
    requiredDate: ""
  });

  const email = localStorage.getItem("email");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/request/my/${email}`
      );
      setRequests(res.data);
    };

    fetchRequests();
  }, [email]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/request", {
        ...form,
        hospitalEmail: email
      });

      alert("✅ Request Sent");

      setForm({
        hospitalName: "",
        bloodGroup: "",
        units: "",
        requiredDate: ""
      });

      // refresh
      const res = await axios.get(
        `http://localhost:5000/api/request/my/${email}`
      );
      setRequests(res.data);

    } catch {
      alert("❌ Failed");
    }
  };

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>🏥 Hospital Dashboard</h1>

      <div style={styles.grid}>

        {/* LEFT → FORM */}
        <div style={styles.card}>
          <h2>Request Blood</h2>

          <input
            name="hospitalName"
            placeholder="Hospital Name"
            value={form.hospitalName}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select Blood Group</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
              <option key={bg}>{bg}</option>
            ))}
          </select>

          <input
            name="units"
            type="number"
            placeholder="Units"
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

          <button onClick={handleSubmit} style={styles.button}>
            Send Request
          </button>
        </div>

        {/* RIGHT → REQUESTS */}
        <div style={styles.card}>
          <h2>My Requests</h2>

          {requests.length === 0 ? (
            <p style={{ color: "#888" }}>No requests yet</p>
          ) : (
            requests.map((req, i) => (
              <div key={i} style={styles.requestCard}>
                <div>
                  <strong>{req.bloodGroup}</strong> — {req.units} units
                </div>

                <div style={{
                  color:
                    req.status === "approved" ? "green" :
                    req.status === "rejected" ? "red" :
                    "#e67e22"
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
   input: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    width: "250px"
  },
  button: {
    padding: "10px",
    background: "#c0392b",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },
};


export default SuperAdminDashboard;