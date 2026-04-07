import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';


import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AddBlood from "./pages/AddBlood";
import RegisterDonor from "./pages/RegisterDonor";
import Inventory from "./pages/Inventory";





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
<Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/hospital-dashboard" element={<SuperAdminDashboard />} />
      <Route path="/add-blood" element={<AddBlood />} />
      <Route path="/register-donor" element={<RegisterDonor />} />
      <Route path="/inventory" element={<Inventory />} />
      </Routes>
    
    </Router>
  );
}

export default App;