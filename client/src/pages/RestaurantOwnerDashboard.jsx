import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RestaurantOwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyOrder, setBusyOrder] = useState(null);
  const [assigningOrderId, setAssigningOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'restaurant_owner') {
      navigate('/access-denied');
      return;
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/restaurant/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      } else {
        console.error('Failed to load restaurant orders:', data.message);
      }
    } catch (error) {
      console.error('Unable to fetch restaurant orders:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/admin/delivery-partners');
      const data = await res.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Unable to fetch delivery partners:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchOrders(), fetchDrivers()]);
      setLoading(false);
    };

    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setBusyOrder(orderId);
    try {
      const res = await fetch('/api/restaurant/order/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(order => order._id === orderId ? data.order : order));
      } else {
        alert(data.message || 'Could not accept order.');
      }
    } catch (error) {
      console.error('Accept order failed:', error);
      alert('Unable to accept order at this time.');
    } finally {
      setBusyOrder(null);
    }
  };

  const handleAssignDriver = async (orderId, partnerId) => {
    if (!partnerId) return alert('Select a delivery partner first!');
    setAssigningOrderId(orderId);
    try {
      const res = await fetch('/api/restaurant/order/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, partnerId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      } else {
        alert(data.message || 'Could not assign rider.');
      }
    } catch (error) {
      console.error('Driver assignment failed:', error);
      alert('Unable to assign rider at this time.');
    } finally {
      setAssigningOrderId(null);
    }
  };

  return (
    <div style={{ padding: '25px 20px', minHeight: 'calc(100vh - 130px)', background: '#f7f8fb', color: '#1f1f1f' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Restaurant Owner Dashboard</h1>
            <p style={{ margin: '8px 0 0', color: '#555' }}>
              Welcome back, <strong>{user?.name}</strong>. Manage incoming orders for your restaurant.
            </p>
          </div>
          <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: '18px', boxShadow: '0 10px 35px rgba(30, 30, 40, 0.07)' }}>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Assigned restaurant</div>
            <div style={{ marginTop: '6px', fontWeight: '700', fontSize: '1rem' }}>{user?.restaurant || 'Multi-Restaurant Owner'}</div>
          </div>
        </div>

        <section style={{ marginTop: '28px' }}>
          <h2 style={{ marginBottom: '14px', fontSize: '1.2rem' }}>Incoming Orders</h2>
          {loading ? (
            <div style={{ padding: '24px', borderRadius: '18px', background: '#fff', textAlign: 'center' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '24px', borderRadius: '18px', background: '#fff', textAlign: 'center', color: '#666' }}>
              No active orders for your restaurant right now.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '18px' }}>
              {orders.map(order => (
                <div key={order._id} style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 28px rgba(20, 20, 40, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '18px 20px', borderBottom: '1px solid #f0f0f5' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>Order ID</div>
                      <div style={{ fontWeight: 700, marginTop: '6px' }}>{order._id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>Status</div>
                      <div style={{ marginTop: '6px', fontWeight: 700, color: order.status === 'Placed' ? '#e67e22' : order.status === 'Preparing' ? '#25c577' : '#4a90e2' }}>
                        {order.status}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>Restaurant</div>
                      <div style={{ marginTop: '6px', fontWeight: 700 }}>{order.restaurantName || 'Omnifood Marketplace'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>Customer</div>
                      <div style={{ marginTop: '6px', fontWeight: 700 }}>{order.customerName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '18px', padding: '20px' }}>
                    <div>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ color: '#777' }}>Delivery Address</span>
                          <strong>{order.address}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ color: '#777' }}>Order Total</span>
                          <strong>${order.totalAmount.toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ color: '#777' }}>Items</span>
                          <span>{order.items.length} item(s)</span>
                        </div>
                        <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '12px' }}>
                          {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                      <div style={{ padding: '16px', borderRadius: '18px', background: '#f4f8ff', color: '#1f1f1f' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Partner Email</div>
                        <div style={{ marginTop: '6px', fontWeight: 700 }}>{order.restaurantOwnerEmail || 'Not set'}</div>
                      </div>
                      <div style={{ display: 'grid', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {order.status === 'Placed' ? (
                            <button
                              className="btn-submit-order"
                              disabled={busyOrder === order._id}
                              onClick={() => handleAcceptOrder(order._id)}
                              style={{ width: '100%', minWidth: '160px' }}
                            >
                              {busyOrder === order._id ? 'Accepting…' : 'Accept Order'}
                            </button>
                          ) : (
                            <button type="button" disabled style={{ width: '100%', minWidth: '160px', opacity: 0.7 }}>
                              {order.status === 'Preparing' ? 'In Preparation' : 'Order In Progress'}
                            </button>
                          )}
                        </div>

                        {!order.deliveryPartner && order.status !== 'Delivered' && (
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <select
                              className="form-control"
                              style={{ padding: '8px 12px', fontSize: '0.9rem', minWidth: '170px' }}
                              id={`assignSelect-${order._id}`}
                              defaultValue=""
                            >
                              <option value="" disabled>Select Rider</option>
                              {drivers.filter(r => r.onboardingStatus === 'Approved').map(rider => (
                                <option key={rider._id} value={rider._id}>{rider.name}</option>
                              ))}
                            </select>
                            <button
                              className="btn-submit-order"
                              disabled={assigningOrderId === order._id}
                              onClick={() => {
                                const selectEl = document.getElementById(`assignSelect-${order._id}`);
                                handleAssignDriver(order._id, selectEl?.value);
                              }}
                              style={{ minWidth: '160px' }}
                            >
                              {assigningOrderId === order._id ? 'Assigning…' : 'Assign Rider'}
                            </button>
                          </div>
                        )}
                        {order.deliveryPartner && (
                          <div style={{ color: '#555', fontSize: '0.95rem' }}>Rider assigned successfully.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RestaurantOwnerDashboard;
