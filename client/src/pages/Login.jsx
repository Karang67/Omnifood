import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleGoogleCallback = async (res) => {
    setAlert({ show: false, type: '', message: '' });
    setLoading(true);
    try {
      const result = await loginWithGoogle(res.credential);
      if (result.success) {
        setAlert({
          show: true,
          type: 'alert-success',
          message: `${result.message} Redirecting...`
        });
        
        setTimeout(() => {
          if (result.user.role === 'super_admin') {
            navigate('/admin');
          } else if (result.user.role === 'rider') {
            navigate('/delivery');
          } else {
            navigate('/menu');
          }
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: 'alert-error',
          message: result.message || 'Google Auth failed.'
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'alert-error',
        message: 'Google login failed due to network error.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleBtn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "143055305678-gr960v9o6tnd5ef44f8bc8h0pgo8naij.apps.googleusercontent.com",
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
      }
    };

    if (window.google) {
      initializeGoogleBtn();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google) {
          initializeGoogleBtn();
          clearInterval(interval);
        } else if (attempts >= 30) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        setAlert({
          show: true,
          type: 'alert-success',
          message: `${result.message} Redirecting...`
        });
        
        setTimeout(() => {
          if (result.user.role === 'super_admin') {
            navigate('/admin');
          } else if (result.user.role === 'rider') {
            navigate('/delivery');
          } else {
            navigate('/menu');
          }
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: 'alert-error',
          message: result.message || 'Invalid email or password.'
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        type: 'alert-error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="login-container">
        <div className="header-box">
          <div className="logo-text">Omnifood</div>
          <div className="subtitle">Log in to your account to get healthy meals</div>
        </div>

        {alert.show && (
          <div className={`alert ${alert.type}`} style={{ display: 'block' }}>
            {alert.message}
          </div>
        )}

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <i className="ion-ios-email-outline"></i>
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="ion-ios-locked-outline"></i>
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div id="googleBtn" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', width: '100%' }}></div>

        <div className="switch-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
          <div style={{ marginTop: '15px', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '15px' }}>
            <Link to="/" style={{ fontSize: '0.85rem', color: '#eee', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: 'none' }}>
              <i className="ion-ios-home-outline" style={{ marginRight: '6px', fontSize: '1.1rem', verticalAlign: 'middle' }}></i>Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
