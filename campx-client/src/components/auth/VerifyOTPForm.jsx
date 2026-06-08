import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { Key, RefreshCw, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const VerifyOTPForm = ({ email, setActiveTab }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [timer])
  
  const handleChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.verifyOTP({ email, otp: otpString })
      
      if (response.success) {
        login(response.user, response.token)
        toast.success('Email verified successfully!')
        
        const role = response.user.role
        if (role === 'student') navigate('/student/dashboard')
        else if (['faculty', 'hod', 'deputyhod', 'dean', 'principal'].includes(role)) navigate('/faculty/dashboard')
        else if (role === 'admin') navigate('/admin/dashboard')
      } else {
        toast.error(response.message || 'Verification failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }
  
  const handleResend = async () => {
    if (timer > 0) return
    
    setResendLoading(true)
    try {
      const response = await authService.resendOTP(email)
      if (response.success) {
        toast.success('OTP resent successfully')
        setTimer(60)
        setOtp(['', '', '', '', '', ''])
      } else {
        toast.error(response.message || 'Failed to resend OTP')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }
  
  return (
    <div className="flex-1 flex flex-col">
      <button
        onClick={() => setActiveTab()}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Key className="text-blue-600 w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Verify Email</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter OTP sent to<br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-11 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={handleResend}
          disabled={timer > 0 || resendLoading}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1 mx-auto"
        >
          <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  )
}

export default VerifyOTPForm