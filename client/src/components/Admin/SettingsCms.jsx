import { useState, useEffect } from 'react';

const SettingsCms = ({ activeTab }) => {
    const [subTab, setSubTab] = useState('general');
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        if (activeTab === 'settings-gateways') {
            setSubTab('payments');
        } else if (activeTab === 'settings-fees') {
            setSubTab('delivery');
        } else if (activeTab === 'backups') {
            setSubTab('backups');
        }
    }, [activeTab]);

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/cms/config');
            const data = await res.json();
            setConfig(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const load = async () => {
            await fetchConfig();
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
                setAlert({ show: true, type: 'alert-success', message: 'Settings updated successfully!' });
                setConfig(resData.config);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = (collection) => {
        window.open(`/api/admin/backup/${collection}`, '_blank');
    };

    if (loading || !config) return <div style={{ color: '#fff', padding: '20px' }}>Loading settings...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button className={`tab-sub-btn ${subTab === 'general' ? 'active' : ''}`} onClick={() => setSubTab('general')} style={{ background: 'none', border: 'none', color: subTab === 'general' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>General Settings</button>
                <button className={`tab-sub-btn ${subTab === 'payments' ? 'active' : ''}`} onClick={() => setSubTab('payments')} style={{ background: 'none', border: 'none', color: subTab === 'payments' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Payment Methods</button>
                <button className={`tab-sub-btn ${subTab === 'delivery' ? 'active' : ''}`} onClick={() => setSubTab('delivery')} style={{ background: 'none', border: 'none', color: subTab === 'delivery' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Delivery & Taxes</button>
                <button className={`tab-sub-btn ${subTab === 'backups' ? 'active' : ''}`} onClick={() => setSubTab('backups')} style={{ background: 'none', border: 'none', color: subTab === 'backups' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Database Backups</button>
            </div>

            {alert.show && (
                <div className={`alert ${alert.type}`} style={{ display: 'block', marginBottom: '20px' }}>
                    {alert.message}
                </div>
            )}

            {/* TAB 1: General Settings */}
            {subTab === 'general' && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave('website', config.website);
                    handleConfigSave('theme', config.theme);
                }} className="catalog-grid" style={{ maxWidth: '800px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Platform Details</h3>
                        <div className="form-group">
                            <label>Website Name</label>
                            <input type="text" className="form-control" value={config.website.name} onChange={(e) => setConfig({ ...config, website: { ...config.website, name: e.target.value } })} required />
                        </div>
                        <div className="form-group">
                            <label>Platform Currency</label>
                            <select className="form-control" value={config.website.currency} onChange={(e) => setConfig({ ...config, website: { ...config.website, currency: e.target.value } })}>
                                <option value="USD">USD ($)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Platform Timezone</label>
                            <select className="form-control" value={config.website.timezone} onChange={(e) => setConfig({ ...config, website: { ...config.website, timezone: e.target.value } })}>
                                <option value="America/New_York">Eastern Time (US/Canada)</option>
                                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(226, 55, 68, 0.05)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(226, 55, 68, 0.15)', marginTop: '10px' }}>
                            <span style={{ color: '#ff7070', fontWeight: 600 }}>Enable Maintenance Mode</span>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={config.website.maintenanceMode || false} 
                                    onChange={(e) => setConfig({
                                        ...config,
                                        website: { ...config.website, maintenanceMode: e.target.checked }
                                    })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '10px' }}>
                            <span style={{ color: '#fff', fontWeight: 500 }}>Disable Menu Page</span>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={config.website.disableMenuPage || false} 
                                    onChange={(e) => setConfig({
                                        ...config,
                                        website: { ...config.website, disableMenuPage: e.target.checked }
                                    })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '10px' }}>
                            <span style={{ color: '#fff', fontWeight: 500 }}>Disable Cart Checkout</span>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={config.website.disableCheckoutPage || false} 
                                    onChange={(e) => setConfig({
                                        ...config,
                                        website: { ...config.website, disableCheckoutPage: e.target.checked }
                                    })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Theme Styles</h3>
                        <div className="form-group">
                            <label>Primary Brand Color</label>
                            <input type="color" className="form-control" style={{ height: '40px', padding: '4px' }} value={config.theme.primaryColor} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })} />
                        </div>
                        <div className="form-group">
                            <label>Secondary Accent Color</label>
                            <input type="color" className="form-control" style={{ height: '40px', padding: '4px' }} value={config.theme.secondaryColor} onChange={(e) => setConfig({ ...config, theme: { ...config.theme, secondaryColor: e.target.value } })} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginTop: '10px' }}>
                            <span style={{ color: '#fff', fontWeight: 500 }}>Enable Dark Mode Theme</span>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={config.theme.darkModeEnabled} 
                                    onChange={(e) => setConfig({
                                        ...config,
                                        theme: { ...config.theme, darkModeEnabled: e.target.checked }
                                    })}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <button type="submit" className="btn-submit" style={{ marginTop: '20px' }}>Save Config Details</button>
                    </div>
                </form>
            )}

            {/* TAB 2: Payments */}
            {subTab === 'payments' && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave('payment', config.payment);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '450px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Configure Payment Gateways</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {[
                            { key: 'stripeEnabled', label: 'Stripe Credit Cards' },
                            { key: 'razorpayEnabled', label: 'Razorpay UPI & Cards' },
                            { key: 'codEnabled', label: 'Cash on Delivery (COD)' },
                            { key: 'walletEnabled', label: 'Customer Wallet Payments' }
                        ].map(gateway => (
                            <div key={gateway.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ color: '#fff', fontWeight: 500 }}>{gateway.label}</span>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={config.payment[gateway.key]} 
                                        onChange={(e) => setConfig({
                                            ...config,
                                            payment: { ...config.payment, [gateway.key]: e.target.checked }
                                        })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="btn-submit" style={{ width: 'fit-content', padding: '12px 30px' }}>Save Gateways Settings</button>
                </form>
            )}

            {/* TAB 3: Delivery & Taxes */}
            {subTab === 'delivery' && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleConfigSave('delivery', config.delivery);
                    handleConfigSave('tax', config.tax);
                }} className="catalog-grid" style={{ maxWidth: '800px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Delivery Charges & Limits</h3>
                        <div className="form-group">
                            <label>Standard Delivery Fee</label>
                            <input type="number" step="0.01" className="form-control" value={config.delivery.charge} onChange={(e) => setConfig({ ...config, delivery: { ...config.delivery, charge: parseFloat(e.target.value) } })} required />
                        </div>
                        <div className="form-group">
                            <label>Free Delivery Minimum Threshold</label>
                            <input type="number" step="0.01" className="form-control" value={config.delivery.freeLimit} onChange={(e) => setConfig({ ...config, delivery: { ...config.delivery, freeLimit: parseFloat(e.target.value) } })} required />
                        </div>
                        <div className="form-group">
                            <label>Minimum Order Cap</label>
                            <input type="number" step="0.01" className="form-control" value={config.delivery.minOrder} onChange={(e) => setConfig({ ...config, delivery: { ...config.delivery, minOrder: parseFloat(e.target.value) } })} required />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Taxes & Service Surcharges</h3>
                        <div className="form-group">
                            <label>GST / Sales Tax Rate (%)</label>
                            <input type="number" step="0.1" className="form-control" value={config.tax.gst} onChange={(e) => setConfig({ ...config, tax: { ...config.tax, gst: parseFloat(e.target.value) } })} required />
                        </div>
                        <div className="form-group">
                            <label>Packaging Service Charge</label>
                            <input type="number" step="0.01" className="form-control" value={config.tax.packaging} onChange={(e) => setConfig({ ...config, tax: { ...config.tax, packaging: parseFloat(e.target.value) } })} required />
                        </div>
                        <button type="submit" className="btn-submit" style={{ marginTop: '20px' }}>Save Rates Settings</button>
                    </div>
                </form>
            )}

            {/* TAB 4: Database backups */}
            {subTab === 'backups' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>System DB Backup Export Tools</h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.6 }}>
                        Trigger complete database backups directly to your local file system. 
                        Each export produces a clean JSON file containing full collection documents ready for offline processing or restoring.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button onClick={() => handleExport('users')} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', width: 'auto', padding: '12px 24px', borderRadius: '8px' }}>
                            <i className="ion-person-stalker" style={{ marginRight: '8px' }}></i> Export Customers List
                        </button>
                        <button onClick={() => handleExport('orders')} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', width: 'auto', padding: '12px 24px', borderRadius: '8px' }}>
                            <i className="ion-ios-list" style={{ marginRight: '8px' }}></i> Export Orders Logs
                        </button>
                        <button onClick={() => handleExport('fooditems')} className="btn-submit" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', width: 'auto', padding: '12px 24px', borderRadius: '8px' }}>
                            <i className="ion-ios-nutrition" style={{ marginRight: '8px' }}></i> Export Food Catalog
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsCms;
