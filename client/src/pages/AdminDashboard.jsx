import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const INR_FACTOR = 80;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();



  // Tab State: matrix, orders, fleet, surge, helpdesk, catalog, analytics
  const [activeTab, setActiveTab] = useState('matrix');

  // Datasets
  const [ordersList, setOrdersList] = useState([]);
  const [fleetList, setFleetList] = useState([]);
  const [surgesList, setSurgesList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [foodsList, setFoodsList] = useState([]);
  const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(false);

  // Compliance Modal state
  const [auditRider, setAuditRider] = useState(null);
  const [complianceModalOpen, setComplianceModalOpen] = useState(false);

  // New Food Catalog Form State
  const [newFood, setNewFood] = useState({
    name: '',
    price: '',
    category: 'Signature',
    imageUrl: '',
    description: '',
  });
  const [uploadImageFile, setUploadImageFile] = useState(null);

  // Support Ticket Reply state
  const [ticketReplies, setTicketReplies] = useState({});

  // Refs for Map & Charts
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const speedChartRef = useRef(null);
  const rejectionChartRef = useRef(null);
  const starChartRef = useRef(null);
  const chartInstances = useRef({ line: null, doughnut: null, bar: null });

  // Security Role Check
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/menu');
    }
  }, [user, navigate]);

  // Initial Data fetcher
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchAllData = async () => {
      await fetchAutoAssignmentStatus();
      await fetchFleet();
      await fetchOrders();
      await fetchSurges();
      await fetchTickets();
      await fetchGourmetCatalog();
    };

    fetchAllData();

    // Poll for orders & fleet coordinates
    const interval = setInterval(async () => {
      await fetchFleet();
      await fetchOrders();
    }, 6000);

    return () => clearInterval(interval);
  }, [user]);

  // 1. Map Initialization and Cleanup
  useEffect(() => {
    if (activeTab === 'matrix' && mapContainerRef.current && window.L) {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = window.L.map(mapContainerRef.current).setView([40.7128, -74.0060], 12);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(mapInstanceRef.current);
      } else {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 200);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [activeTab]);

  // 2. Map GPS Markers update
  useEffect(() => {
    if (activeTab === 'matrix' && mapInstanceRef.current && window.L) {
      const onlineRiders = fleetList.filter(p => p.isOnline);
      const onlineIds = onlineRiders.map(r => r._id);

      // Clear markers for riders that went offline
      Object.keys(markersRef.current).forEach(id => {
        if (!onlineIds.includes(id)) {
          mapInstanceRef.current.removeLayer(markersRef.current[id]);
          delete markersRef.current[id];
        }
      });

      // Add/Update markers
      onlineRiders.forEach(rider => {
        let pinColor = '#e23744';
        if (rider.onboardingStatus === 'Suspended') pinColor = '#95a5a6';

        const customIcon = window.L.divIcon({
          html: `<i class="ion-android-bicycle" style="font-size: 26px; color: ${pinColor}; text-shadow: 0 0 4px #000;"></i>`,
          className: 'rider-gps-marker',
          iconSize: [26, 26]
        });

        const popupHTML = `
          <div style="font-family: 'Outfit', sans-serif; font-size: 0.8rem; line-height: 1.4;">
              <strong style="color: #e23744;">${rider.name}</strong><br>
              <span>Coords: ${rider.lat.toFixed(4)}, ${rider.lng.toFixed(4)}</span><br>
              <span>Speed: ${rider.speed} km/h</span><br>
              <span>License Status: ${rider.onboardingStatus}</span>
          </div>
        `;

        if (markersRef.current[rider._id]) {
          markersRef.current[rider._id].setLatLng([rider.lat, rider.lng]);
          markersRef.current[rider._id].setPopupContent(popupHTML);
        } else {
          const marker = window.L.marker([rider.lat, rider.lng], { icon: customIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(popupHTML);
          markersRef.current[rider._id] = marker;
        }
      });
    }
  }, [activeTab, fleetList]);

  // Analytics charts renderer
  useEffect(() => {
    if (activeTab === 'analytics' && speedChartRef.current && rejectionChartRef.current && starChartRef.current && window.Chart) {
      const drawCharts = async () => {
        try {
          const response = await fetch("/api/admin/analytics");
          const analytics = await response.json();

          // 1. Line Chart
          if (chartInstances.current.line) chartInstances.current.line.destroy();
          chartInstances.current.line = new window.Chart(speedChartRef.current.getContext('2d'), {
            type: 'line',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                label: 'Speed (km/h)',
                data: analytics.speeds,
                borderColor: '#e23744',
                backgroundColor: 'rgba(226, 55, 68, 0.05)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }
          });

          // 2. Doughnut Chart
          if (chartInstances.current.doughnut) chartInstances.current.doughnut.destroy();
          chartInstances.current.doughnut = new window.Chart(rejectionChartRef.current.getContext('2d'), {
            type: 'doughnut',
            data: {
              labels: ['Accepted', 'Rejected'],
              datasets: [{
                data: [analytics.accepted, analytics.rejected],
                backgroundColor: ['#25c577', '#e74c3c'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }
            }
          });

          // 3. Bar Chart
          if (chartInstances.current.bar) chartInstances.current.bar.destroy();
          chartInstances.current.bar = new window.Chart(starChartRef.current.getContext('2d'), {
            type: 'bar',
            data: {
              labels: ['5 Star', '4 Star', '3 Star', '2 Star', '1 Star'],
              datasets: [{
                data: [
                  analytics.ratings.fiveStar,
                  analytics.ratings.fourStar,
                  analytics.ratings.threeStar,
                  analytics.ratings.twoStar,
                  analytics.ratings.oneStar
                ],
                backgroundColor: '#e23744',
                borderRadius: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } }
            }
          });

        } catch (err) {
          console.error(err);
        }
      };

      drawCharts();
    }
  }, [activeTab]);

  // API wrappers
  async function fetchAutoAssignmentStatus() {
    try {
      const res = await fetch("/api/admin/auto-assign/status");
      const data = await res.json();
      setAutoAssignmentEnabled(data.autoAssignmentEnabled);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoAssignToggle = async () => {
    try {
      const res = await fetch("/api/admin/auto-assign/toggle", { method: "POST" });
      const data = await res.json();
      setAutoAssignmentEnabled(data.autoAssignmentEnabled);
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrdersList(data);
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchFleet() {
    try {
      const res = await fetch("/api/admin/delivery-partners");
      const data = await res.json();
      setFleetList(data);
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchSurges() {
    try {
      const res = await fetch("/api/admin/surge");
      const data = await res.json();
      setSurgesList(data);
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchTickets() {
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      setTicketsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  async function fetchGourmetCatalog() {
    try {
      const res = await fetch("/api/food");
      const data = await res.json();
      setFoodsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Assign Rider
  const handleAssignRiderSubmit = async (orderId, partnerId) => {
    if (!partnerId) {
      alert("Please select a rider first.");
      return;
    }
    try {
      const res = await fetch("/api/admin/order/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, partnerId })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compliance functions
  const openAuditModal = (rider) => {
    setAuditRider(rider);
    setComplianceModalOpen(true);
  };

  const handleApproveCompliance = async (partnerId) => {
    try {
      const res = await fetch("/api/admin/delivery/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId })
      });
      const data = await res.json();
      if (data.success) {
        setComplianceModalOpen(false);
        fetchFleet();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSuspension = async (partnerId) => {
    if (!confirm("Are you sure you want to toggle suspension compliance for this rider?")) return;
    try {
      const res = await fetch("/api/admin/delivery/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId })
      });
      const data = await res.json();
      if (data.success) {
        fetchFleet();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Surge Slider Updater
  const handleSurgeUpdate = async (id, multiplier, active) => {
    const surge = surgesList.find(s => s._id === id);
    if (!surge) return;

    // Optimistic UI state update
    setSurgesList(prev => prev.map(s => s._id === id ? { ...s, multiplier, active } : s));

    try {
      await fetch("/api/admin/surge/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneName: surge.zoneName, multiplier, active })
      });
    } catch (e) {
      console.error(e);
      fetchSurges(); // revert on fail
    }
  };

  // Ticket Reply Sender
  const handleTicketReplySubmit = async (ticketId) => {
    const reply = ticketReplies[ticketId] || '';
    if (!reply.trim()) {
      alert("Please enter a reply description before resolving.");
      return;
    }
    try {
      const res = await fetch("/api/admin/ticket/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, reply })
      });
      const data = await res.json();
      if (data.success) {
        setTicketReplies(prev => ({ ...prev, [ticketId]: '' }));
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Food Catalog functions
  const handleFoodFormChange = (e) => {
    const { id, value } = e.target;
    setNewFood(prev => ({ ...prev, [id.replace('f', '').toLowerCase()]: value }));
  };

  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = newFood.imageUrl || '/static/img/1.jpg';

    if (uploadImageFile) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(uploadImageFile);
      });
    }

    try {
      const res = await fetch("/api/admin/food/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFood.name,
          price: parseFloat(newFood.price),
          category: newFood.category,
          description: newFood.description,
          imageUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewFood({ name: '', price: '', category: 'Signature', imageUrl: '', description: '' });
        setUploadImageFile(null);
        fetchGourmetCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id) => {
    if (!confirm("Are you sure you want to remove this gourmet dish from the catalog?")) return;
    try {
      const res = await fetch(`/api/admin/food/delete/${id}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchGourmetCatalog();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  // Render Rider leaderboard mapping
  const renderRiderLeaderboard = () => {
    return fleetList.map(r => {
      const initials = r.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
      const totalEarnings = (r.walletBase + r.walletTips + r.walletIncentives) * INR_FACTOR;
      const ordersDone = ordersList.filter(o => o.deliveryPartner && o.deliveryPartner._id === r._id && o.status === "Delivered").length;
      return {
        id: r._id,
        name: r.name,
        initials,
        isOnline: r.isOnline,
        ordersCount: ordersDone + 8, // Baselines
        earnings: totalEarnings > 0 ? totalEarnings : (ordersDone + 8) * 70,
        rating: r.rating || 4.7
      };
    }).sort((a, b) => b.ordersCount - a.ordersCount).slice(0, 3);
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page-layout">
      {/* Top Banner Header */}
      <header className="admin-header-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/static/img/logo.png" alt="Logo" style={{ height: '35px' }} />
          <h1 style={{ fontSize: '1.4rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>Omnifood Tower</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span className="ops-agent-tag">Ops Agent: {user.name}</span>
          <button className="logout-btn-header" onClick={handleLogoutClick}>Logout</button>
        </div>
      </header>

      <div className="admin-main-container">
        {/* Left Navigation Sidebar */}
        <aside className="admin-sidebar">
          {[
            { id: 'matrix', label: 'Home Matrix', icon: 'ion-ios-analytics' },
            { id: 'orders', label: 'Order Dispatch', icon: 'ion-ios-list' },
            { id: 'fleet', label: 'Fleet Database', icon: 'ion-android-bicycle' },
            { id: 'surge', label: 'Surge Controls', icon: 'ion-ios-speedometer' },
            { id: 'helpdesk', label: 'Incidents Helpdesk', icon: 'ion-ios-chatboxes' },
            { id: 'catalog', label: 'Menu Catalog', icon: 'ion-ios-nutrition' },
            { id: 'analytics', label: 'Insights Analytics', icon: 'ion-arrow-graph-up-right' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Right Dashboard Area */}
        <main className="admin-content-area">

          {/* TAB 1: Home Matrix (Live GPS map & mini ledgers) */}
          <section className={`dashboard-section ${activeTab === 'matrix' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Operations Live Matrix</h2>
            </div>
            
            <div className="matrix-grid">
              <div className="matrix-map-card">
                <h3>Live Dispatch Map Tracking</h3>
                <div id="adminMap" ref={mapContainerRef} style={{ height: '420px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}></div>
              </div>
              
              <div className="matrix-stats-panel">
                <div className="mini-stat-card">
                  <h4>Riders Duty Check</h4>
                  <div className="mini-stat-val" id="activeFleetVal">
                    {fleetList.filter(p => p.isOnline).length}
                  </div>
                  <p>Delivery partners online and tracking GPS location.</p>
                </div>
                
                <div className="mini-stat-card">
                  <h4>Auto-Assignment Dispatch</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '12px' }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={autoAssignmentEnabled}
                        onChange={handleAutoAssignToggle}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong style={{ fontSize: '0.95rem', color: autoAssignmentEnabled ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {autoAssignmentEnabled ? 'Auto-Dispatch Active' : 'Auto-Dispatch Offline'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="matrix-bottom-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', marginTop: '25px' }}>
              <div className="matrix-table-card admin-panel-card" style={{ marginBottom: 0 }}>
                <h3>Recent Placed Orders</h3>
                <div className="table-responsive-card" style={{ border: 'none', boxShadow: 'none' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersList.slice(0, 5).map(order => (
                        <tr key={order._id}>
                          <td>
                            <strong>{order.customerName}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.address}</span>
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{(order.totalAmount * INR_FACTOR).toFixed(0)}</td>
                          <td>
                            <span className={`status-pill ${order.status === 'Out for Delivery' ? 'route' :
                                order.status === 'Delivered' ? 'delivered' : 'prep'
                              }`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                      {ordersList.length === 0 && (
                        <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No delivery orders.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="matrix-table-card admin-panel-card" style={{ marginBottom: 0 }}>
                <h3>Top Performing Riders</h3>
                <div className="mini-leaderboard">
                  {renderRiderLeaderboard().map((r) => (
                    <div key={r.id} className="leader-item">
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="leader-avatar-circle">{r.initials}</div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{r.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>★ {r.rating.toFixed(1)} Rating</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{r.ordersCount} orders</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>₹{r.earnings.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                  {fleetList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No drivers registered.</p>}
                </div>
              </div>
            </div>
          </section>

          {/* TAB 2: Order Dispatch (Complete ledger queue) */}
          <section className={`dashboard-section ${activeTab === 'orders' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Order Dispatch Control Ledger</h2>
            </div>
            
            <div className="table-responsive-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Info</th>
                    <th>Ordered Meals</th>
                    <th>Logistics Specs</th>
                    <th>Pricing Metrics</th>
                    <th>Order Status</th>
                    <th>Assigned Delivery Rider</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map(order => {
                    const dishStr = order.items.map(i => `${i.name} (x${i.quantity})`).join(", ");

                    return (
                      <tr key={order._id}>
                        <td>
                          <strong>{order.customerName}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.phone}</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {order._id.substring(18)}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '200px', fontSize: '0.85rem' }}>{dishStr}</td>
                        <td>
                          <span>{(order.distance * 0.3).toFixed(1)} km</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{order.address}</span>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--accent-green)' }}>₹{(order.deliveryPayout * INR_FACTOR).toFixed(0)}</strong>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tip: ₹{(order.tipAmount * INR_FACTOR).toFixed(0)} (Surge: {order.surgeMultiplier.toFixed(1)}x)</span>
                        </td>
                        <td>
                          <span className={`status-pill ${order.status === 'Out for Delivery' ? 'route' :
                              order.status === 'Delivered' ? 'delivered' : 'prep'
                            }`}>{order.status}</span>
                        </td>
                        <td>
                          {order.deliveryPartner ? (
                            <strong>{order.deliveryPartner.name}</strong>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <select
                                className="form-control"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', width: '120px' }}
                                id={`assignSelect-${order._id}`}
                                defaultValue=""
                              >
                                <option value="" disabled>Select Rider</option>
                                {fleetList.filter(p => p.onboardingStatus === 'Approved').map(rider => (
                                  <option key={rider._id} value={rider._id}>{rider.name} {rider.isOnline ? '(Online)' : '(Offline)'}</option>
                                ))}
                              </select>
                              <button
                                className="btn-header"
                                style={{ backgroundColor: 'var(--accent-red)', color: '#fff', padding: '6px 12px', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
                                onClick={() => {
                                  const selectEl = document.getElementById(`assignSelect-${order._id}`);
                                  handleAssignRiderSubmit(order._id, selectEl.value);
                                }}
                              >
                                Assign
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {ordersList.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customer orders.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* TAB 3: Fleet Database (Compliance, approve, suspend) */}
          <section className={`dashboard-section ${activeTab === 'fleet' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Rider Fleet Directory Database</h2>
            </div>
            
            <div className="table-responsive-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rider Name</th>
                    <th>Settlement Bank Account</th>
                    <th>Current GPS Coordinates</th>
                    <th>Total Duty Earnings</th>
                    <th>Onboarding Compliance</th>
                    <th>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fleetList.map(rider => {
                    const totalBalance = (rider.walletBase + rider.walletTips + rider.walletIncentives) * INR_FACTOR;
                    const isPending = rider.onboardingStatus === 'Pending';
                    const isSuspended = rider.onboardingStatus === 'Suspended';

                    return (
                      <tr key={rider._id}>
                        <td>
                          <strong>{rider.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rider.email}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rider.phone}</span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{rider.bankDetails || 'Not Provided'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {rider.isOnline ? (
                            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{rider.lat.toFixed(4)}, {rider.lng.toFixed(4)}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Offline</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-red)' }}>₹{totalBalance.toFixed(0)}</td>
                        <td>
                          <span className={`status-pill ${rider.onboardingStatus === 'Approved' ? 'delivered' :
                              rider.onboardingStatus === 'Pending' ? 'prep' : 'cancelled'
                            }`}>{rider.onboardingStatus}</span>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Duty: {rider.isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </td>
                        <td>
                          {isPending ? (
                            <button className="btn-header" style={{ backgroundColor: 'var(--accent-red)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '50px', cursor: 'pointer' }} onClick={() => openAuditModal(rider)}>Review Docs</button>
                          ) : (
                            <button
                              className="btn-header"
                              style={{ backgroundColor: isSuspended ? 'var(--accent-green)' : 'var(--accent-red)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '50px', cursor: 'pointer' }}
                              onClick={() => handleToggleSuspension(rider._id)}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {fleetList.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No drivers registered.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* TAB 4: Surge Controls */}
          <section className={`dashboard-section ${activeTab === 'surge' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Regional Delivery Surge Configuration</h2>
            </div>
            
            <div className="admin-panel-card" style={{ padding: '30px' }}>
              <div id="surgeSlidersBox" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {surgesList.map(surge => (
                  <div key={surge._id} className="surge-config-row">
                    <span className="surge-zone-title">{surge.zoneName}</span>
                    <div>
                      <input
                        type="range"
                        className="surge-slider-control"
                        min="1.0"
                        max="3.0"
                        step="0.1"
                        value={surge.multiplier}
                        onChange={(e) => handleSurgeUpdate(surge._id, parseFloat(e.target.value), surge.active)}
                      />
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span>1.0x (Normal)</span>
                        <span>2.0x (Peak)</span>
                        <span>3.0x (Surging Max)</span>
                      </div>
                    </div>
                    <div className="surge-multiplier-text">
                      {surge.multiplier.toFixed(1)}x
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: surge.active ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {surge.active ? 'Surging Active' : 'Surge Off'}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={surge.active}
                          onChange={(e) => handleSurgeUpdate(surge._id, surge.multiplier, e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                ))}
                {surgesList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No surge zones.</p>}
              </div>
            </div>
          </section>

          {/* TAB 5: Incident Support tickets */}
          <section className={`dashboard-section ${activeTab === 'helpdesk' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Operations Incident Helpdesk</h2>
            </div>
            
            <div id="ticketsDeskBox" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {ticketsList.map(ticket => {
                const isResolved = ticket.status === 'Resolved';

                return (
                  <div key={ticket._id} className={`ticket-row ${isResolved ? 'resolved' : ''}`}>
                    <div className="ticket-header-row">
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{ticket.userName} ({ticket.userRole})</span>
                      <span className={`status-pill ${isResolved ? 'delivered' : 'route'}`}>{ticket.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '6px' }}>Subject: {ticket.subject}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Message: {ticket.message}</div>

                    {isResolved ? (
                      <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                        <strong>Operations Tower Reply:</strong> {ticket.reply}
                      </div>
                    ) : (
                      <div className="ticket-reply-box">
                        <input
                          type="text"
                          className="ticket-reply-input"
                          placeholder="Type resolution message..."
                          value={ticketReplies[ticket._id] || ''}
                          onChange={(e) => setTicketReplies({ ...ticketReplies, [ticket._id]: e.target.value })}
                        />
                        <button
                          className="btn-ticket-send"
                          onClick={() => handleTicketReplySubmit(ticket._id)}
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {ticketsList.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No incidents filed.</p>}
            </div>
          </section>

          {/* TAB 6: Menu Catalog Manager (add, delete dishes) */}
          <section className={`dashboard-section ${activeTab === 'catalog' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Menu Catalog Manager</h2>
            </div>
            
            <div className="catalog-grid">
              <div className="catalog-list-card">
                <h3>Current Gourmet Dishes</h3>
                <div id="foodGrid" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '10px' }}>
                  {foodsList.map(food => (
                    <div key={food._id} className="food-item-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img className="food-thumb" src={food.imageUrl} alt={food.name} />
                        <div>
                          <div className="food-name">{food.name}</div>
                          <div className="food-price">${food.price.toFixed(2)} ({food.category})</div>
                        </div>
                      </div>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteFood(food._id)}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="catalog-form-card">
                <h3>Add New Gourmet Dish</h3>
                <form id="foodForm" onSubmit={handleAddFoodSubmit}>
                  <div className="form-group">
                    <label htmlFor="fName">Dish Title Name</label>
                    <input type="text" id="fName" className="form-control" placeholder="e.g. Avocado Toast" value={newFood.name} onChange={handleFoodFormChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fPrice">Price ($ USD)</label>
                    <input type="number" id="fPrice" className="form-control" placeholder="e.g. 12.50" step="0.01" value={newFood.price} onChange={handleFoodFormChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fCategory">Menu Category Classification</label>
                    <select id="fCategory" className="form-control" value={newFood.category} onChange={handleFoodFormChange} required>
                      <option value="Signature">Signature Selection</option>
                      <option value="Healthy">Healthy Organic</option>
                      <option value="Starter">Gourmet Starters</option>
                      <option value="Premium">Premium Delicacies</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fImage">Dish Image URL Link</label>
                    <input type="text" id="fImage" className="form-control" placeholder="/static/img/1.jpg" value={newFood.imageUrl} onChange={handleFoodFormChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fImageFile">Or Local File Upload Image</label>
                    <input type="file" id="fImageFile" className="form-control" onChange={(e) => setUploadImageFile(e.target.files[0])} style={{ padding: '8px 12px' }} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fDesc">Ingredients & Description</label>
                    <textarea id="fDesc" className="form-control" placeholder="e.g. Organic whole wheat bread topped with ripe smashed avocado..." value={newFood.description} onChange={handleFoodFormChange} required style={{ height: '80px' }}></textarea>
                  </div>
                  <button type="submit" className="btn-full-react">Insert Dish to Catalog</button>
                </form>
              </div>
            </div>
          </section>

          {/* TAB 7: Insights Analytics (Chart.js canvas graphs) */}
          <section className={`dashboard-section ${activeTab === 'analytics' ? 'active' : ''}`}>
            <div className="section-header-row">
              <h2>Fleet Performance Analytics</h2>
            </div>
            
            <div className="analytics-grid">
              <div className="chart-card">
                <h3>Avg Logistics Speeds (Weekday)</h3>
                <div style={{ height: '220px', position: 'relative' }}>
                  <canvas id="speedChart" ref={speedChartRef}></canvas>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Order Dispatch Accept/Reject Ratios</h3>
                <div style={{ height: '220px', position: 'relative' }}>
                  <canvas id="rejectionChart" ref={rejectionChartRef}></canvas>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Customer Service Reviews Star Spread</h3>
                <div style={{ height: '220px', position: 'relative' }}>
                  <canvas id="starChart" ref={starChartRef}></canvas>
                </div>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* Compliance Review Modal */}
      {complianceModalOpen && auditRider && (
        <div className="modal-overlay" onClick={() => setComplianceModalOpen(false)}>
          <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 id="docModalRiderName" style={{ margin: 0 }}>Compliance Review</h3>
              <button onClick={() => setComplianceModalOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}>&times;</button>
            </div>

            <div className="doc-previews">
              <div className="doc-preview-item">
                <span>Rider Driving License</span>
                <img src={auditRider.license || '/static/img/1.jpg'} alt="License" onError={(e) => e.target.src = '/static/img/logo.png'} />
              </div>
              <div className="doc-preview-item">
                <span>Vehicle Registration</span>
                <img src={auditRider.vehicle || '/static/img/2.jpg'} alt="Vehicle" onError={(e) => e.target.src = '/static/img/logo.png'} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Direct Bank Account Details</label>
              <input type="text" className="form-control" readOnly value={auditRider.bankDetails || 'Chase Routing Account *8877'} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button
                className="btn-orange"
                onClick={() => handleApproveCompliance(auditRider._id)}
              >
                Approve Compliance Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

