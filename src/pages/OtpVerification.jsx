import { useState, useEffect } from 'react';

const API = {
  post: async (url, data) => ({ data: { message: 'Success' } })
};

const useLocation = () => ({ state: { email: 'user@example.com' } });
const useNavigate = () => () => {};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
                 type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
                 'bg-blue-500/20 border-blue-500/30 text-blue-300';

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border backdrop-blur-md ${bgColor} shadow-xl animate-pulse`}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-4 text-white/70 hover:text-white">×</button>
      </div>
    </div>
  );
};

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  if (!email) {
    navigate('/signup');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await API.post('/auth/verify-otp', { email, otp });
      showToast("Email verified successfully! Please login.", 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await API.post('/auth/resend-otp', { email });
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      
      <div className="bg-white p-8 shadow-md rounded-lg w-full max-w-sm text-center">
        <h2 className="text-2xl mb-2 font-bold text-gray-800">Email Verification</h2>
        <p className="text-sm text-gray-600 mb-4">An OTP has been sent to <strong>{email}</strong>. Please enter it below.</p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}

        <div onSubmit={handleVerify}>
          <input
            type="text"
            className="w-full mb-4 p-3 border rounded-md bg-gray-50 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button
            onClick={handleVerify}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold transition-colors"
          >
            Verify Account
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Didn't receive the code?{' '}
          <button onClick={handleResend} className="text-blue-600 hover:underline">Resend OTP</button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;