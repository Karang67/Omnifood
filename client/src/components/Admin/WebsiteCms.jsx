import { useState, useEffect } from 'react';

const WebsiteCms = ({ activeTab }) => {
    const [subTab, setSubTab] = useState('homepage');
    const [config, setConfig] = useState(null);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // Forms states
    const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', buttonText: 'Order Now', buttonLink: '/menu', priority: 0 });
    const [bannerFile, setBannerFile] = useState(null);

    // Dynamic Lists Form states
    const [featureForm, setFeatureForm] = useState({ id: '', title: '', description: '', icon: 'ion-ios-infinite-outline', isActive: true });
    const [stepForm, setStepForm] = useState({ id: '', stepNumber: '', title: '', description: '', isActive: true });
    const [cityForm, setCityForm] = useState({ id: '', name: '', image: '', eaters: '', chefs: '', twitter: '', isActive: true });
    const [testimonialForm, setTestimonialForm] = useState({ id: '', name: '', role: '', quote: '', rating: 5, imageUrl: '', isActive: true });
    const [planForm, setPlanForm] = useState({ id: '', name: '', price: '', priceMeal: '', featuresRaw: '', popular: false, isActive: true });

    useEffect(() => {
        if (['homepage', 'banners', 'seo'].includes(activeTab)) {
            setSubTab(activeTab);
        }
    }, [activeTab]);

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

    // Generic list items helper
    const handleSaveListItem = async (listName, itemData, formReset) => {
        setAlert({ show: false, type: '', message: '' });
        try {
            let updatedList = [];
            if (itemData.id) {
                // Edit mode
                updatedList = config.homepage[listName].map(item => {
                    const plainItem = item._doc ? { ...item._doc } : { ...item };
                    if (plainItem._id === itemData.id) {
                        const { id, ...rest } = itemData;
                        return { ...plainItem, ...rest, _id: id };
                    }
                    return plainItem;
                });
            } else {
                // Add mode
                updatedList = config.homepage[listName].map(item => item._doc ? { ...item._doc } : { ...item });
                const { id, ...rest } = itemData;
                updatedList.push(rest);
            }

            const updatedHomepage = { ...config.homepage, [listName]: updatedList };
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: 'homepage', data: updatedHomepage })
            });
            const resData = await res.json();
            if (resData.success) {
                setAlert({ show: true, type: 'alert-success', message: 'List updated successfully!' });
                setConfig(resData.config);
                formReset();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteListItem = async (listName, itemId) => {
        if (!confirm('Remove this item?')) return;
        try {
            const updatedList = config.homepage[listName]
                .map(item => item._doc ? { ...item._doc } : { ...item })
                .filter(item => item._id !== itemId);
            const updatedHomepage = { ...config.homepage, [listName]: updatedList };
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: 'homepage', data: updatedHomepage })
            });
            const resData = await res.json();
            if (resData.success) {
                setConfig(resData.config);
            }
        } catch (err) {
            console.error(err);
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
            const res = await fetch('/api/admin/banners', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Banner added!' });
                setBannerForm({ title: '', subtitle: '', buttonText: 'Order Now', buttonLink: '/menu', priority: 0 });
                setBannerFile(null);
                fetchBanners();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteBanner = async (id) => {
        if (!confirm('Remove this banner?')) return;
        try {
            const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchBanners();
        } catch (err) { console.error(err); }
    };

    if (loading || !config) return <div style={{ color: '#fff', padding: '20px' }}>Loading CMS Configurations...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            {/* CMS Navigation Tabs Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                {[
                    { key: 'homepage', label: 'Hero Header' },
                    { key: 'banners', label: 'Banners' },
                    { key: 'features', label: 'Features (Benefits)' },
                    { key: 'steps', label: 'How it Works' },
                    { key: 'cities', label: 'Cities List' },
                    { key: 'testimonials', label: 'Testimonials' },
                    { key: 'plans', label: 'Pricing Plans' },
                    { key: 'seo', label: 'SEO Config' }
                ].map(t => (
                    <button key={t.key} className={`tab-sub-btn ${subTab === t.key ? 'active' : ''}`} onClick={() => setSubTab(t.key)} style={{ background: 'none', border: 'none', color: subTab === t.key ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', padding: '8px 12px' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {alert.show && (
                <div className={`alert ${alert.type}`} style={{ display: 'block', marginBottom: '20px' }}>
                    {alert.message}
                </div>
            )}

            {/* TAB 1: Hero & Visibility Toggles */}
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

            {/* TAB 2: Banners */}
            {subTab === 'banners' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
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
                        <button type="submit" className="btn-submit">Add Banner Card</button>
                    </form>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Active Promotional Banners</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {banners.map(b => (
                                <div key={b._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={b.imageUrl} alt="Banner" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#fff' }}>{b.title}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{b.subtitle}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteBanner(b._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Features */}
            {subTab === 'features' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveListItem('featuresList', featureForm, () => setFeatureForm({ id: '', title: '', description: '', icon: 'ion-ios-infinite-outline', isActive: true }));
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{featureForm.id ? 'Edit Feature Card' : 'Add New Feature Card'}</h3>
                        <div className="form-group">
                            <label>Feature Title</label>
                            <input type="text" className="form-control" value={featureForm.title} onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Description Content</label>
                            <textarea rows="3" className="form-control" value={featureForm.description} onChange={(e) => setFeatureForm({ ...featureForm, description: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Ionicons Icon Identifier Class</label>
                            <input type="text" className="form-control" value={featureForm.icon} onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={featureForm.isActive} onChange={(e) => setFeatureForm({ ...featureForm, isActive: e.target.checked })} />
                            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Visible / Enabled</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-submit">{featureForm.id ? 'Update Feature' : 'Save Feature'}</button>
                            {featureForm.id && <button type="button" className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setFeatureForm({ id: '', title: '', description: '', icon: 'ion-ios-infinite-outline', isActive: true })}>Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Platform Features List</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(config.homepage.featuresList || []).map(feat => (
                                <div key={feat._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{feat.title} {!feat.isActive && <span style={{ color: '#ff7070', fontSize: '0.75rem', marginLeft: '5px' }}>(Disabled)</span>}</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{feat.description.substring(0, 70)}...</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setFeatureForm({ id: feat._id, title: feat.title, description: feat.description, icon: feat.icon || 'ion-ios-infinite-outline', isActive: feat.isActive })} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteListItem('featuresList', feat._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: How it Works */}
            {subTab === 'steps' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveListItem('stepsList', { ...stepForm, stepNumber: parseInt(stepForm.stepNumber) }, () => setStepForm({ id: '', stepNumber: '', title: '', description: '', isActive: true }));
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{stepForm.id ? 'Edit Step details' : 'Add New Step details'}</h3>
                        <div className="form-group">
                            <label>Step Number</label>
                            <input type="number" className="form-control" value={stepForm.stepNumber} onChange={(e) => setStepForm({ ...stepForm, stepNumber: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Step Title</label>
                            <input type="text" className="form-control" value={stepForm.title} onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Description Content</label>
                            <textarea rows="3" className="form-control" value={stepForm.description} onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={stepForm.isActive} onChange={(e) => setStepForm({ ...stepForm, isActive: e.target.checked })} />
                            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Visible / Enabled</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-submit">{stepForm.id ? 'Update Step' : 'Save Step'}</button>
                            {stepForm.id && <button type="button" className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setStepForm({ id: '', stepNumber: '', title: '', description: '', isActive: true })}>Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>How it Works Steps List</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(config.homepage.stepsList || []).sort((a,b) => a.stepNumber - b.stepNumber).map(step => (
                                <div key={step._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>Step {step.stepNumber}: {step.title} {!step.isActive && <span style={{ color: '#ff7070', fontSize: '0.75rem', marginLeft: '5px' }}>(Disabled)</span>}</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{step.description.substring(0, 70)}...</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setStepForm({ id: step._id, stepNumber: step.stepNumber, title: step.title, description: step.description, isActive: step.isActive })} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteListItem('stepsList', step._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: Cities */}
            {subTab === 'cities' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveListItem('citiesList', cityForm, () => setCityForm({ id: '', name: '', image: '', eaters: '', chefs: '', twitter: '', isActive: true }));
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{cityForm.id ? 'Edit City Card' : 'Add New City Card'}</h3>
                        <div className="form-group">
                            <label>City Name</label>
                            <input type="text" className="form-control" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>City Image URL</label>
                            <input type="text" className="form-control" value={cityForm.image} onChange={(e) => setCityForm({ ...cityForm, image: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Eaters Label (e.g. 1,200+ Happy Eaters)</label>
                            <input type="text" className="form-control" value={cityForm.eaters} onChange={(e) => setCityForm({ ...cityForm, eaters: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Chefs Label (e.g. 50+ Top Chefs)</label>
                            <input type="text" className="form-control" value={cityForm.chefs} onChange={(e) => setCityForm({ ...cityForm, chefs: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Twitter Account ID</label>
                            <input type="text" className="form-control" value={cityForm.twitter} onChange={(e) => setCityForm({ ...cityForm, twitter: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={cityForm.isActive} onChange={(e) => setCityForm({ ...cityForm, isActive: e.target.checked })} />
                            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Visible / Enabled</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-submit">{cityForm.id ? 'Update City' : 'Save City'}</button>
                            {cityForm.id && <button type="button" className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setCityForm({ id: '', name: '', image: '', eaters: '', chefs: '', twitter: '', isActive: true })}>Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Active Cities Hub</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(config.homepage.citiesList || []).map(city => (
                                <div key={city._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={city.image || '/static/img/lisbon-3.jpg'} alt="city" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{city.name} {!city.isActive && <span style={{ color: '#ff7070', fontSize: '0.75rem' }}>(Disabled)</span>}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{city.eaters}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setCityForm({ id: city._id, name: city.name, image: city.image, eaters: city.eaters, chefs: city.chefs, twitter: city.twitter, isActive: city.isActive })} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteListItem('citiesList', city._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: Testimonials */}
            {subTab === 'testimonials' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveListItem('testimonialsList', { ...testimonialForm, rating: parseFloat(testimonialForm.rating) }, () => setTestimonialForm({ id: '', name: '', role: '', quote: '', rating: 5, imageUrl: '', isActive: true }));
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{testimonialForm.id ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
                        <div className="form-group">
                            <label>Customer Name</label>
                            <input type="text" className="form-control" value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Company / Role Title</label>
                            <input type="text" className="form-control" value={testimonialForm.role} onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Review Quote</label>
                            <textarea rows="3" className="form-control" value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Rating Score (1-5)</label>
                            <input type="number" step="0.5" min="1" max="5" className="form-control" value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Profile Image URL</label>
                            <input type="text" className="form-control" value={testimonialForm.imageUrl} onChange={(e) => setTestimonialForm({ ...testimonialForm, imageUrl: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={testimonialForm.isActive} onChange={(e) => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })} />
                            <span style={{ color: '#fff', fontSize: '0.9rem' }}>Visible / Enabled</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-submit">{testimonialForm.id ? 'Update Quote' : 'Save Quote'}</button>
                            {testimonialForm.id && <button type="button" className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setTestimonialForm({ id: '', name: '', role: '', quote: '', rating: 5, imageUrl: '', isActive: true })}>Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Customers Feedbacks List</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(config.homepage.testimonialsList || []).map(test => (
                                <div key={test._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <img src={test.imageUrl || '/static/img/customer-1.jpg'} alt="user" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{test.name} {!test.isActive && <span style={{ color: '#ff7070', fontSize: '0.75rem' }}>(Disabled)</span>}</h4>
                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>⭐ {test.rating} ({test.role})</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setTestimonialForm({ id: test._id, name: test.name, role: test.role, quote: test.quote, rating: test.rating, imageUrl: test.imageUrl, isActive: test.isActive })} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteListItem('testimonialsList', test._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 7: Pricing Plans */}
            {subTab === 'plans' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const featuresList = planForm.featuresRaw.split('\n').filter(line => line.trim() !== '');
                        handleSaveListItem('plansList', { ...planForm, features: featuresList }, () => setPlanForm({ id: '', name: '', price: '', priceMeal: '', featuresRaw: '', popular: false, isActive: true }));
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>{planForm.id ? 'Edit Plan details' : 'Add New Plan details'}</h3>
                        <div className="form-group">
                            <label>Plan Name</label>
                            <input type="text" className="form-control" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Base Price ($)</label>
                            <input type="text" className="form-control" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Price Meal Label (e.g. That's only $13.30 per meal)</label>
                            <input type="text" className="form-control" value={planForm.priceMeal} onChange={(e) => setPlanForm({ ...planForm, priceMeal: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Plan Features (One per line)</label>
                            <textarea rows="4" className="form-control" value={planForm.featuresRaw} onChange={(e) => setPlanForm({ ...planForm, featuresRaw: e.target.value })} required />
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <label style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" checked={planForm.popular} onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })} />
                                Mark as 'Best Value' Tag
                            </label>
                            <label style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" checked={planForm.isActive} onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })} />
                                Visible / Enabled
                            </label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-submit">{planForm.id ? 'Update Plan' : 'Save Plan'}</button>
                            {planForm.id && <button type="button" className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={() => setPlanForm({ id: '', name: '', price: '', priceMeal: '', featuresRaw: '', popular: false, isActive: true })}>Cancel</button>}
                        </div>
                    </form>
                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Subscription Pricing Plans</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(config.homepage.plansList || []).map(plan => (
                                <div key={plan._id} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{plan.name} (${plan.price}) {!plan.isActive && <span style={{ color: '#ff7070', fontSize: '0.75rem' }}>(Disabled)</span>}</h4>
                                        <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{plan.priceMeal}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setPlanForm({ id: plan._id, name: plan.name, price: plan.price, priceMeal: plan.priceMeal, featuresRaw: (plan.features || []).join('\n'), popular: plan.popular, isActive: plan.isActive })} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => handleDeleteListItem('plansList', plan._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 8: SEO Configurations */}
            {subTab === 'seo' && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave('seo', config.seo);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
                    <div className="form-group">
                        <label>Meta Header Title Tag</label>
                        <input type="text" className="form-control" value={config.seo.metaTitle} onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaTitle: e.target.value } })} required />
                    </div>
                    <div className="form-group">
                        <label>Meta Header Description Tag</label>
                        <textarea rows="3" className="form-control" value={config.seo.metaDescription} onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaDescription: e.target.value } })} required />
                    </div>
                    <div className="form-group">
                        <label>Meta Index Search Keywords (comma-separated)</label>
                        <input type="text" className="form-control" value={config.seo.keywords} onChange={(e) => setConfig({ ...config, seo: { ...config.seo, keywords: e.target.value } })} required />
                    </div>
                    <button type="submit" className="btn-submit" style={{ width: 'fit-content', padding: '12px 30px' }}>Save SEO Settings</button>
                </form>
            )}
        </div>
    );
};

export default WebsiteCms;
