import { useState, useEffect } from 'react';

const RestaurantCms = ({ activeTab }) => {
    const [subTab, setSubTab] = useState('restaurants');

    useEffect(() => {
        if (['restaurants', 'reviews'].includes(activeTab)) {
            setSubTab(activeTab);
        }
    }, [activeTab]);
    const [restaurants, setRestaurants] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // Forms
    const [restForm, setRestForm] = useState({ name: '', owner: '', openingHours: '09:00 AM - 10:00 PM', deliveryRadius: 5, minOrder: 10 });
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const fetchRestaurants = async () => {
        try {
            const res = await fetch('/api/admin/restaurants');
            const data = await res.json();
            setRestaurants(data);
        } catch (err) { console.error(err); }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/admin/reviews');
            const data = await res.json();
            setReviews(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const load = async () => {
            await fetchRestaurants();
            await fetchReviews();
            setLoading(false);
        };
        load();
    }, []);

    const handleCreateRestaurant = async (e) => {
        e.preventDefault();
        setAlert({ show: false, type: '', message: '' });
        
        const formData = new FormData();
        formData.append('name', restForm.name);
        formData.append('owner', restForm.owner);
        formData.append('openingHours', restForm.openingHours);
        formData.append('deliveryRadius', restForm.deliveryRadius);
        formData.append('minOrder', restForm.minOrder);
        if (logoFile) formData.append('logo', logoFile);
        if (bannerFile) formData.append('banner', bannerFile);

        try {
            const res = await fetch('/api/admin/restaurants', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Restaurant created!' });
                setRestForm({ name: '', owner: '', openingHours: '09:00 AM - 10:00 PM', deliveryRadius: 5, minOrder: 10 });
                setLogoFile(null);
                setBannerFile(null);
                fetchRestaurants();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteRestaurant = async (id) => {
        if (!confirm('Remove this restaurant partner?')) return;
        try {
            const res = await fetch(`/api/admin/restaurants/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchRestaurants();
        } catch (err) { console.error(err); }
    };

    const handleReviewAction = async (id, status, isSpam) => {
        try {
            await fetch(`/api/admin/reviews/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, isSpam })
            });
            fetchReviews();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading restaurant partners...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button className={`tab-sub-btn ${subTab === 'restaurants' ? 'active' : ''}`} onClick={() => setSubTab('restaurants')} style={{ background: 'none', border: 'none', color: subTab === 'restaurants' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Partner Restaurants</button>
                <button className={`tab-sub-btn ${subTab === 'reviews' ? 'active' : ''}`} onClick={() => setSubTab('reviews')} style={{ background: 'none', border: 'none', color: subTab === 'reviews' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Reviews Moderation</button>
            </div>

            {alert.show && (
                <div className={`alert ${alert.type}`} style={{ display: 'block', marginBottom: '20px' }}>
                    {alert.message}
                </div>
            )}

            {/* TAB 1: Restaurants CRUD */}
            {subTab === 'restaurants' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                    <form onSubmit={handleCreateRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Add Restaurant Partner</h3>
                        <div className="form-group">
                            <label>Restaurant Name</label>
                            <input type="text" className="form-control" value={restForm.name} onChange={(e) => setRestForm({ ...restForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Owner Name</label>
                            <input type="text" className="form-control" value={restForm.owner} onChange={(e) => setRestForm({ ...restForm, owner: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Logo File</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                        </div>
                        <div className="form-group">
                            <label>Banner File</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
                        </div>
                        <button type="submit" className="btn-submit">Add Partner</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Current Partners</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {restaurants.map(r => (
                                <div key={r._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {r.logoUrl && <img src={r.logoUrl} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />}
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{r.name}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Owner: {r.owner}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteRestaurant(r._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Reviews Moderation */}
            {subTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Reviews Moderation Queue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {reviews.map(r => (
                            <div key={r._id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <div>
                                        <strong style={{ color: '#fff' }}>{r.user?.name || "Customer"}</strong> 
                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginLeft: '10px' }}>on {r.restaurant?.name || "Partner"}</span>
                                    </div>
                                    <div style={{ color: '#f1c40f', fontWeight: 700 }}>★ {r.rating} / 5</div>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: '0 0 12px' }}>"{r.comment}"</p>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button onClick={() => handleReviewAction(r._id, 'Approved')} style={{ background: r.status === 'Approved' ? '#25c577' : 'rgba(255,255,255,0.08)', color: r.status === 'Approved' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Approve</button>
                                    <button onClick={() => handleReviewAction(r._id, 'Rejected')} style={{ background: r.status === 'Rejected' ? '#e23744' : 'rgba(255,255,255,0.08)', color: r.status === 'Rejected' ? '#fff' : 'rgba(255,255,255,0.6)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Reject</button>
                                    <button onClick={() => handleReviewAction(r._id, null, true)} style={{ background: r.isSpam ? '#e67e22' : 'none', border: '1px solid #e67e22', color: '#e67e22', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Spam</button>
                                </div>
                            </div>
                        ))}
                        {reviews.length === 0 && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No reviews found for moderation.</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantCms;
