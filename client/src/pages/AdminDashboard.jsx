import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Admin/Sidebar';
import DashboardHome from '../components/Admin/DashboardHome';
import WebsiteCms from '../components/Admin/WebsiteCms';
import FoodCms from '../components/Admin/FoodCms';
import RestaurantCms from '../components/Admin/RestaurantCms';
import OrderCms from '../components/Admin/OrderCms';
import UserCms from '../components/Admin/UserCms';
import ContentCms from '../components/Admin/ContentCms';
import SettingsCms from '../components/Admin/SettingsCms';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Security Role Check
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'super_admin') {
      navigate('/access-denied');
    }
  }, [user, navigate]);

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || user.role !== 'super_admin') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b0f19', color: '#fff' }}>
      {/* Dynamic Collapsible Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogoutClick} 
        userName={user.name}
      />

      {/* Main CMS panel viewport */}
      <main style={{ flexGrow: 1, padding: '30px 40px', overflowY: 'auto', height: '100vh' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>Omnifood operations tower management dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="ops-agent-tag" style={{ background: 'rgba(226, 55, 68, 0.15)', color: '#e23744', border: '1px solid rgba(226, 55, 68, 0.3)', padding: '6px 12px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>
              Role: {user.role.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Tab Selection Content viewport */}
        {activeTab === 'dashboard' && <DashboardHome />}
        {(activeTab === 'homepage' || activeTab === 'banners' || activeTab === 'seo') && <WebsiteCms />}
        {(activeTab === 'categories' || activeTab === 'foods' || activeTab === 'coupons' || activeTab === 'offers') && <FoodCms />}
        {(activeTab === 'restaurants' || activeTab === 'reviews') && <RestaurantCms />}
        {(activeTab === 'orders-dispatch' || activeTab === 'refunds') && <OrderCms />}
        {(activeTab === 'customers' || activeTab === 'riders' || activeTab === 'owners') && <UserCms />}
        {(activeTab === 'blogs' || activeTab === 'faqs') && <ContentCms />}
        {(activeTab === 'settings-gateways' || activeTab === 'settings-fees' || activeTab === 'backups') && <SettingsCms />}
      </main>
    </div>
  );
};

export default AdminDashboard;
