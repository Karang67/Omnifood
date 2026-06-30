import { useState, useEffect } from 'react';

const WebsiteCms = ({ activeTab }) => {
    const [subTab, setSubTab] = useState('homepage');

    useEffect(() => {
        if (['homepage', 'banners', 'seo'].includes(activeTab)) {
            setSubTab(activeTab);
        }
    }, [activeTab]);
    const [config, setConfig] = useState(null);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // New Banner state
    const [bannerForm, setBannerForm] = useState({
        title: '', subtitle: '', buttonText: 'Order Now', buttonLink: '/menu', priority: 0
    });
    const [bannerFile, setBannerFile] = useState(null);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/cms/config');
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            setBanners(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchConfig();
            await fetchBanners();
            setLoading(false);
        };
        load();
    }, []);

    const handleConfigSave = async (section, data) => {
        setAlert({ show: false, type: '', message: '' });
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, data })
            });
            const resData = await res.json();
            if (resData.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Settings saved successfully!' });
                setConfig(resData.config);
            } else {
                setAlert({ show: true, type: 'alert-error', message: resData.message || 'Save failed.' });
            }
        } catch (err) {
            console.error(err);
            setAlert({ show: true, type: 'alert-error', message: 'Network error. Please try again.' });
        }
    };

    const handleAddBanner = async (e) => {
        e.preventDefault();
        if (!bannerFile) {
            setAlert({ show: true, type: 'alert-error', message: 'Please select a banner image file.' });
            return;
        }

        const formData = new FormData();
        formData.append('image', bannerFile);
        formData.append('title', bannerForm.title);
        formData.append('subtitle', bannerForm.subtitle);
        formData.append('buttonText', bannerForm.buttonText);
        formData.append('buttonLink', bannerForm.buttonLink);
        formData.append('priority', bannerForm.priority);

        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Banner added successfully!' });
                setBannerForm({ title: '', subtitle: '', buttonText: 'Order Now', buttonLink: '/menu', priority: 0 });
                setBannerFile(null);
                fetchBanners();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteBanner = async (id) => {
        if (!confirm('Are you sure you want to remove this banner?')) return;
        try {
            const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchBanners();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading || !config) return <div style={{ color: '#fff', padding: '20px' }}>Loading settings...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button className={`tab-sub-btn ${subTab === 'homepage' ? 'active' : ''}`} onClick={() => setSubTab('homepage')} style={{ background: 'none', border: 'none', color: subTab === 'homepage' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Homepage Hero</button>
                <button className={`tab-sub-btn ${subTab === 'banners' ? 'active' : ''}`} onClick={() => setSubTab('banners')} style={{ background: 'none', border: 'none', color: subTab === 'banners' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Banners Manager</button>
                <button className={`tab-sub-btn ${subTab === 'seo' ? 'active' : ''}`} onClick={() => setSubTab('seo')} style={{ background: 'none', border: 'none', color: subTab === 'seo' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>SEO Configurations</button>
            </div>

            {alert.show && (
                <div className={`alert ${alert.type}`} style={{ display: 'block', marginBottom: '20px' }}>
                    {alert.message}
                </div>
            )}

            {/* TAB 1: Homepage Manager */}
            {subTab === 'homepage' && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave('homepage', config.homepage);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                    <div className="form-group">
                        <label>Hero Heading</label>
                        <input type="text" className="form-control" value={config.homepage.hero.heading} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, heading: e.target.value } } })} required />
                    </div>
                    <div className="form-group">
                        <label>Hero Subheading</label>
                        <input type="text" className="form-control" value={config.homepage.hero.subheading} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, subheading: e.target.value } } })} required />
                    </div>
                    <div className="form-group">
                        <label>Hero Description</label>
                        <textarea rows="3" className="form-control" value={config.homepage.hero.description} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, description: e.target.value } } })} required />
                    </div>
                    <div className="form-group">
                        <label>Hero Call-to-Action Text</label>
                        <input type="text" className="form-control" value={config.homepage.hero.ctaText} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, hero: { ...config.homepage.hero, ctaText: e.target.value } } })} required />
                    </div>
                    
                    <h3 style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px', color: '#fff', fontSize: '1rem' }}>Contact Information</h3>
                    <div className="form-group">
                        <label>Support Phone</label>
                        <input type="text" className="form-control" value={config.homepage.contact.phone} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, contact: { ...config.homepage.contact, phone: e.target.value } } })} />
                    </div>
                    <div className="form-group">
                        <label>Support Email</label>
                        <input type="email" className="form-control" value={config.homepage.contact.email} onChange={(e) => setConfig({ ...config, homepage: { ...config.homepage, contact: { ...config.homepage.contact, email: e.target.value } } })} />
                    </div>

                    <h3 style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px', color: '#fff', fontSize: '1.05rem', margin: 0 }}>Homepage Section Master Toggles</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>Show or hide entire modules on the landing page instantly:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {[
                            { key: 'showHero', label: '1. Hero Section' },
                            { key: 'showFeatures', label: '2. Features Section' },
                            { key: 'showSignatureMeals', label: '3. Signature Dishes' },
                            { key: 'showHowItWorks', label: '4. How it Works (Steps)' },
                            { key: 'showCities', label: '5. Cities Section' },
                            { key: 'showTestimonials', label: '6. Testimonials' },
                            { key: 'showPlans', label: '7. Subscription Plans' },
                            { key: 'showContactForm', label: '8. Contact Feedback Form' }
                        ].map(sec => (
                            <label key={sec.key} style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={config.homepage[sec.key] !== false} 
                                    onChange={(e) => setConfig({
                                        ...config,
                                        homepage: { ...config.homepage, [sec.key]: e.target.checked }
                                    })}
                                />
                                {sec.label}
                            </label>
                        ))}
                    </div>

                    <button type="submit" className="btn-submit" style={{ width: 'fit-content', padding: '12px 30px', marginTop: '10px' }}>Save Homepage Config</button>
                </form>
            )}

            {/* TAB 2: Banners Manager */}
            {subTab === 'banners' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    {/* Add new Banner */}
                    <form onSubmit={handleAddBanner} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Add New Homepage Banner</h3>
                        <div className="form-group">
                            <label>Banner Image</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} required />
                        </div>
                        <div className="form-group">
                            <label>Banner Title</label>
                            <input type="text" className="form-control" placeholder="e.g. 50% Off Happy Hours!" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Banner Subtitle</label>
                            <input type="text" className="form-control" placeholder="e.g. Valid only on Signature meals" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Button Action URL</label>
                            <input type="text" className="form-control" value={bannerForm.buttonLink} onChange={(e) => setBannerForm({ ...bannerForm, buttonLink: e.target.value })} />
                        </div>
                        <button type="submit" className="btn-submit">Upload and Create Banner</button>
                    </form>

                    {/* Banners List */}
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Existing Banners</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {banners.map(b => (
                                <div key={b._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={b.imageUrl} alt="Banner" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{b.title}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Priority: {b.priority}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteBanner(b._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                            {banners.length === 0 && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No active banners found.</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: SEO Configuration */}
            {subTab === 'seo' && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave('seo', config.seo);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                    <div className="form-group">
                        <label>Meta Title</label>
                        <input type="text" className="form-control" value={config.seo.metaTitle} onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaTitle: e.target.value } })} required />
                    </div>
                    <div className="form-group">
                        <label>Meta Description</label>
                        <textarea rows="3" className="form-control" value={config.seo.metaDescription} onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaDescription: e.target.value } })} required />
                    </div>
                    <div className="form-group">
                        <label>Keywords</label>
                        <input type="text" className="form-control" value={config.seo.keywords} onChange={(e) => setConfig({ ...config, seo: { ...config.seo, keywords: e.target.value } })} required />
                    </div>
                    <button type="submit" className="btn-submit" style={{ width: 'fit-content', padding: '12px 30px' }}>Save SEO Meta Config</button>
                </form>
            )}
        </div>
    );
};

export default WebsiteCms;
