import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddBlood() {
  const [mode, setMode] = useState("add");
  const [form, setForm] = useState({
    bloodGroup: "",
    quantity: "",
    collectionDate: ""
  });

  const [availableData, setAvailableData] = useState({});
  const navigate = useNavigate();

  // Fetch current blood stock
  useEffect(() => {
    axios.get("http://localhost:5000/api/blood")
      .then(res => {
        const groupMap = {};
        res.data.forEach(item => {
          groupMap[item.bloodGroup] = (groupMap[item.bloodGroup] || 0) + item.quantity;
        });
        setAvailableData(groupMap);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (!form.bloodGroup || !form.quantity) {
        alert("Please fill all required fields");
        return;
      }

      if (mode === "remove") {
        const available = availableData[form.bloodGroup] || 0;
        if (Number(form.quantity) > available) {
          alert(`❌ Only ${available} units of ${form.bloodGroup} available!`);
          return;
        }

        await axios.post("http://localhost:5000/api/blood/remove", {
          bloodGroup: form.bloodGroup,
          quantity: Number(form.quantity)
        });

        alert("🩸 Blood removed successfully!");
      } else {
        await axios.post("http://localhost:5000/api/blood/add", form);
        alert("✅ Blood added successfully!");
      }

      navigate("/staff-dashboard");

    } catch (err) {
      alert("❌ Operation failed. Please try again.");
    }
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🩸 Update Blood Inventory</h1>
          <p style={styles.subtitle}>Add or remove blood units from stock</p>
        </div>
      </div>

      <div style={styles.mainCard}>

        {/* MODE TOGGLE */}
        <div style={styles.toggleContainer}>
          <button
            style={mode === "add" ? styles.activeToggle : styles.toggleBtn}
            onClick={() => {
              setMode("add");
              setForm(prev => ({ ...prev, collectionDate: "" }));
            }}
          >
            ➕ Add Blood
          </button>

          <button
            style={mode === "remove" ? styles.activeToggle : styles.toggleBtn}
            onClick={() => setMode("remove")}
          >
            ➖ Remove Blood
          </button>
        </div>

        <div style={styles.formArea}>

          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select Blood Group</option>
            {(mode === "add"
              ? ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
              : Object.keys(availableData)
            ).map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          {mode === "remove" && form.bloodGroup && (
            <p style={styles.availableText}>
              Available: <strong>{availableData[form.bloodGroup] || 0} units</strong>
            </p>
          )}

          <input
            name="quantity"
            type="number"
            placeholder="Quantity (Units)"
            value={form.quantity}
            onChange={handleChange}
            style={styles.input}
          />

          {mode === "add" && (
            <input
              name="collectionDate"
              type="date"
              value={form.collectionDate}
              onChange={handleChange}
              style={styles.input}
            />
          )}

          <button onClick={handleSubmit} style={styles.submitBtn}>
            {mode === "add" ? "✅ Add to Inventory" : "🗑️ Remove from Inventory"}
          </button>

        </div>
      </div>
    </div>
  );
}

/* ====================== PREMIUM STYLES ====================== */
const colors = {
  primary: '#c0392b',
  primaryDark: '#a02d23',
  text: '#2c3e50',
  textMuted: '#888',
  border: '#e8e8e8',
  background: '#f8f9fa',
  white: '#ffffff',
  shadowLight: 'rgba(0, 0, 0, 0.09)',
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    padding: '40px 32px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  header: {
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

  subtitle: {
    color: colors.textMuted,
    fontSize: '15.5px',
    marginTop: '4px',
  },

  mainCard: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '480px',
    margin: '0 auto',
    boxShadow: `0 15px 40px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
  },

  toggleContainer: {
    display: 'flex',
    backgroundColor: '#f1f1f1',
    borderRadius: '16px',
    padding: '6px',
    marginBottom: '32px',
  },

  toggleBtn: {
    flex: 1,
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15.5px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  activeToggle: {
    flex: 1,
    padding: '14px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(192, 57, 43, 0.3)',
  },

  formArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  input: {
    padding: '16px 18px',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    fontSize: '15.5px',
    outline: 'none',
    transition: 'border 0.2s',
  },

  availableText: {
    fontSize: '14px',
    color: '#555',
    margin: '4px 0 12px 4px',
    fontWeight: '500',
  },

  submitBtn: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16.5px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
};

export default AddBlood;