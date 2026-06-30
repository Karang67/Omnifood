import { useState, useEffect } from 'react';

const ContentCms = () => {
    const [subTab, setSubTab] = useState('blogs');
    const [blogs, setBlogs] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    // Forms
    const [blogForm, setBlogForm] = useState({ title: '', content: '', author: '', status: 'Draft', categories: '', tags: '' });
    const [blogFile, setBlogFile] = useState(null);

    const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', displayOrder: 0 });

    const fetchBlogs = async () => {
        try {
            const res = await fetch('/api/admin/blogs');
            const data = await res.json();
            setBlogs(data);
        } catch (err) { console.error(err); }
    };

    const fetchFaqs = async () => {
        try {
            const res = await fetch('/api/admin/faqs');
            const data = await res.json();
            setFaqs(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const load = async () => {
            await fetchBlogs();
            await fetchFaqs();
            setLoading(false);
        };
        load();
    }, []);

    const handleCreateBlog = async (e) => {
        e.preventDefault();
        setAlert({ show: false, type: '', message: '' });
        
        const formData = new FormData();
        formData.append('title', blogForm.title);
        formData.append('content', blogForm.content);
        formData.append('author', blogForm.author);
        formData.append('status', blogForm.status);
        formData.append('categories', blogForm.categories);
        formData.append('tags', blogForm.tags);
        if (blogFile) formData.append('image', blogFile);

        try {
            const res = await fetch('/api/admin/blogs', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'Blog published successfully!' });
                setBlogForm({ title: '', content: '', author: '', status: 'Draft', categories: '', tags: '' });
                setBlogFile(null);
                fetchBlogs();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteBlog = async (id) => {
        if (!confirm('Remove this blog post?')) return;
        try {
            const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchBlogs();
        } catch (err) { console.error(err); }
    };

    const handleCreateFaq = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/faqs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(faqForm)
            });
            const data = await res.json();
            if (data.success) {
                setAlert({ show: true, type: 'alert-success', message: 'FAQ added!' });
                setFaqForm({ question: '', answer: '', category: 'General', displayOrder: 0 });
                fetchFaqs();
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteFaq = async (id) => {
        if (!confirm('Delete FAQ?')) return;
        try {
            const res = await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) fetchFaqs();
        } catch (err) { console.error(err); }
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Loading content editor...</div>;

    return (
        <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <button className={`tab-sub-btn ${subTab === 'blogs' ? 'active' : ''}`} onClick={() => setSubTab('blogs')} style={{ background: 'none', border: 'none', color: subTab === 'blogs' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>Blog Manager</button>
                <button className={`tab-sub-btn ${subTab === 'faqs' ? 'active' : ''}`} onClick={() => setSubTab('faqs')} style={{ background: 'none', border: 'none', color: subTab === 'faqs' ? '#e23744' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }}>FAQs Manager</button>
            </div>

            {alert.show && (
                <div className={`alert ${alert.type}`} style={{ display: 'block', marginBottom: '20px' }}>
                    {alert.message}
                </div>
            )}

            {/* TAB 1: Blogs CRUD */}
            {subTab === 'blogs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    <form onSubmit={handleCreateBlog} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Compose Blog Post</h3>
                        <div className="form-group">
                            <label>Blog Title</label>
                            <input type="text" className="form-control" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Author</label>
                            <input type="text" className="form-control" value={blogForm.author} onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Content (supports Markdown)</label>
                            <textarea rows="6" className="form-control" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Featured Image</label>
                            <input type="file" className="form-control" accept="image/*" onChange={(e) => setBlogFile(e.target.files[0])} />
                        </div>
                        <div className="form-group">
                            <label>Publish Status</label>
                            <select className="form-control" value={blogForm.status} onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}>
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-submit">Save Post</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Blog Posts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {blogs.map(b => (
                                <div key={b._id} style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff' }}>{b.title}</h4>
                                        <span style={{ fontSize: '0.75rem', color: b.status === 'Published' ? '#25c577' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{b.status}</span>
                                    </div>
                                    <button onClick={() => handleDeleteBlog(b._id)} style={{ background: 'rgba(226, 55, 68, 0.1)', color: '#ff7070', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: FAQs CRUD */}
            {subTab === 'faqs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
                    <form onSubmit={handleCreateFaq} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Add FAQ</h3>
                        <div className="form-group">
                            <label>Question</label>
                            <input type="text" className="form-control" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Answer</label>
                            <textarea rows="3" className="form-control" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input type="text" className="form-control" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} />
                        </div>
                        <button type="submit" className="btn-submit">Add FAQ</button>
                    </form>

                    <div>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>FAQ Directory</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {faqs.map(f => (
                                <div key={f._id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Q: {f.question}</strong>
                                        <button onClick={() => handleDeleteFaq(f._id)} style={{ background: 'none', border: 'none', color: '#ff7070', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                                    </div>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>A: {f.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentCms;
