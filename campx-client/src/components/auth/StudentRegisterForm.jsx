import React, { useState, useEffect } from 'react'
import { authService } from '../../services/authService'
import { User, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

const StudentRegisterForm = ({ setActiveTab, setEmail, setRegistrationData, registrationData }) => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const domain = '@adityauniversity.in'

  // Auto-generate email when roll number changes
  const handleRollNumberChange = (e) => {
    const roll = e.target.value.toUpperCase()
    setFormData(prev => ({ 
      ...prev, 
      rollNumber: roll,
      email: roll ? `${roll.toLowerCase()}${domain}` : ''
    }))
  }

  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Temporary bypass for testing
    // if (!formData.email.endsWith(domain)) {
    //   toast.error(`Please use your ${domain} email address`)
    //   return
    // }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.registerStudent({
        rollNumber: formData.rollNumber,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      })
      
      if (response.success) {
        toast.success('OTP sent to your email!')
        setEmail(formData.email)
        setRegistrationData(formData)
        setActiveTab('verifyOtp')
      } else {
        toast.error(response.message || 'Registration failed')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Roll Number Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Roll Number
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleRollNumberChange}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="24B11CS052"
            required
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">Your roll number will be used to generate your email</p>
      </div>
      
      {/* Email Field - Auto-filled, can be edited */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          College Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleEmailChange}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="rollnumber@adityauniversity.in"
            required
          />
        </div>
      
      </div>
      
      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Minimum 8 characters"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Confirm your password"
            required
          />
        </div>
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Register as Student'
        )}
      </button>
    </form>
  )
}

export default StudentRegisterForm