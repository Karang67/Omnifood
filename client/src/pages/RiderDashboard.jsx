import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/delivery.css';

const INR_FACTOR = 80;

const RiderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  // Tab state: tasks, wallet, ticket, settings
  const [activeTab, setActiveTab] = useState('tasks');

  // Datasets
  const [riderDetails, setRiderDetails] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  // Onboarding Form
  const [onboardingForm, setOnboardingForm] = useState({
    license: '',
    vehicle: '',
    bankDetails: '',
  });

  // Ticket Form
  const [ticketForm, setTicketForm] = useState({
    subject: 'Accident Breakdown',
    message: '',
  });

  // Security Role Check
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'delivery') {
      navigate('/menu');
    }
  }, [user, navigate]);

  // Load Rider Profile & Duties
  async function loadRiderProfile() {
    if (!user || user.role !== 'delivery') return;
    try {
      const res = await fetch("/api/admin/delivery-partners");
      const list = await res.json();
      const match = list.find(r => r.email === user.email);
      if (match) {
        setRiderDetails(match);
        setIsOnline(match.isOnline);
      }
    } catch (e) {
      console.error(e);
    }
  };

  async function loadRiderTasks() {
    if (!user) return;
    try {
      const res = await fetch(`/api/delivery/orders/${user.id}`);
      const data = await res.json();
      setTasksList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRiderProfile();
    loadRiderTasks();

    const taskInterval = setInterval(() => {
      loadRiderTasks();
    }, 6000);

    return () => clearInterval(taskInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Simulated GPS tracker when online
  useEffect(() => {
    if (!isOnline || !user) return;

    const postGpsUpdate = async () => {
      // Downtown Manhattan base coords offset
      const lat = 40.7128 + (Math.random() - 0.5) * 0.02;
      const lng = -74.0060 + (Math.random() - 0.5) * 0.02;
      const speed = Math.floor(15 + Math.random() * 25);

      try {
        await fetch("/api/delivery/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId: user.id, lat, lng, speed })
        });
      } catch (e) {
        console.error("Failed to post GPS coords:", e);
      }
    };

    postGpsUpdate(); // Immediate update
    const gpsInterval = setInterval(postGpsUpdate, 9000);

    return () => clearInterval(gpsInterval);
  }, [isOnline, user]);

  // Availability Toggle
  const handleAvailabilityToggle = async (e) => {
    const checked = e.target.checked;
    if (!user) return;

    try {
      const res = await fetch("/api/delivery/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: user.id, isOnline: checked })
      });
      const data = await res.json();
      if (data.success) {
        setIsOnline(checked);
        loadRiderProfile();
      } else {
        alert(data.message || 'Availability toggle failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not toggle duty availability status.');
    }
  };

  // Onboarding Compliance Upload
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch("/api/delivery/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: user.id,
          license: onboardingForm.license || '/static/img/1.jpg',
          vehicle: onboardingForm.vehicle || '/static/img/2.jpg',
          bankDetails: onboardingForm.bankDetails,
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Compliance credentials uploaded successfully! Awaiting administrator approval.");
        loadRiderProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Task Actions
  const handleAcceptTask = async (orderId) => {
    if (!user) return;
    try {
      const res = await fetch("/api/delivery/order/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, partnerId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        loadRiderTasks();
        loadRiderProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectTask = async (orderId) => {
    if (!user) return;
    try {
      const res = await fetch("/api/delivery/order/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, partnerId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        alert("Order rejected. Recalculating fleet routing.");
        loadRiderTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/delivery/order/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadRiderTasks();
        loadRiderProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Wallet cashout
  const handleCashoutSubmit = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/delivery/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: user.id })
      });
      const data = await res.json();
      if (data.success) {
        alert("Wallet cashed out successfully to bank deposit account!");
        loadRiderProfile();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Ticket
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch("/api/delivery/ticket/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          subject: ticketForm.subject,
          message: ticketForm.message,
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Incident support ticket submitted successfully!");
        setTicketForm({ subject: 'Accident Breakdown', message: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || user.role !== 'delivery') return null;

  // Onboarding compliance dashboard fallback check
  const showOnboarding = !riderDetails || riderDetails.onboardingStatus !== 'Approved';

  return (
    <div className="rider-body delivery-page-layout">
      {/* Top Header Panel */}
      <header className="delivery-header-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/static/img/logo.png" alt="Logo" style={{ height: '35px' }} />
          <h1 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', margin: 0 }}>Rider Companion</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-gray)', fontWeight: 500 }}>Partner: {user.name}</span>
          <button className="logout-btn-header" onClick={handleLogoutClick}>Logout</button>
        </div>
      </header>

      {showOnboarding ? (
        /* ================= COMPLIANCE ONBOARDING SECTION ================= */
        <div className="row" style={{ marginTop: '50px', marginBottom: '80px' }}>
          <div className="onboard-card-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Compliance Profile Onboarding</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-gray)', marginBottom: '30px', fontSize: '0.95rem' }}>
              Upload your documents below to verify your driving account. Status: <strong style={{ color: '#e67e22' }}>{riderDetails ? riderDetails.onboardingStatus : 'Not Onboarded'}</strong>
            </p>

            <form onSubmit={handleOnboardingSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-dark)' }}>Rider License Card Image Link</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. /static/img/1.jpg"
                  value={onboardingForm.license}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, license: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-dark)' }}>Vehicle Registration Document Link</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. /static/img/2.jpg"
                  value={onboardingForm.vehicle}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, vehicle: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-dark)' }}>Direct Bank Deposit Numbers</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bank Account Routing ID *1234"
                  value={onboardingForm.bankDetails}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, bankDetails: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-full-react"
                style={{ width: '100%', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Submit Documents Compliance
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ================= APPROVED RIDER ACTIVE PANEL ================= */
        <div className="delivery-main-container">
          {/* Navigation Sidebar */}
          <aside className="delivery-sidebar">
            <button className={`sidebar-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              <i className="ion-ios-list-outline"></i>
              <span>Assigned Tasks</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
              <i className="ion-ios-calculator-outline"></i>
              <span>Duty Wallet</span>
            </button>
            <button className={`sidebar-btn ${activeTab === 'ticket' ? 'active' : ''}`} onClick={() => setActiveTab('ticket')}>
              <i className="ion-ios-information-outline"></i>
              <span>File Incidents</span>
            </button>
          </aside>

          {/* Core Duty Dashboard Pages */}
          <main className="delivery-content-area">

            {/* TAB 1: Assigned Tasks */}
            {activeTab === 'tasks' && (
              <section className="dashboard-section active">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                  <h2>Assigned Deliveries Queue</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '10px 20px', borderRadius: '100px', border: '1px solid var(--border-color)' }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isOnline}
                        onChange={handleAvailabilityToggle}
                      />
                      <span className="slider"></span>
                    </label>
                    <strong style={{ fontSize: '0.9rem', color: isOnline ? '#25c577' : 'var(--text-light)' }}>
                      {isOnline ? 'Online - Receiving Orders' : 'Offline - Off Duty'}
                    </strong>
                  </div>
                </div>

                <div className="tasks-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {tasksList.map(task => {
                    const isPlaced = task.status === 'Placed';
                    const isPreparing = task.status === 'Preparing';
                    const isOut = task.status === 'Out for Delivery';
                    const isDelivered = task.status === 'Delivered';

                    return (
                      <div key={task._id} className="task-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '15px' }}>
                          <div>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--text-dark)' }}>Recipient: {task.customerName}</strong>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '2px' }}>Phone: {task.phone}</span>
                          </div>
                          <span className={`status-pill ${isDelivered ? 'delivered' : isOut ? 'route' : 'prep'}`}>
                            {task.status}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Items Details</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                              {task.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Drop Location Address</span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 500 }}>
                              {task.address} ({(task.distance * 0.3).toFixed(1)} km)
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Logistics Payout</span>
                            <strong style={{ fontSize: '1.1rem', color: '#25c577' }}>₹{(task.deliveryPayout * INR_FACTOR).toFixed(0)}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-gray)', marginTop: '2px' }}>Tips: ₹{(task.tipAmount * INR_FACTOR).toFixed(0)} (Surge: {task.surgeMultiplier.toFixed(1)}x)</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {isPlaced && (
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                              className="btn-header"
                              style={{ backgroundColor: '#25c577', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, border: 'none' }}
                              onClick={() => handleAcceptTask(task._id)}
                            >
                              Accept Task
                            </button>
                            <button
                              className="btn-header"
                              style={{ backgroundColor: '#e23744', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, border: 'none' }}
                              onClick={() => handleRejectTask(task._id)}
                            >
                              Reject Task
                            </button>
                          </div>
                        )}

                        {isPreparing && (
                          <button
                            className="btn-full-react"
                            style={{ padding: '10px 25px', border: 'none', borderRadius: '8px', background: '#e23744', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => handleUpdateStatus(task._id, 'Out for Delivery')}
                          >
                            Out for Delivery (Pick Up Order)
                          </button>
                        )}

                        {isOut && (
                          <button
                            className="btn-full-react"
                            style={{ padding: '10px 25px', border: 'none', borderRadius: '8px', background: '#25c577', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                            onClick={() => handleUpdateStatus(task._id, 'Delivered')}
                          >
                            Mark Completed (Delivered)
                          </button>
                        )}

                        {isDelivered && (
                          <p style={{ color: '#25c577', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                            ⭐ Payout credited to duty wallet balance. Thank you!
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {tasksList.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '15px' }}>
                      No deliveries assigned to your routing profile. Ensure duty toggle is online.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* TAB 2: Duty Wallet */}
            {activeTab === 'wallet' && riderDetails && (
              <section className="dashboard-section active">
                <h2>Logistics Duty Earnings Wallet</h2>
                <div className="wallet-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div className="wallet-card">
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Base Delivery Payout</span>
                    <strong style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>₹{(riderDetails.walletBase * INR_FACTOR).toFixed(0)}</strong>
                  </div>
                  <div className="wallet-card">
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Customer Tips</span>
                    <strong style={{ fontSize: '1.8rem', color: '#25c577' }}>₹{(riderDetails.walletTips * INR_FACTOR).toFixed(0)}</strong>
                  </div>
                  <div className="wallet-card">
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Loyalty Incentives</span>
                    <strong style={{ fontSize: '1.8rem', color: '#e67e22' }}>₹{(riderDetails.walletIncentives * INR_FACTOR).toFixed(0)}</strong>
                  </div>
                </div>

                <div className="cashout-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-gray)' }}>Direct Settlement Account Routing</span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', color: 'var(--text-dark)' }}>{riderDetails.bankDetails || 'Chase Routing *8877'}</h3>
                  </div>
                  <button
                    className="btn-full-react"
                    onClick={handleCashoutSubmit}
                    disabled={(riderDetails.walletBase + riderDetails.walletTips + riderDetails.walletIncentives) <= 0}
                    style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Request Direct Cash Out
                  </button>
                </div>
              </section>
            )}

            {/* TAB 3: File Support Incidents */}
            {activeTab === 'ticket' && (
              <section className="dashboard-section active">
                <h2>Report Operational Incident</h2>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '15px', padding: '30px', maxWidth: '600px' }}>
                  <form onSubmit={handleTicketSubmit}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label htmlFor="tSubject" style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-dark)' }}>Incident Topic Classification</label>
                      <select
                        id="tSubject"
                        className="form-control"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                        required
                      >
                        <option value="Accident Breakdown">Accident / Vehicle Breakdown</option>
                        <option value="Severe Weather">Severe Weather Obstruction</option>
                        <option value="Customer Dispute">Customer Delivery Address Dispute</option>
                        <option value="Payment Issue">Wallet Settlement Payment Failure</option>
                        <option value="Other Issue">Other Incident Support</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '25px' }}>
                      <label htmlFor="tMessage" style={{ fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-dark)' }}>Describe Incident Message Details</label>
                      <textarea
                        id="tMessage"
                        className="form-control"
                        placeholder="Detail your request to the central Operations Tower..."
                        value={ticketForm.message}
                        onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                        required
                        style={{ height: '120px' }}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn-full-react"
                      style={{ padding: '12px 30px', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      File Incident Support Ticket
                    </button>
                  </form>
                </div>
              </section>
            )}

          </main>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
