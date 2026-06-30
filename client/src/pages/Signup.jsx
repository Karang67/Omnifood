import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Signup = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
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
          if (result.user.role === 'admin') {
            navigate('/admin');
          } else if (result.user.role === 'delivery') {
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
        message: 'Google registration failed due to network error.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "143055305678-gr960v9o6tnd5ef44f8bc8h0pgo8naij.apps.googleusercontent.com",
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%", text: "signup_with" }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, type: '', message: '' });
    setLoading(true);

    try {
      const result = await signup({
        name,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        role,
        password
      });

      if (result.success) {
        setAlert({
          show: true,
          type: 'alert-success',
          message: `${result.message} Redirecting...`
        });

        setTimeout(() => {
          if (result.requiresVerification) {
            navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
          } else {
            if (result.user.role === 'admin') {
              navigate('/admin');
            } else if (result.user.role === 'delivery') {
              navigate('/delivery');
            } else {
              navigate('/menu');
            }
          }
        }, 1500);
      } else {
        setAlert({
          show: true,
          type: 'alert-error',
          message: result.message || 'Registration failed.'
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
      <div className="signup-container">
        <div className="header-box">
          <div className="logo-text">Omnifood</div>
          <div className="subtitle">Create an account to order fresh gourmet food</div>
        </div>

        {alert.show && (
          <div className={`alert ${alert.type}`} style={{ display: 'block' }}>
            {alert.message}
          </div>
        )}

        <form id="signupForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <i className="ion-ios-person-outline"></i>
              <input 
                type="text" 
                id="name" 
                className="form-control" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <i className="ion-ios-telephone-outline"></i>
              <input 
                type="tel" 
                id="phone" 
                className="form-control" 
                placeholder="Enter your mobile number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Delivery Address</label>
            <div className="input-wrapper">
              <i className="ion-ios-location-outline"></i>
              <input 
                type="text" 
                id="address" 
                className="form-control" 
                placeholder="Enter your delivery address" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Register As</label>
            <div className="input-wrapper">
              <i className="ion-ios-people-outline"></i>
              <select 
                id="role" 
                className="form-control" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={loading}
              >
                <option value="customer">Customer (Order Food)</option>
                <option value="admin">Administrator (Manage System)</option>
                <option value="delivery">Delivery Partner (Deliver Food)</option>
              </select>
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
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div id="googleBtn" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', width: '100%' }}></div>

        <div className="switch-link">
          Already have an account? <Link to="/login">Login here</Link>
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

export default Signup;
