import React, { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [groups, setGroups] = useState({});
  const [selectedGroup, setSelectedGroup] = useState("");
  const [details, setDetails] = useState([]);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/blood");

      const map = {};
      res.data.forEach(item => {
        map[item.bloodGroup] = (map[item.bloodGroup] || 0) + item.quantity;
      });

      setGroups(map);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetails = async (group) => {
    if (selectedGroup === group) {
      setSelectedGroup("");
      setDetails([]);
      return;
    }

    setSelectedGroup(group);

    try {
      const res = await axios.get("http://localhost:5000/api/blood");
      const filtered = res.data.filter(item => item.bloodGroup === group);

      const today = new Date();

      const result = filtered.map(item => {
        const expiry = new Date(item.expiryDate);
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let status;
        if (diff < 0) status = "Expired ❌";
        else if (diff <= 5) status = `${diff} days (⚠️ Expiring Soon)`;
        else status = `${diff} days remaining`;

        return { ...item, status, daysLeft: diff };
      });

      setDetails(result);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Stats
  const totalUnits = Object.values(groups).reduce((a, b) => a + b, 0);
  const bloodTypesCount = Object.keys(groups).length;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🩸 Blood Inventory Management</h1>
          <p style={styles.welcome}>Real-time stock overview & expiry tracking</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={styles.cardRow}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Blood Units</p>
          <p style={styles.cardValue}>{totalUnits}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Blood Types</p>
          <p style={styles.cardValue}>{bloodTypesCount}</p>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Available Groups</p>
          <p style={styles.cardValue}>{Object.keys(groups).length}</p>
        </div>
      </div>

      {/* BLOOD GROUPS GRID */}
      <h2 style={styles.sectionTitle}>Available Blood Groups</h2>
      <div style={styles.groupsGrid}>
        {Object.keys(groups).length === 0 ? (
          <p style={styles.noData}>No blood stock available</p>
        ) : (
          Object.keys(groups).map((group, i) => (
            <div
              key={i}
              onClick={() => fetchDetails(group)}
              onMouseEnter={() => setHoveredGroup(group)}
              onMouseLeave={() => setHoveredGroup(null)}
              style={
                hoveredGroup === group
                  ? { ...styles.groupCard, ...styles.groupCardHover }
                  : styles.groupCard
              }
            >
              <div style={styles.groupMain}>
                <span style={styles.groupName}>{group}</span>
                <span style={styles.groupUnits}>{groups[group]} units</span>
              </div>
              <div style={styles.clickHint}>Click to view details →</div>
            </div>
          ))
        )}
      </div>

      {/* DETAILS SECTION */}
      {selectedGroup && (
        <div style={styles.detailsSection}>
          <h2 style={styles.sectionTitle}>
            {selectedGroup} — Detailed Inventory
          </h2>

          <div style={styles.tableContainer}>
            {/* Table Header */}
            <div style={styles.headerRow}>
              <span>Blood ID</span>
              <span>Quantity</span>
              <span>Collected On</span>
              <span>Expiry Status</span>
            </div>

            {/* Table Body */}
            {details.map((item, i) => (
              <div
                key={i}
                style={
                  hoveredRow === i
                    ? { ...styles.dataRow, ...styles.dataRowHover }
                    : styles.dataRow
                }
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <span style={{ fontWeight: '600' }}>{item.bloodId}</span>
                <span style={{ fontWeight: '700', fontSize: '16px' }}>
                  {item.quantity} units
                </span>
                <span>
                  {new Date(item.collectionDate).toLocaleDateString('en-IN')}
                </span>
                <span style={{
                  fontWeight: '600',
                  color: item.status.includes("Expired") ? "#c0392b" :
                        item.status.includes("Expiring") ? "#e67e22" : "#1a7a4a"
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== PREMIUM STYLES ====================== */
const colors = {
  primary: '#c0392b',
  text: '#2c3e50',
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
    marginTop: '4px',
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
    flex: '1',
    minWidth: '240px',
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
    marginBottom: '18px',
  },

  groupsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },

  groupCard: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '28px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  groupCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${colors.shadow}`,
  },

  groupMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },

  groupName: {
    fontSize: '24px',
    fontWeight: '800',
    color: colors.primary,
  },

  groupUnits: {
    fontSize: '26px',
    fontWeight: '700',
  },

  clickHint: {
    fontSize: '13px',
    color: '#888',
    textAlign: 'right',
  },

  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: '20px',
    padding: '12px',
    boxShadow: `0 10px 30px ${colors.shadowLight}`,
    border: `1px solid ${colors.border}`,
  },

  headerRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.2fr 1.5fr',
    padding: '18px 24px',
    fontWeight: '600',
    fontSize: '13.8px',
    color: '#555',
    backgroundColor: '#f8f9fa',
    borderRadius: '14px',
    marginBottom: '10px',
  },

  dataRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.2fr 1.5fr',
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

  noData: {
    color: colors.textMuted,
    textAlign: 'center',
    padding: '60px 20px',
    fontSize: '16px',
  },
};

export default Inventory;