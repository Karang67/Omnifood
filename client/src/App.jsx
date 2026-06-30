import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
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
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/delivery" element={<RiderDashboard />} />
              <Route path="/track/:orderId" element={<TrackOrder />} />

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
