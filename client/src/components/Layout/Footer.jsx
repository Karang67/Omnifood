import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="row footer-top">
        <div className="footer-col">
          <img src="/static/img/logo.png" alt="Omnifood Logo" className="footer-logo" style={{ filter: 'brightness(0) invert(1)' }} />
          <p className="footer-about-text">
            Bringing chef-crafted healthy diets and organic meals to food lovers worldwide. Experience snack heaven today.
          </p>
          <ul className="social-links">
            <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="ion-social-facebook"></i></a></li>
            <li><a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="ion-social-twitter"></i></a></li>
            <li><a href="https://www.google.com" target="_blank" rel="noopener noreferrer" aria-label="Google"><i className="ion-social-googleplus"></i></a></li>
            <li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="ion-social-instagram"></i></a></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h4>Company</h4>
          <ul className="footer-nav">
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/press">Press Kit</Link></li>
            <li><Link to="/careers">Contact Careers</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Portals</h4>
          <ul className="footer-nav">
            <li><Link to="/menu">Browse Catalog</Link></li>
            <li><Link to="/delivery">Rider Companion</Link></li>
            <li><Link to="/admin">Admin Control Tower</Link></li>
            <li><Link to="/login">Account Login</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Help Center</h4>
          <ul className="footer-nav">
            <li><Link to="/support">Customer Support</Link></li>
            <li><Link to="/safety">Safety &amp; Compliance</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="row footer-bottom">
        <p>Copyright &copy; 2026 by Omnifood, Inc. All rights reserved.</p>
        <p>Designed for premium food experiences worldwide.</p>
      </div>
    </footer>
  );
};

export default Footer;
