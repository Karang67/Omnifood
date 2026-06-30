import { useState, useEffect } from 'react';

const FoodCms = () => {
    const [subTab, setSubTab] = useState('categories');
    const [categories, setCategories] = useState([]);
    const [foods, setFoods] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // Forms states
    const [catForm, setCatForm] = useState({ name: '', description: '', displayOrder: 0, visibility: true });
    const [catFile, setCatFile] = useState(null);

    const [foodForm, setFoodForm] = useState({ name: '', description: '', price: '', category: 'Signature', discount: 0, prepTime: 15, inventory: 50 });
    const [foodFile, setFoodFile] = useState(null);

    const [couponForm, setCouponForm] = useState({ code: '', discount: '', type: 'percentage', expiryDate: '', usageLimit: 100, minOrder: 15 });
    const [offerForm, setOfferForm] = useState({ title: '', type: 'Festival Offers', details: '', startDate: '', endDate: '' });

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data);
        } catch (err) { console.error(err); }
    };

    const fetchFoods = async () => {
        try {
            const res = await fetch('/api/food');
            const data = await res.json();
            setFoods(data);
        } catch (err) { console.error(err); }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            setCoupons(data);
        } catch (err) { console.error(err); }
    };

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/admin/offers');
            const data = await res.json();
            setOffers(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const load = async () => {
            await fetchCategories();
            await fetchFoods();
            await fetchCoupons();
            await fetchOffers();
            setLoading(false);
        };
        load();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        setAlert({ show: false, type: '', message: '' });
        const formData = new FormData();
        if (catFile) formData.append('image', catFile);
        formData.append('name', catForm.name);
        formData.append('description', catForm.description);
        formData.append('displayOrder', catForm.displayOrder);
        formData.append('visibility', catForm.visibility);

        try {
            const res = await fetch('/api/admin/categories', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Category created!' });
                setCatForm({ name: '', description: '', displayOrder: 0, visibility: true });
                setCatFile(null);
                fetchCategories();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchCategories();
        } catch (err) { console.error(err); }
    };

    const handleCreateFood = async (e) => {
        e.preventDefault();
        setAlert({ show: false, type: '', message: '' });
        
        let imageUrl = '/static/img/1.jpg';
        if (foodFile) {
            const formData = new FormData();
            formData.append('image', foodFile);
            // We use standard fetch for simple file upload, or base64 format for backward compatibility
            imageUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(foodFile);
            });
        }

        try {
            const res = await fetch('/api/admin/food/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: foodForm.name,
                    price: parseFloat(foodForm.price),
                    category: foodForm.category,
                    description: foodForm.description,
                    imageUrl,
                    discount: parseFloat(foodForm.discount) || 0,
                    prepTime: parseInt(foodForm.prepTime) || 15,
                    inventory: parseInt(foodForm.inventory) || 50
                })
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Food item added successfully!' });
                setFoodForm({ name: '', description: '', price: '', category: 'Signature', discount: 0, prepTime: 15, inventory: 50 });
                setFoodFile(null);
                fetchFoods();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteFood = async (id) => {
        if (!confirm('Remove this food item?')) return;
        try {
            const res = await fetch(`/api/admin/food/delete/${id}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) fetchFoods();
        } catch (err) { console.error(err); }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couponForm)
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Coupon created!' });
                setCouponForm({ code: '', discount: '', type: 'percentage', expiryDate: '', usageLimit: 100, minOrder: 15 });
                fetchCoupons();
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleCoupon = async (id, enabled) => {
        try {
            await fetch(`/api/admin/coupons/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled })
            });
            fetchCoupons();
        } catch (err) { console.error(err); }
    };

    const handleDeleteCoupon = async (id) => {
        if (!confirm('Delete coupon?')) return;
        try {
            await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
            fetchCoupons();
        } catch (err) { console.error(err); }
    };

    const handleCreateOffer = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(offerForm)
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Special offer active!' });
                setOfferForm({ title: '', type: 'Festival Offers', details: '', startDate: '', endDate: '' });
                fetchOffers();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteOffer = async (id) => {
        if (!confirm('Delete offer?')) return;
        try {
            await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
            fetchOffers();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading food controls...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                {['categories', 'foods', 'coupons', 'offers'].map(t => (
                    <button key={t} className={`tab-sub-btn ${subTab === t ? 'active' : ''}`} onClick={() => setSubTab(t)} style={{ background: 'none', border: 'none', color: subTab === t ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', textTransform: 'capitalize' }}>
                        {t === 'foods' ? 'Food Items' : t}
                    </button>
                ))}
            </div>

            {alert.show && (
                <div className={`alert ${alert.type}`} style={{ display: 'block', marginBottom: '20px' }}>
                    {alert.message}
                </div>
            )}

            {/* TAB 1: Categories Manager */}
            {subTab === 'categories' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                    <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Add Category</h3>
                        <div className="form-group">
                            <label>Category Name</label>
                            <input type="text" className="form-control" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" className="form-control" value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Display Order</label>
                            <input type="number" className="form-control" value={catForm.displayOrder} onChange={(e) => setCatForm({ ...catForm, displayOrder: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Category Image</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setCatFile(e.target.files[0])} />
                        </div>
                        <button type="submit" className="btn-submit">Save Category</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Existing Categories</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {categories.map(c => (
                                <div key={c._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={c.imageUrl} alt="Cat" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{c.name}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Sort Order: {c.displayOrder}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteCategory(c._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Food Items Manager */}
            {subTab === 'foods' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                    <form onSubmit={handleCreateFood} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Add Food Item</h3>
                        <div className="form-group">
                            <label>Food Name</label>
                            <input type="text" className="form-control" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Base Price ($)</label>
                            <input type="number" step="0.01" className="form-control" value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-control" value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}>
                                <option value="Signature">Signature</option>
                                <option value="Healthy">Healthy</option>
                                <option value="Starter">Starter</option>
                                <option value="Premium">Premium</option>
                                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea rows="2" className="form-control" value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Food Image</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setFoodFile(e.target.files[0])} />
                        </div>
                        <button type="submit" className="btn-submit">Add Food Item</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Food Catalog</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                            {foods.map(f => (
                                <div key={f._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={f.imageUrl} alt="Food" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{f.name}</h4>
                                            <span style={{ fontSize: '0.85rem', color: '#25c577', fontWeight: 700 }}>${f.price.toFixed(2)}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginLeft: '10px' }}>({f.category})</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteFood(f._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Coupons */}
            {subTab === 'coupons' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                    <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Create Coupon</h3>
                        <div className="form-group">
                            <label>Coupon Code</label>
                            <input type="text" className="form-control" placeholder="e.g. FIFTYOFF" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Discount Value</label>
                            <input type="number" className="form-control" value={couponForm.discount} onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Discount Type</label>
                            <select className="form-control" value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat Cash ($)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Expiry Date</label>
                            <input type="date" className="form-control" value={couponForm.expiryDate} onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn-submit">Add Coupon</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Coupons List</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {coupons.map(c => (
                                <div key={c._id} style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff', letterSpacing: '0.5px' }}>{c.code}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                            Discount: {c.type === 'percentage' ? `${c.discount}%` : `$${c.discount}`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button 
                                            onClick={() => handleToggleCoupon(c._id, !c.enabled)}
                                            style={{
                                                background: c.enabled ? 'rgba(37, 197, 119, 0.15)' : 'rgba(255,255,255,0.08)',
                                                color: c.enabled ? '#25c577' : 'rgba(255,255,255,0.4)',
                                                border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                                            }}
                                        >
                                            {c.enabled ? 'Active' : 'Disabled'}
                                        </button>
                                        <button onClick={() => handleDeleteCoupon(c._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: Offers */}
            {subTab === 'offers' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                    <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Create Offer</h3>
                        <div className="form-group">
                            <label>Offer Title</label>
                            <input type="text" className="form-control" value={offerForm.title} onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Offer Type</label>
                            <select className="form-control" value={offerForm.type} onChange={(e) => setOfferForm({ ...offerForm, type: e.target.value })}>
                                <option value="Festival Offers">Festival Offers</option>
                                <option value="Combo Offers">Combo Offers</option>
                                <option value="Happy Hours">Happy Hours</option>
                                <option value="Buy One Get One">Buy One Get One</option>
                                <option value="Free Delivery">Free Delivery</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input type="date" className="form-control" value={offerForm.startDate} onChange={(e) => setOfferForm({ ...offerForm, startDate: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input type="date" className="form-control" value={offerForm.endDate} onChange={(e) => setOfferForm({ ...offerForm, endDate: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn-submit">Launch Offer</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Active Promotions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {offers.map(o => (
                                <div key={o._id} style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>{o.title}</h4>
                                        <span style={{ fontSize: '0.8rem', color: '#e23744', fontWeight: 600 }}>{o.type}</span>
                                    </div>
                                    <button onClick={() => handleDeleteOffer(o._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodCms;
