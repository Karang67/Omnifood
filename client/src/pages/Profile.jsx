import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/menu.css';

const Profile = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(() => user?.name || '');
  const [phone, setPhone] = useState(() => user?.phone || '');
  const [address, setAddress] = useState(() => user?.address || '');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');

      // Fetch customer order history
      const fetchOrders = async () => {
        try {
          const res = await fetch(`/api/orders/customer/${user.email}`);
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (e) {
          console.error("Failed to fetch customer order history:", e);
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchOrders();
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim()
    };

    updateUserProfile(updatedUser);
    alert("Your profile modifications have been successfully updated!");
  };

  const handleLogoutClick = async () => {
    await logout();
    alert("Logged out successfully.");
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="profile-page-wrapper">
      <div className="static-hero" style={{ background: 'linear-gradient(135deg, #fdfbfa 0%, #fff7f7 100%)', padding: '140px 0 60px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
        <div className="row">
          <h1 style={{ fontSize: '2.8rem', marginBottom: '10px' }}>My Profile</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Manage your user account credentials and delivery settings.</p>
        </div>
      </div>

      <main className="row" style={{ marginTop: '40px' }}>
        <div className="profile-layout-grid">
          
          {/* Column 1: Profile Info Form */}
          <div className="profile-card">
            {/* Header card */}
            <div className="profile-header-card" style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '35px', borderBottom: '1px solid var(--border-color)', paddingBottom: '25px' }}>
              <div className="profile-avatar-large" style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--primary-color)', boxShadow: 'var(--shadow-sm)' }}>
                <img src="/static/img/customer-1.jpg" alt="User Avatar" onError={(e) => { e.target.src = '/static/img/logo.png'; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="profile-header-info">
                <h2 style={{ fontSize: '1.8rem', marginBottom: '5px', fontFamily: "'Outfit', sans-serif" }}>{user.name || 'Guest User'}</h2>
                <span className="profile-role-badge" style={{ display: 'inline-block', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role || 'Customer'}</span>
              </div>
            </div>

            <form id="profileForm" onSubmit={handleSubmit}>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '30px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name" 
                    required 
                    style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', transition: 'var(--transition-smooth)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={user.email || ''} 
                    disabled 
                    style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', transition: 'var(--transition-smooth)', backgroundColor: '#f1f5f9', color: 'var(--text-light)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile contact number" 
                    style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', transition: 'var(--transition-smooth)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Default Delivery Address</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter delivery address" 
                    style={{ padding: '12px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', transition: 'var(--transition-smooth)', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}
                  />
                </div>
              </div>

              <div className="profile-action-buttons" style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" className="btn btn-full" style={{ flexGrow: 1 }}>Save Changes</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleLogoutClick}
                  style={{ flexGrow: 1, backgroundColor: 'transparent', border: '2px solid var(--primary-color)', color: 'var(--primary-color)', cursor: 'pointer' }}
                >
                  Log Out
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: Order History List */}
          <div className="profile-card">
            <h3 className="order-history-title">Order History</h3>
            
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
                Loading order history...
              </div>
            ) : orders.length === 0 ? (
              <div className="order-empty-state">
                <i className="ion-ios-cart-outline"></i>
                <p>No orders placed yet. Select fresh gourmet meals to order!</p>
                <Link to="/menu" className="btn btn-full" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>Order Now</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(o => (
                  <div key={o._id} className="order-history-card">
                    <div className="order-card-header">
                      <div className="order-card-id">
                        Order ID: <span>#{o._id.slice(-8)}</span>
                      </div>
                      <span className={`status-badge ${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {o.status}
                      </span>
                    </div>
                    
                    <div className="order-card-body">
                      <div className="order-body-row">
                        <span>Items:</span>
                        <span className="order-items-list" title={o.items.map(i => `${i.name} x${i.quantity}`).join(", ")}>
                          {o.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                        </span>
                      </div>
                      <div className="order-body-row">
                        <span>Date:</span>
                        <span>{new Date(o.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="order-body-row">
                        <span>Payment:</span>
                        <span>{o.paymentMethod || 'COD'} ({o.paymentStatus || 'Pending'})</span>
                      </div>
                    </div>
                    
                    <div className="order-card-footer">
                      <div className="order-total-amount">
                        ${o.totalAmount.toFixed(2)}
                      </div>
                      <Link to={`/track/${o._id}`} className="btn-track-order-sm">
                        Track Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;
