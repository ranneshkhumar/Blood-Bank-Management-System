
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, role } = response.data;

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);

      // 🔥 ROLE BASED REDIRECT
      if (role === 'staff') {
        navigate('/staff-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'superadmin') {
        navigate('/hospital-dashboard');
      } else {
        // fallback safety
        navigate('/');
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🩸</div>
          <h1 style={styles.title}>Blood Bank</h1>
          <p style={styles.subtitle}>Management System</p>
        </div>

        {/* Role Info */}
        <div style={styles.roleHints}>
          <div style={{ ...styles.roleChip, backgroundColor: '#eafaf1', color: '#1a7a4a' }}>Staff</div>
          <div style={{ ...styles.roleChip, backgroundColor: '#fdecea', color: '#c0392b' }}>Admin</div>
          <div style={{ ...styles.roleChip, backgroundColor: '#f5eef8', color: '#8e44ad' }}>Hospital</div>
        </div>

        <p style={styles.hintText}>Login with your email & password</p>

        {/* Form */}
        <form onSubmit={handleLogin} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>⚠️ {error}</p>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    width: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logo: {
    fontSize: '50px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#c0392b',
    margin: '0',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    marginTop: '4px',
  },
  roleHints: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  roleChip: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  hintText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '12px',
    marginBottom: '20px',
    marginTop: '0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  error: {
    color: '#c0392b',
    fontSize: '13px',
    backgroundColor: '#fdecea',
    padding: '10px',
    borderRadius: '6px',
    margin: '0',
  },
  button: {
    padding: '12px',
    backgroundColor: '#c0392b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

export default Login;