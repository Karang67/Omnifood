import { useState, useEffect } from 'react';

const UserCms = () => {
    const [subTab, setSubTab] = useState('customers');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletAmount, setWalletAmount] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const role = subTab === 'customers' ? 'customer' : 'delivery';
            const res = await fetch(`/api/admin/users?role=${role}`);
            const data = await res.json();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [subTab]);

    const handleBanToggle = async (userId, isBanned) => {
        try {
            const res = await fetch(`/api/admin/users/ban/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBanned })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (e) { console.error(e); }
    };

    const handleRiderApprove = async (userId) => {
        try {
            const res = await fetch("/api/admin/delivery/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ riderId: userId })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (e) { console.error(e); }
    };

    const handleRiderSuspend = async (userId) => {
        try {
            const res = await fetch("/api/admin/delivery/suspend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ riderId: userId })
            });
            const data = await res.json();
            if (data.success) {
                fetchUsers();
            }
        } catch (e) { console.error(e); }
    };

    const handleWalletAdjust = async (userId, action) => {
        if (!walletAmount) return alert("Enter wallet amount!");
        try {
            const res = await fetch(`/api/admin/users/wallet/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: walletAmount, action })
            });
            const data = await res.json();
            if (data.success) {
                setWalletAmount('');
                fetchUsers();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button className={`tab-sub-btn ${subTab === 'customers' ? 'active' : ''}`} onClick={() => setSubTab('customers')} style={{ background: 'none', border: 'none', color: subTab === 'customers' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Customers</button>
                <button className={`tab-sub-btn ${subTab === 'riders' ? 'active' : ''}`} onClick={() => setSubTab('riders')} style={{ background: 'none', border: 'none', color: subTab === 'riders' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Delivery Partners</button>
            </div>

            {loading ? (
                <div style={{ color: '#fff' }}>Loading users directory...</div>
            ) : (
                <div className="table-responsive-card">
                    <table className="admin-table">
                        <thead>
                            {subTab === 'customers' ? (
                                <tr>
                                    <th>Customer Info</th>
                                    <th>Ban Status</th>
                                    <th>Wallet Balance</th>
                                    <th>Adjust Wallet</th>
                                    <th>Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>Rider Info</th>
                                    <th>Vehicle Details</th>
                                    <th>Compliance Status</th>
                                    <th>Wallet Earnings</th>
                                    <th>Administrative Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    {subTab === 'customers' ? (
                                        <>
                                            <td>
                                                <strong>{u.name}</strong>
                                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{u.email}</span>
                                            </td>
                                            <td>
                                                <span className={`status-pill ${u.isBanned ? 'route' : 'delivered'}`}>{u.isBanned ? 'Banned' : 'Active'}</span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#25c577' }}>${(u.walletBalance || 0).toFixed(2)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <input type="number" placeholder="Amt" className="form-control" style={{ width: '80px', padding: '4px' }} value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} />
                                                    <button onClick={() => handleWalletAdjust(u._id, 'credit')} style={{ background: '#25c577', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>+</button>
                                                    <button onClick={() => handleWalletAdjust(u._id, 'debit')} style={{ background: '#e23744', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>-</button>
                                                </div>
                                            </td>
                                            <td>
                                                <button onClick={() => handleBanToggle(u._id, !u.isBanned)} style={{ background: u.isBanned ? 'rgba(37, 197, 119, 0.15)' : 'rgba(226, 55, 68, 0.15)', color: u.isBanned ? '#25c577' : '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    {u.isBanned ? 'Unban User' : 'Ban User'}
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td>
                                                <strong>{u.name}</strong>
                                                <span style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{u.email}</span>
                                            </td>
                                            <td>{u.riderVehicle || "Bicycle"}</td>
                                            <td>
                                                <span className={`status-pill ${u.onboardingStatus === 'Approved' ? 'delivered' : u.onboardingStatus === 'Suspended' ? 'route' : 'prep'}`}>{u.onboardingStatus}</span>
                                            </td>
                                            <td style={{ color: '#25c577' }}>${((u.walletBase || 0) + (u.walletTips || 0)).toFixed(2)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {u.onboardingStatus !== 'Approved' && (
                                                        <button onClick={() => handleRiderApprove(u._id)} style={{ background: '#25c577', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Approve</button>
                                                    )}
                                                    {u.onboardingStatus !== 'Suspended' && (
                                                        <button onClick={() => handleRiderSuspend(u._id)} style={{ background: '#e23744', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Suspend</button>
                                                    )}
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserCms;
