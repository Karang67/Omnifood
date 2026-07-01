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
import FeatureManagement from '../components/Admin/FeatureManagement';
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
    <div className="admin-page-shell">
      {/* Dynamic Collapsible Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogoutClick} 
        userName={user.name}
      />

      {/* Main CMS panel viewport */}
      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-title-group">
            <h1 className="admin-dashboard-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h1>
            <span className="admin-dashboard-subtitle">Omnifood operations tower management dashboard</span>
          </div>
          <div className="admin-dashboard-actions">
            <span className="ops-agent-tag admin-dashboard-role-badge">
              Role: {user.role.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Tab Selection Content viewport */}
        {activeTab === 'dashboard' && <DashboardHome />}
        {(activeTab === 'homepage' || activeTab === 'banners' || activeTab === 'seo') && <WebsiteCms activeTab={activeTab} />}
        {(activeTab === 'categories' || activeTab === 'foods' || activeTab === 'coupons' || activeTab === 'offers') && <FoodCms activeTab={activeTab} />}
        {(activeTab === 'restaurants' || activeTab === 'reviews') && <RestaurantCms activeTab={activeTab} />}
        {(activeTab === 'orders-dispatch' || activeTab === 'refunds') && <OrderCms activeTab={activeTab} />}
        {(activeTab === 'customers' || activeTab === 'riders' || activeTab === 'owners') && <UserCms activeTab={activeTab} />}
        {(activeTab === 'blogs' || activeTab === 'faqs') && <ContentCms activeTab={activeTab} />}
        {(activeTab === 'settings-gateways' || activeTab === 'settings-fees' || activeTab === 'backups') && <SettingsCms activeTab={activeTab} />}
        {activeTab === 'feature-flags' && <FeatureManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;
