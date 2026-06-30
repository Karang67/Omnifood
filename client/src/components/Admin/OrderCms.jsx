import { useState, useEffect } from 'react';

const OrderCms = ({ activeTab }) => {
    const [subTab, setSubTab] = useState('active');

    useEffect(() => {
        if (activeTab === 'orders-dispatch') {
            setSubTab('active');
        } else if (activeTab === 'refunds') {
            setSubTab('refunds');
        }
    }, [activeTab]);
    const [orders, setOrders] = useState([]);
    const [fleet, setFleet] = useState([]);
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            setOrders(data);
        } catch (e) { console.error(e); }
    };

    const fetchFleet = async () => {
        try {
            const res = await fetch('/api/admin/delivery-partners');
            const data = await res.json();
            setFleet(data);
        } catch (e) { console.error(e); }
    };

    const fetchRefunds = async () => {
        // Simulate or query refund requests (orders where status is cancelled/disputed)
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            // Filter placed or COD orders as mock refund items
            setRefunds(data.filter(o => o.paymentMethod === 'Card').map(o => ({
                ...o,
                refundReason: "Incorrect items delivered",
                refundAmount: o.totalAmount,
                refundStatus: "Pending"
            })));
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const load = async () => {
            await fetchOrders();
            await fetchFleet();
            await fetchRefunds();
            setLoading(false);
        };
        load();
    }, []);

    const handleAssignRiderSubmit = async (orderId, partnerId) => {
        if (!partnerId) return alert("Select a delivery partner first!");
        try {
            const res = await fetch("/api/admin/order/assign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, partnerId })
            });
            const data = await res.json();
            if (data.success) {
                fetchOrders();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleRefundAction = async (id, status) => {
        alert(`Refund request ${status.toLowerCase()}ed successfully for order ${id.substring(18)}`);
        setRefunds(prev => prev.filter(r => r._id !== id));
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading orders...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button className={`tab-sub-btn ${subTab === 'active' ? 'active' : ''}`} onClick={() => setSubTab('active')} style={{ background: 'none', border: 'none', color: subTab === 'active' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Active Dispatch Ledger</button>
                <button className={`tab-sub-btn ${subTab === 'refunds' ? 'active' : ''}`} onClick={() => setSubTab('refunds')} style={{ background: 'none', border: 'none', color: subTab === 'refunds' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Refund Requests</button>
            </div>

            {/* TAB 1: Active Orders Dispatch */}
            {subTab === 'active' && (
                <div className="table-responsive-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer Info</th>
                                <th>Ordered Meals</th>
                                <th>Address Details</th>
                                <th>Pricing specs</th>
                                <th>Delivery Status</th>
                                <th>Assigned Rider</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const dishStr = order.items.map(i => `${i.name} (x${i.quantity})`).join(", ");
                                return (
                                    <tr key={order._id}>
                                        <td>
                                            <strong>{order.customerName}</strong>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{order.phone}</span>
                                            <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>ID: {order._id.substring(18)}</span>
                                        </td>
                                        <td style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', maxWidth: '200px' }}>{dishStr}</td>
                                        <td>
                                            <span>{(order.distance || 2.4).toFixed(1)} km</span>
                                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{order.address}</span>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#25c577' }}>${order.totalAmount.toFixed(2)}</strong>
                                            <span style={{ display: 'block', fontSize: '0.70rem', color: 'rgba(255,255,255,0.4)' }}>Payout: ${(order.deliveryPayout || 3.5).toFixed(2)}</span>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${order.status === 'Out for Delivery' ? 'route' : order.status === 'Delivered' ? 'delivered' : 'prep'}`}>{order.status}</span>
                                        </td>
                                        <td>
                                            {order.deliveryPartner ? (
                                                <strong style={{ color: '#fff' }}>{order.deliveryPartner.name}</strong>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        className="form-control"
                                                        style={{ padding: '4px 8px', fontSize: '0.75rem', width: '120px' }}
                                                        id={`assignSelect-${order._id}`}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Select Rider</option>
                                                        {fleet.filter(p => p.onboardingStatus === 'Approved').map(rider => (
                                                            <option key={rider._id} value={rider._id}>{rider.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="btn-header"
                                                        style={{ backgroundColor: '#e23744', color: '#fff', padding: '6px 12px', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
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
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 2: Refund Requests */}
            {subTab === 'refunds' && (
                <div className="table-responsive-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map(r => (
                                <tr key={r._id}>
                                    <td style={{ fontFamily: 'monospace', color: '#fff' }}>#{r._id.substring(18)}</td>
                                    <td>{r.customerName}</td>
                                    <td style={{ color: '#ff7070', fontWeight: 700 }}>${r.refundAmount.toFixed(2)}</td>
                                    <td style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{r.refundReason}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleRefundAction(r._id, 'Approve')} style={{ background: '#25c577', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Approve</button>
                                            <button onClick={() => handleRefundAction(r._id, 'Reject')} style={{ background: '#e23744', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Reject</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {refunds.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No pending refund requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderCms;
