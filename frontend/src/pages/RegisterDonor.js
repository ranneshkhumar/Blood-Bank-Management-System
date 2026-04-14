import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterDonor() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    bloodGroup: "",
    quantity: "",
    collectionDate: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.phone || !form.bloodGroup || !form.quantity) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/donor/register", form);
      alert("🎉 Donor Registered Successfully & Blood Added to Inventory!");
      navigate("/staff-dashboard");
    } catch (err) {
      alert("❌ Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>🩸 Register New Donor</h1>
        <p style={styles.subtitle}>Every donation saves lives</p>
      </div>

      <div style={styles.mainCard}>

        <div style={styles.formContainer}>

          <input
            name="name"
            placeholder="Donor Full Name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <div style={styles.twoColumn}>
            <input
              name="age"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

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

          <div style={styles.twoColumn}>
            <input
              name="quantity"
              type="number"
              placeholder="Units Donated"
              value={form.quantity}
              onChange={handleChange}
              style={styles.input}
            />
            <input
              name="collectionDate"
              type="date"
              value={form.collectionDate}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button 
            onClick={handleSubmit} 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Registering Donor..." : "✅ Register Donor & Add Blood"}
          </button>

        </div>
      </div>
    </div>
  );
}

/* ====================== WORLD-CLASS STYLES ====================== */
const colors = {
  primary: '#c0392b',
  primaryDark: '#a02d23',
  text: '#2c3e50',
  textMuted: '#666',
  border: '#e8e8e8',
  background: '#f8f9fa',
  white: '#ffffff',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadow: 'rgba(0, 0, 0, 0.15)',
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    padding: '40px 20px',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },

  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0',
    letterSpacing: '-0.03em',
  },

  subtitle: {
    fontSize: '17px',
    color: colors.textMuted,
    marginTop: '8px',
  },

  mainCard: {
    backgroundColor: colors.white,
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: `0 20px 60px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
  },

  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
  },

  input: {
    padding: '16px 18px',
    fontSize: '16px',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    width: '100%',
  },

  submitBtn: {
    marginTop: '12px',
    padding: '18px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 25px rgba(192, 57, 43, 0.3)',
  },
};

export default RegisterDonor;