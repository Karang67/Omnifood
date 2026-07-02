import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/auth.css';

const Signup = () => {
  const { signup, loginWithGoogle } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const isRestaurantOwner = role === 'restaurant_owner';

  useEffect(() => {
    const requestedRole = searchParams.get('role');
    if (requestedRole === 'restaurant_owner') {
      setRole('restaurant_owner');
    }
  }, [searchParams]);

  const getRedirectPath = (role) => {
    if (role === 'super_admin') return '/admin';
    if (role === 'rider') return '/delivery';
    if (role === 'restaurant_owner') return '/restaurant-owner';
    return '/menu';
  };

  const handleGoogleCallback = async (res) => {
    setLoading(true);
    try {
      const result = await loginWithGoogle(res.credential);
      if (result.success) {
        notify({ type: 'success', message: `${result.message} Redirecting...` });
        
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
        notify({ type: 'error', message: result.message || 'Google Auth failed.' });
      }
    } catch (err) {
      console.error(err);
      notify({ type: 'error', message: 'Google registration failed due to network error.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeGoogleBtn = () => {
      if (window.google && !googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "143055305678-gr960v9o6tnd5ef44f8bc8h0pgo8naij.apps.googleusercontent.com",
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleBtn"),
          { theme: "outline", size: "large", width: 300, text: "signup_with" }
        );
        setGoogleInitialized(true);
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
  }, [googleInitialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        notify({ type: 'success', message: `${result.message} Redirecting...` });

        setTimeout(() => {
          if (result.requiresVerification) {
            navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
          } else {
            navigate(getRedirectPath(result.user.role));
          }
        }, 1500);
      } else {
        notify({ type: 'error', message: result.message || 'Registration failed.' });
      }
    } catch (err) {
      console.error(err);
      notify({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="signup-container">
        <div className="header-box">
          <div className="logo-text">Omnifood</div>
          <div className="subtitle">
            {isRestaurantOwner
              ? 'Restaurant owners can register to manage menus and orders.'
              : 'Create an account to order fresh gourmet food'}
          </div>
        </div>


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

          {!isRestaurantOwner && (
            <>
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
            </>
          )}

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
                <option value="rider">Rider (Delivery Partner)</option>
                <option value="restaurant_owner">Restaurant Owner (Manage Restaurant)</option>
              </select>
            </div>
            {isRestaurantOwner && (
              <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '8px' }}>
                Restaurant owners can sign up to manage menu items, orders, and restaurant settings.
              </div>
            )}
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
            {loading ? 'Creating Account...' : isRestaurantOwner ? 'Register as Restaurant Owner' : 'Sign Up'}
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
