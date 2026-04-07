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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/donor/register", form);
      alert("✅ Donor registered & blood added");
      navigate("/staff-dashboard");
    } catch {
      alert("❌ Failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Register Donor</h2>

        <input name="name" placeholder="Name" onChange={handleChange} style={styles.input}/>
        <input name="age" type="number" placeholder="Age" onChange={handleChange} style={styles.input}/>
        <input name="phone" placeholder="Phone" onChange={handleChange} style={styles.input}/>

        <select name="bloodGroup" onChange={handleChange} style={styles.input}>
          <option value="">Select Blood Group</option>
          {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
            <option key={bg}>{bg}</option>
          ))}
        </select>

        <input name="quantity" type="number" placeholder="Units" onChange={handleChange} style={styles.input}/>
        <input name="collectionDate" type="date" onChange={handleChange} style={styles.input}/>

        <button onClick={handleSubmit} style={styles.btn}>Submit</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  card: { padding: "30px", background: "#fff", borderRadius: "10px" },
  input: { display: "block", marginBottom: "10px", padding: "10px", width: "250px" },
  btn: { padding: "10px", background: "#c0392b", color: "#fff", border: "none" }
};

export default RegisterDonor;