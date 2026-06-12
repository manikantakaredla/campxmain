import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginForm = () => {
  const [rollNoOrEmpId, setRollNoOrEmpId] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const identifierInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!rollNoOrEmpId.trim()) {
      toast.error('Please enter your Roll No / Employee ID')
      identifierInputRef.current?.focus()
      return
    }
    
    if (!password) {
      toast.error('Please enter your password')
      passwordInputRef.current?.focus()
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.login({ rollNoOrEmpId, password, rememberMe })
      
      if (response.success && response.token) {
        login(response.user, response.token, rememberMe)
        
        toast.success(`Welcome back, ${response.user.name?.split(' ')[0] || 'User'}!`)
        
        const role = response.user.role
        const redirectPath = {
          student: '/student/dashboard',
          faculty: '/faculty/dashboard',
          hod: '/faculty/dashboard',
          deputyhod: '/faculty/dashboard',
          dean: '/faculty/dashboard',
          principal: '/faculty/dashboard',
          admin: '/admin/dashboard'
        }[role] || '/'
        
        navigate(redirectPath, { replace: true })
      } else {
        toast.error(response.message || 'Invalid credentials')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Connection error. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Identifier Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Roll No / Employee ID
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={identifierInputRef}
            type="text"
            value={rollNoOrEmpId}
            onChange={(e) => setRollNoOrEmpId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
            placeholder="Enter Roll No or Employee ID"
            disabled={loading}
            autoComplete="username"
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
            ref={passwordInputRef}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      {/* Options */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
          />
          <span className="text-sm text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Forgot password?
        </button>
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn size={16} />
            Sign In
          </>
        )}
      </button>
    </form>
  )
}

export default LoginForm