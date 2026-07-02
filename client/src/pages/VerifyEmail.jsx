import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import '../styles/auth.css';

const VerifyEmail = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const { notify } = useNotification();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get('email') || '';

  const getRedirectPath = (role) => {
    if (role === 'super_admin') return '/admin';
    if (role === 'rider') return '/delivery';
    if (role === 'restaurant_owner') return '/restaurant-owner';
    return '/menu';
  };
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      notify({ type: 'error', message: 'No email address provided for verification.' });
    }
  }, [email, notify]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && !isNaN(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      notify({ type: 'error', message: 'Please enter a 6-digit code.' });
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp(email, otpValue);
      if (result.success) {
        notify({ type: 'success', message: `${result.message} Redirecting...` });

        setTimeout(() => navigate(getRedirectPath(result.user.role)), 1500);
      } else {
        notify({ type: 'error', message: result.message || 'Verification failed.' });
      }
    } catch (err) {
      console.error(err);
      notify({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setLoading(true);
    
    try {
      const result = await resendOtp(email);
      if (result.success) {
        notify({ type: 'success', message: 'A new verification code has been sent!' });
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();
      } else {
        notify({ type: 'error', message: result.message || 'Failed to resend code.' });
      }
    } catch (err) {
      console.error(err);
      notify({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="login-container">
        <div className="header-box">
          <div className="logo-text">Omnifood</div>
          <div className="subtitle">Verify your email address</div>
        </div>

        <div className="email-hint" style={{ textAlign: 'center', marginBottom: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>
          We sent a 6-digit verification code to <br />
          <strong style={{ color: '#fff' }}>{email}</strong>
        </div>

        <form id="verifyForm" onSubmit={handleSubmit}>
          <div className="otp-row" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                ref={(el) => (inputRefs.current[index] = el)}
                style={{
                  width: '45px',
                  height: '55px',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  outline: 'none'
                }}
                disabled={loading || !email}
              />
            ))}
          </div>

          <button type="submit" className="btn-submit" disabled={loading || !email}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="resend-section" style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#94a3b8' }}>
          {canResend ? (
            <span>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                onClick={handleResend}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e23744',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  padding: '0'
                }}
                disabled={loading}
              >
                Resend Code
              </button>
            </span>
          ) : (
            <span>Resend code in {resendTimer}s</span>
          )}
        </div>

        <div className="switch-link" style={{ textAlign: 'center', marginTop: '20px' }}>
          Back to <a href="/signup" style={{ color: '#e23744', textDecoration: 'none', fontWeight: '600' }}>Sign Up</a>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
