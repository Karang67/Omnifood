import { useEffect, useMemo, useState } from 'react';

const emptyFeature = {
  enabled: true,
  visible: true,
  roles: [],
  apiEnabled: true,
  maintenance: false,
  beta: false,
  publicAccess: false,
  mobileEnabled: true,
  desktopEnabled: true,
  readOnly: false,
  order: 0
};

const moduleOrder = ['Home', 'Authentication', 'Customer', 'Rider', 'Admin', 'System'];

const FeatureManagement = () => {
  const [tree, setTree] = useState([]);
  const [expandedModules, setExpandedModules] = useState({ Home: true, Authentication: true, Customer: true, Rider: true, Admin: true, System: true });
  const [selectedSlug, setSelectedSlug] = useState('hero-search-bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [importValue, setImportValue] = useState('');

  async function fetchFeatures() {
    try {
      const response = await fetch('/api/admin/features');
      const data = await response.json();
      setTree(data.tree || []);
      if (data.tree?.length) {
        const firstFeature = data.tree.flatMap((group) => group.flags || []).find(Boolean);
        if (firstFeature) setSelectedSlug(firstFeature.slug);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuditLogs(page = 1) {
    try {
      const response = await fetch(`/api/admin/features/audit?page=${page}&limit=8`);
      const data = await response.json();
      setAuditLogs(data.logs || []);
      setAuditTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchFeatures();
    fetchAuditLogs(1);
  }, []);

  const features = useMemo(() => tree.flatMap((group) => group.flags || []), [tree]);

  const filteredFeatures = useMemo(() => {
    return features.filter((flag) => {
      const matchesSearch = `${flag.name} ${flag.slug} ${flag.module}`.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'enabled') return flag.enabled;
      if (filter === 'disabled') return !flag.enabled;
      if (filter === 'beta') return flag.beta;
      if (filter === 'maintenance') return flag.maintenance;
      return true;
    });
  }, [features, filter, searchTerm]);

  const selectedFeature = features.find((flag) => flag.slug === selectedSlug) || null;

  const toggleFeature = async (field, value) => {
    if (!selectedFeature) return;
    const nextValue = value;
    try {
      await fetch(`/api/admin/features/${selectedFeature.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: nextValue })
      });
      await fetchFeatures();
    } catch (error) {
      console.error(error);
    }
  };

  const bulkAction = async (action) => {
    try {
      const response = await fetch('/api/admin/features/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (response.ok) {
        await fetchFeatures();
        if (action === 'export') {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.flags, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'feature-flags.json';
          link.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importValue);
      const response = await fetch('/api/admin/features/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', payload: parsed })
      });
      if (response.ok) {
        setImportValue('');
        await fetchFeatures();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const statusBadge = (flag) => {
    if (flag.maintenance) return <span style={{ color: '#ffb347' }}>Maintenance</span>;
    if (!flag.enabled) return <span style={{ color: '#ff6b6b' }}>Disabled</span>;
    if (flag.beta) return <span style={{ color: '#4da3ff' }}>Beta</span>;
    return <span style={{ color: '#2ed573' }}>Enabled</span>;
  };

  return (
    <div className="feature-management-shell">
      <div className="feature-management-toolbar">
        <div>
          <h2 style={{ margin: 0, color: '#fff' }}>Feature Flag Control</h2>
          <p style={{ margin: '6px 0 0', color: '#8b95ac' }}>Realtime controls for modules, UI, APIs, and maintenance states.</p>
        </div>
        <div className="feature-toolbar-actions">
          <button className="feature-pill-btn" onClick={() => bulkAction('enable-all')}>Enable All</button>
          <button className="feature-pill-btn" onClick={() => bulkAction('disable-all')}>Disable All</button>
          <button className="feature-pill-btn" onClick={() => bulkAction('reset-defaults')}>Reset Defaults</button>
          <button className="feature-pill-btn" onClick={() => bulkAction('export')}>Export JSON</button>
        </div>
      </div>

      <div className="feature-management-grid">
        <aside className="feature-tree-panel">
          <div className="feature-search-box">
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search features" />
          </div>
          <div className="feature-filter-row">
            {['all', 'enabled', 'disabled', 'beta', 'maintenance'].map((item) => (
              <button key={item} className={`feature-filter-chip ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>
                {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <div className="feature-tree-list">
            {moduleOrder.map((moduleName) => {
              const moduleFlags = filteredFeatures.filter((flag) => flag.module === moduleName);
              if (!moduleFlags.length) return null;
              return (
                <div key={moduleName} className="feature-tree-group">
                  <button className="feature-module-toggle" onClick={() => setExpandedModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }))}>
                    <span>{moduleName}</span>
                    <span>{expandedModules[moduleName] ? '▾' : '▸'}</span>
                  </button>
                  {expandedModules[moduleName] && (
                    <div className="feature-tree-items">
                      {moduleFlags.map((flag) => (
                        <button key={flag.slug} className={`feature-tree-item ${selectedSlug === flag.slug ? 'active' : ''}`} onClick={() => setSelectedSlug(flag.slug)}>
                          <span>{flag.name}</span>
                          {statusBadge(flag)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="feature-detail-panel">
          {loading && <div className="feature-loading">Loading feature flags…</div>}
          {!loading && selectedFeature && (
            <>
              <div className="feature-detail-header">
                <div>
                  <h3 style={{ margin: 0, color: '#fff' }}>{selectedFeature.name}</h3>
                  <p style={{ margin: '6px 0 0', color: '#8b95ac' }}>{selectedFeature.slug}</p>
                </div>
                <div className="feature-status-pill">{statusBadge(selectedFeature)}</div>
              </div>

              <div className="feature-toggle-grid">
                <label className="feature-toggle-card">
                  <span>Enabled</span>
                  <input type="checkbox" checked={selectedFeature.enabled} onChange={(e) => toggleFeature('enabled', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Visible</span>
                  <input type="checkbox" checked={selectedFeature.visible} onChange={(e) => toggleFeature('visible', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>API Enabled</span>
                  <input type="checkbox" checked={selectedFeature.apiEnabled} onChange={(e) => toggleFeature('apiEnabled', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Maintenance</span>
                  <input type="checkbox" checked={selectedFeature.maintenance} onChange={(e) => toggleFeature('maintenance', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Beta</span>
                  <input type="checkbox" checked={selectedFeature.beta} onChange={(e) => toggleFeature('beta', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Public Access</span>
                  <input type="checkbox" checked={selectedFeature.publicAccess} onChange={(e) => toggleFeature('publicAccess', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Mobile Enabled</span>
                  <input type="checkbox" checked={selectedFeature.mobileEnabled} onChange={(e) => toggleFeature('mobileEnabled', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Desktop Enabled</span>
                  <input type="checkbox" checked={selectedFeature.desktopEnabled} onChange={(e) => toggleFeature('desktopEnabled', e.target.checked)} />
                </label>
                <label className="feature-toggle-card">
                  <span>Read Only</span>
                  <input type="checkbox" checked={selectedFeature.readOnly} onChange={(e) => toggleFeature('readOnly', e.target.checked)} />
                </label>
              </div>

              <div className="feature-import-box">
                <h4 style={{ marginBottom: '8px', color: '#fff' }}>Import JSON</h4>
                <textarea value={importValue} onChange={(e) => setImportValue(e.target.value)} placeholder='[{"slug":"hero-search-bar","enabled":false}]' />
                <button className="feature-pill-btn" onClick={handleImport}>Import</button>
              </div>
            </>
          )}
        </section>
      </div>

      <div className="feature-audit-panel">
        <div className="feature-audit-header">
          <h3 style={{ margin: 0, color: '#fff' }}>Audit Trail</h3>
          <div className="feature-audit-pager">
            <button disabled={auditPage === 1} onClick={() => { const next = auditPage - 1; setAuditPage(next); fetchAuditLogs(next); }}>Prev</button>
            <span>{auditPage}</span>
            <button disabled={auditPage * 8 >= auditTotal} onClick={() => { const next = auditPage + 1; setAuditPage(next); fetchAuditLogs(next); }}>Next</button>
          </div>
        </div>
        <div className="feature-audit-list">
          {auditLogs.map((log) => (
            <div key={log._id} className="feature-audit-item">
              <div><strong>{log.adminEmail}</strong> <span>{log.action}</span></div>
              <div>{log.featureSlug}</div>
              <div>{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureManagement;
