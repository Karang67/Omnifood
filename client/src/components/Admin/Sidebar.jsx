import { useState } from 'react';
import '../../styles/admin.css';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userName }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({
        website: true,
        food: true,
        restaurant: false,
        orders: false,
        users: false,
        content: false,
        marketing: false,
        settings: false
    });

    const toggleGroup = (group) => {
        setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
    };

    const navGroups = [
        {
            id: "main",
            label: "Main",
            items: [
                { id: "dashboard", label: "Dashboard", icon: "ion-ios-analytics" }
            ]
        },
        {
            id: "website",
            label: "Website Manager",
            items: [
                { id: "homepage", label: "Homepage Hero", icon: "ion-ios-home" },
                { id: "banners", label: "Banner Manager", icon: "ion-images" },
                { id: "seo", label: "SEO Config", icon: "ion-ios-search-strong" }
            ]
        },
        {
            id: "food",
            label: "Food Inventory",
            items: [
                { id: "categories", label: "Categories", icon: "ion-ios-folder" },
                { id: "foods", label: "Food Items", icon: "ion-ios-nutrition" },
                { id: "coupons", label: "Coupon Manager", icon: "ion-ios-pricetag" },
                { id: "offers", label: "Special Offers", icon: "ion-ios-flame" }
            ]
        },
        {
            id: "restaurant",
            label: "Restaurants",
            items: [
                { id: "restaurants", label: "Manage Partners", icon: "ion-ios-home-outline" },
                { id: "reviews", label: "Review Manager", icon: "ion-ios-star-half" }
            ]
        },
        {
            id: "orders",
            label: "Orders Control",
            items: [
                { id: "orders-dispatch", label: "Order Dispatch", icon: "ion-ios-list" },
                { id: "refunds", label: "Refund Requests", icon: "ion-arrow-swap" }
            ]
        },
        {
            id: "users",
            label: "Users & Fleet",
            items: [
                { id: "customers", label: "Customers", icon: "ion-ios-people" },
                { id: "riders", label: "Delivery Partners", icon: "ion-android-bicycle" },
                { id: "owners", label: "Restaurant Owners", icon: "ion-person" }
            ]
        },
        {
            id: "content",
            label: "Content CMS",
            items: [
                { id: "blogs", label: "Blog Manager", icon: "ion-document-text" },
                { id: "faqs", label: "FAQ Manager", icon: "ion-help-circled" }
            ]
        },
        {
            id: "settings",
            label: "System Settings",
            items: [
                { id: "settings-gateways", label: "Payment Setup", icon: "ion-card" },
                { id: "settings-fees", label: "Delivery & Taxes", icon: "ion-ios-calculator" },
                { id: "backups", label: "Data Backups", icon: "ion-archive" }
            ]
        }
    ];

    return (
        <aside className={`admin-sidebar-cms ${collapsed ? 'collapsed' : ''}`} style={{
            width: collapsed ? '80px' : '260px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            transition: 'width 0.3s ease',
            overflowY: 'auto'
        }}>
            {/* Sidebar Header */}
            <div style={{
                padding: '20px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/static/img/logo.png" alt="Logo" style={{ height: '30px' }} />
                        <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem', letterSpacing: '0.5px' }}>TOWER</span>
                    </div>
                )}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: '1.4rem'
                    }}
                >
                    <i className={collapsed ? "ion-navicon" : "ion-chevron-left"}></i>
                </button>
            </div>

            {/* Nav Groups */}
            <div style={{ flexGrow: 1, padding: '16px 8px' }}>
                {navGroups.map((group) => {
                    const isExpanded = expandedGroups[group.id];
                    const isParentGroup = group.id !== "main";

                    return (
                        <div key={group.id} style={{ marginBottom: '12px' }}>
                            {/* Group Header */}
                            {isParentGroup && !collapsed && (
                                <button 
                                    onClick={() => toggleGroup(group.id)}
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.4)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span>{group.label}</span>
                                    <i className={isExpanded ? "ion-chevron-up" : "ion-chevron-down"} style={{ fontSize: '0.6rem' }}></i>
                                </button>
                            )}

                            {/* Group Items */}
                            {(!isParentGroup || isExpanded || collapsed) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    {group.items.map((item) => {
                                        const isActive = activeTab === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    background: isActive ? 'linear-gradient(135deg, #e23744, #cb202d)' : 'none',
                                                    border: 'none',
                                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    fontSize: '0.9rem',
                                                    fontWeight: isActive ? 600 : 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title={collapsed ? item.label : ""}
                                            >
                                                <i className={item.icon} style={{ fontSize: '1.2rem', color: isActive ? '#fff' : '#e23744', minWidth: '20px', textAlign: 'center' }}></i>
                                                {!collapsed && <span>{item.label}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sidebar Footer */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {!collapsed && (
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                        Agent: <strong style={{ color: '#fff' }}>{userName}</strong>
                    </span>
                )}
                <button
                    onClick={onLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: '10px',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(226, 55, 68, 0.1)',
                        border: '1px solid rgba(226, 55, 68, 0.2)',
                        color: '#ff7070',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                    }}
                >
                    <i className="ion-log-out" style={{ fontSize: '1.1rem' }}></i>
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
