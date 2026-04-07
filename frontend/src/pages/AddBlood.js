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

  // 🔥 Fetch available blood data
  useEffect(() => {
    axios.get("http://localhost:5000/api/blood")
      .then(res => {
        const groupMap = {};
        res.data.forEach(item => {
          groupMap[item.bloodGroup] =
            (groupMap[item.bloodGroup] || 0) + item.quantity;
        });
        setAvailableData(groupMap);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (mode === "remove") {
        const available = availableData[form.bloodGroup] || 0;

        if (form.quantity > available) {
          alert(`❌ Only ${available} units of ${form.bloodGroup} available`);
          return;
        }

        await axios.post("http://localhost:5000/api/blood/remove", {
          bloodGroup: form.bloodGroup,
          quantity: Number(form.quantity)
        });

        alert("🩸 Blood removed successfully");
      } else {
        await axios.post("http://localhost:5000/api/blood/add", form);
        alert("✅ Blood added successfully");
      }

      navigate("/staff-dashboard");

    } catch {
      alert("❌ Operation failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Update Inventory</h2>

        {/* TOGGLE */}
        <div style={styles.toggleRow}>
          <button
            style={mode === "add" ? styles.activeBtn : styles.btn}
            onClick={() => setMode("add")}
          >
            ➕ Add
          </button>

          <button
            style={mode === "remove" ? styles.activeBtn : styles.btn}
            onClick={() => setMode("remove")}
          >
            ➖ Remove
          </button>
        </div>

        {/* 🔥 BLOOD GROUP DROPDOWN */}
        <select
          name="bloodGroup"
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Select Blood Group</option>

          {(mode === "add"
            ? ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
            : Object.keys(availableData)
          ).map((group, index) => (
            <option key={index} value={group}>
              {group}
            </option>
          ))}
        </select>

        {/* 🔥 AVAILABLE INFO */}
        {mode === "remove" && form.bloodGroup && (
          <p style={{ fontSize: "12px", color: "#555" }}>
            Available: {availableData[form.bloodGroup] || 0} units
          </p>
        )}

        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          onChange={handleChange}
          style={styles.input}
        />

        {mode === "add" && (
          <input
            name="collectionDate"
            type="date"
            onChange={handleChange}
            style={styles.input}
          />
        )}

        <button onClick={handleSubmit} style={styles.submitBtn}>
          {mode === "add" ? "Add Blood" : "Remove Blood"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "350px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#c0392b"
  },
  toggleRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  btn: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    borderRadius: "6px"
  },
  activeBtn: {
    flex: 1,
    padding: "10px",
    background: "#c0392b",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "6px"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd"
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "#c0392b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default AddBlood;