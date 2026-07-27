import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { User, LogIn, Mail, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

const FeedbackLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email/Roll, 2: OTP
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your Roll Number or Email');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/feedback/auth/send-otp', { emailOrRollNo: identifier });
      if (response.data.success) {
        setGeneratedEmail(response.data.email);
        setStep(2);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/feedback/auth/verify-otp', { email: generatedEmail, otp });
      if (response.data.success) {
        // Special feedback login
        login(
          { ...response.data.student, role: 'student_feedback', name: response.data.student.rollNumber },
          response.data.token,
          false
        );
        toast.success('Login successful!');
        navigate('/student/feedback', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Student Feedback System</h3>
            <p className="text-sm text-gray-500 mt-1">Enter your Roll Number to receive an OTP on your college email.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
                placeholder="e.g. 24B11CS002"
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Verify OTP</h3>
            <p className="text-sm text-gray-500 mt-1">
              We sent a 6-digit code to <br/>
              <span className="font-semibold text-gray-900">{generatedEmail}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter 6-Digit OTP
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-[0.5em] font-mono text-lg"
                placeholder="000000"
                disabled={loading}
                maxLength={6}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
          
          <button
            type="button"
            onClick={() => { setStep(1); setOtp(''); }}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackLogin;
