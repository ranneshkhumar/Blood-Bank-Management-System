import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:5000/api/request");
    setRequests(res.data);
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
  console.log(err.response?.data);   // 🔥 IMPORTANT
  alert(err.response?.data?.error || "Reject failed");
}
 
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>🩸 Admin Dashboard</h1>

      <h2>📥 Blood Requests</h2>

      {requests.length === 0 ? (
        <p>No requests</p>
      ) : (
        requests.map((req) => (
          <div key={req._id} style={{
            background: "#fff",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}>
            <p><strong>Hospital:</strong> {req.hospitalName}</p>
            <p><strong>Blood Group:</strong> {req.bloodGroup}</p>
            <p><strong>Units:</strong> {req.units}</p>
            <p><strong>Date:</strong> {new Date(req.requiredDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {req.status}</p>

            {req.status === "pending" && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleApprove(req._id)} style={styles.approve}>
                  Approve
                </button>

                <button onClick={() => handleReject(req._id)} style={styles.reject}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
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
  
  approve: {
    padding: "8px 12px",
    background: "#1a7a4a",
    color: "#fff",
    border: "none",
    marginRight: "10px",
    cursor: "pointer"
  },
  reject: {
    padding: "8px 12px",
    background: "#c0392b",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },

};


export default AdminDashboard;