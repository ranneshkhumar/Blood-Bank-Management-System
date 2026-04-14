
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

      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      localStorage.setItem('role', role);

      if (role === 'staff') navigate('/staff-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else if (role === 'superadmin') navigate('/hospital-dashboard');
      else if (role === 'hospital') navigate('/hospital-dashboard');
      else navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.loginCard}>

        {/* Hero Header */}
        <div style={styles.header}>
          <div style={styles.logo}>🩸</div>
          <h1 style={styles.title}>Blood Bank</h1>
          <p style={styles.subtitle}>Life Saving Management System</p>
        </div>

        {/* Role Indicators */}
        <div style={styles.roleContainer}>
          <div style={styles.roleChip}>Staff</div>
          <div style={styles.roleChip}>Admin</div>
          <div style={styles.roleChip}>Hospital</div>
        </div>

        <p style={styles.welcomeText}>Sign in to access your dashboard</p>

        <form onSubmit={handleLogin} style={styles.form}>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="role@bloodbank.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button 
            type="submit" 
            style={styles.button} 
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <p style={styles.footerText}>
          Need help? Contact System Administrator
        </p>
      </div>
    </div>
  );
}

/* ====================== WORLD-CLASS LOGIN UI ====================== */
const colors = {
  primary: '#c0392b',
  primaryDark: '#a02d23',
  text: '#2c3e50',
  textMuted: '#666',
  border: '#e0e0e0',
  background: '#f8f9fa',
  white: '#ffffff',
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff8f7 0%, #f8f9fa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  loginCard: {
    backgroundColor: colors.white,
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 70px rgba(192, 57, 43, 0.15)',
    border: `1px solid ${colors.border}`,
  },

  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },

  logo: {
    fontSize: '64px',
    marginBottom: '12px',
  },

  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: colors.primary,
    margin: '0',
    letterSpacing: '-0.03em',
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: '16px',
    marginTop: '6px',
  },

  roleContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '24px',
  },

  roleChip: {
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '700',
    backgroundColor: '#fff0f0',
    color: colors.primary,
  },

  welcomeText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: '15px',
    marginBottom: '28px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontSize: '14.5px',
    fontWeight: '600',
    color: colors.text,
  },

  input: {
    padding: '16px 18px',
    border: `1.5px solid ${colors.border}`,
    borderRadius: '14px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },

  error: {
    color: colors.primary,
    backgroundColor: '#fdecea',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '14px',
    textAlign: 'center',
  },

  button: {
    marginTop: '10px',
    padding: '16px',
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '17px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 8px 25px rgba(192, 57, 43, 0.35)',
  },

  footerText: {
    textAlign: 'center',
    marginTop: '32px',
    color: '#999',
    fontSize: '13px',
  },
};

export default Login;