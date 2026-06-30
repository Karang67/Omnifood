import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const AccessDenied = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGoBack = () => {
        if (!user) {
            navigate('/login');
        } else if (user.role === 'super_admin') {
            navigate('/admin');
        } else if (user.role === 'rider') {
            navigate('/delivery');
        } else {
            navigate('/menu');
        }
    };

    return (
        <div className="auth-page-wrapper" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="login-container" style={{ textAlign: 'center', maxWidth: '400px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <i className="ion-android-alert" style={{ fontSize: '4.5rem', color: '#e23744', textShadow: '0 0 16px rgba(226,55,68,0.4)' }}></i>
                </div>
                
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                    Access Denied
                </h1>
                
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
                    Error Code: 403
                </span>
                
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.6, margin: '16px 0 28px' }}>
                    You do not have the required role permissions to access this page. Please contact the system administrator if you believe this is an error.
                </p>
                
                <button onClick={handleGoBack} className="btn-submit" style={{ width: '100%', borderRadius: '50px' }}>
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;
