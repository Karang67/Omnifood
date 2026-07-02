import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/' || window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header>
      <nav className={`${scrolled ? 'scrolled' : ''}`}>
        <div className="row nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>
            <img src="/static/img/logo.png" alt="Omnifood Logo" className="logo" />
          </Link>
          
          <button 
            className="mobile-nav-toggle" 
            id="mobileNavToggleBtn" 
            aria-label="Toggle navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={mobileMenuOpen ? 'ion-android-close' : 'ion-android-menu'} id="toggleIcon"></i>
          </button>
          
          <ul className={`main-nav ${mobileMenuOpen ? 'show-nav' : ''}`} id="mainNavLinks">
            <li><a href="#food-delivery" onClick={(e) => { e.preventDefault(); handleNavClick('food-delivery'); }} className="nav-link-span">Food delivery</a></li>
            <li><a href="#How-it-works" onClick={(e) => { e.preventDefault(); handleNavClick('How-it-works'); }} className="nav-link-span">How it works</a></li>
            <li><Link to="/menu" onClick={() => setMobileMenuOpen(false)}>Browse Menu</Link></li>
            <li><a href="#Sign-up" onClick={(e) => { e.preventDefault(); handleNavClick('Sign-up'); }} className="nav-link-span">Contact Us</a></li>
            
            <li>
              <button 
                onClick={toggleTheme} 
                className="theme-toggle-btn" 
                aria-label="Toggle Dark/Light Theme"
                type="button"
              >
                <i className={theme === 'dark' ? 'ion-ios-sunny-outline' : 'ion-ios-moon-outline'}></i>
              </button>
            </li>
            
            {user ? (
              <>
                <li><Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: '500', color: '#e67e22' }}>Profile</Link></li>
                {[
                  { role: 'super_admin', path: '/admin', label: 'Admin Portal' },
                  { role: 'rider', path: '/delivery', label: 'Rider Portal' },
                  { role: 'restaurant_owner', path: '/restaurant-owner', label: 'Restaurant Portal' }
                ].map(portal => user.role === portal.role ? (
                  <li key={portal.role}><Link to={portal.path} onClick={() => setMobileMenuOpen(false)} className="nav-portal-btn">{portal.label}</Link></li>
                ) : null)}
                <li><span className="welcome-text-span" style={{ marginRight: '10px', color: '#555' }}>Hi, {user.name}</span></li>
                <li><button onClick={handleLogoutClick} className="logout-btn-nav-react">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
                <li><Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="nav-btn">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
