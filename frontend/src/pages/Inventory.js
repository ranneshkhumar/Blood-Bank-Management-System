import React, { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [details, setDetails] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const res = await axios.get("http://localhost:5000/api/blood");

    const map = {};
    res.data.forEach(item => {
      map[item.bloodGroup] = (map[item.bloodGroup] || 0) + item.quantity;
    });

    setGroups(map);
  };

  const fetchDetails = async (group) => {

  // 🔥 TOGGLE LOGIC
  if (selectedGroup === group) {
    setSelectedGroup("");
    setDetails([]);
    return;
  }

  setSelectedGroup(group);

  const res = await axios.get("http://localhost:5000/api/blood");

  const filtered = res.data.filter(item => item.bloodGroup === group);

  const today = new Date();

  const result = filtered.map(item => {
    const expiry = new Date(item.expiryDate);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    let status;
    if (diff < 0) status = "Expired ❌";
    else if (diff <= 5) status = `${diff} days (⚠️ Expiring)`;
    else status = `${diff} days`;

    return { ...item, status };
  });

  setDetails(result);
};

  return (
    <div style={{ padding: "30px" }}>
      <h1>🩸 Inventory</h1>


      {/* BLOOD GROUP LIST */}
      <h3>Available Blood Groups</h3>
      {Object.keys(groups).map((group, i) => (
        <div key={i}
          onClick={() => fetchDetails(group)}
          style={{
            padding: "10px",
            margin: "5px",
            background: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
        >
          {group} — {groups[group]} units
        </div>
      ))}

      {/* DETAILS */}
      {selectedGroup && (
        <>

          <h2 style={{ marginTop: "20px" }}>
            {selectedGroup} Details
          </h2>
          <div style={styles.headerRow}>
  <span>ID</span>
  <span>Units</span>
  <span>Date</span>
  <span>Status</span>
</div>

          {details.map((item, i) => (
  <div key={i} style={styles.dataRow}>

    <span><strong>{item.bloodId}</strong></span>

    <span>{item.quantity} units</span>

    <span>{new Date(item.collectionDate).toLocaleDateString()}</span>

    <span style={{
      color:
        item.status.includes("Expired") ? "#c0392b" :
        item.status.includes("Expiring") ? "#e67e22" :
        "#1a7a4a"
    }}>
      {item.status}
    </span>

  </div>
))}
        </>
      )}
    </div>
  );
}

const styles = {
  headerRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    padding: "10px 15px",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#555"
  },

  dataRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    alignItems: "center",
    background: "#fff",
    padding: "10px 15px",
    marginBottom: "8px",
    borderRadius: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    fontSize: "14px"
  }
};



export default Inventory;