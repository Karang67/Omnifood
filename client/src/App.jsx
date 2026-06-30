import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

const PageGuard = ({ children, disabledFlag }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cms/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (config && config.website && config.website[disabledFlag] === true) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#fff', textAlign: 'center', padding: '20px' }}>
        <i className="ion-ios-close-outline" style={{ fontSize: '4.5rem', color: '#e23744', marginBottom: '15px' }}></i>
        <h2 style={{ fontSize: '2rem', margin: '0 0 10px', fontWeight: 700 }}>Service Offline</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem', maxWidth: '400px' }}>This page has been temporarily deactivated by the administrator. Please check back later!</p>
      </div>
    );
  }

  return children;
};
import './styles/style.css';
import './styles/queries.css';

// Pages
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import RiderDashboard from './pages/RiderDashboard';
import TrackOrder from './pages/TrackOrder';
import StaticPages from './pages/StaticPages';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';
import AccessDenied from './pages/AccessDenied';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
        <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <div className="main-content" style={{ flexGrow: 1, marginTop: '80px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={
                <PageGuard disabledFlag="disableMenuPage">
                  <MenuPage />
                </PageGuard>
              } />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/profile" element={
                <PageGuard disabledFlag="disableProfilePage">
                  <Profile />
                </PageGuard>
              } />
              <Route path="/admin" element={
                <PageGuard disabledFlag="disableAdminPage">
                  <ProtectedRoute allowedRoles={['super_admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                </PageGuard>
              } />
              <Route path="/delivery" element={
                <PageGuard disabledFlag="disableDeliveryPage">
                  <ProtectedRoute allowedRoles={['rider', 'super_admin']}>
                    <RiderDashboard />
                  </ProtectedRoute>
                </PageGuard>
              } />
              <Route path="/track/:orderId" element={<TrackOrder />} />
              <Route path="/access-denied" element={<AccessDenied />} />

              {/* Static Pages */}
              <Route path="/about" element={<StaticPages />} />
              <Route path="/press" element={<StaticPages />} />
              <Route path="/careers" element={<StaticPages />} />
              <Route path="/support" element={<StaticPages />} />
              <Route path="/safety" element={<StaticPages />} />
              <Route path="/terms" element={<StaticPages />} />
              <Route path="/privacy" element={<StaticPages />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
