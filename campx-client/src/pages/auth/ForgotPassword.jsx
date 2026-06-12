import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { User, ArrowLeft, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!identifier.trim()) {
      toast.error('Please enter Roll Number or Employee ID')
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.forgotPassword(identifier.trim())
      
      if (response.success) {
        setEmailSent(true)
        setUserEmail(identifier.trim())
        toast.success('OTP sent to your registered email!')
      } else {
        toast.error(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'User not found.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Check Your Email</h1>
            <p className="text-sm text-gray-500 mt-2">
              We've sent a password reset OTP to <br />
              <span className="font-medium text-gray-700">{userEmail}</span>
            </p>
          </div>
          
          <button
            onClick={() => navigate(`/reset-password?identifier=${encodeURIComponent(userEmail)}`)}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Continue to Reset Password
          </button>
          
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Forgot Password?</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your Roll Number or Employee ID to reset your password
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number / Employee ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter Roll Number or Employee ID"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send Reset OTP'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1">
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword