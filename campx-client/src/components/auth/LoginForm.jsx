import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const domain = '@adityauniversity.in'

  const handleEmailChange = (e) => {
    let value = e.target.value
    setEmail(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === '@') {
      e.preventDefault()
      const cursorPosition = e.target.selectionStart
      const currentValue = email
      const newValue = currentValue.slice(0, cursorPosition) + '@' + currentValue.slice(cursorPosition)
      setEmail(newValue)
      
      // Auto-add domain after @
      setTimeout(() => {
        const localPart = newValue.split('@')[0]
        if (localPart && !newValue.includes(domain)) {
          setEmail(`${localPart}${domain}`)
          // Move focus to password field after email is set
          setTimeout(() => {
            passwordInputRef.current?.focus()
          }, 50)
        }
      }, 10)
    }
  }

  const handleBlur = () => {
    if (email && email.includes('@') && !email.includes(domain)) {
      const localPart = email.split('@')[0]
      if (localPart) {
        setEmail(`${localPart}${domain}`)
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    let finalEmail = email
    
    if (finalEmail && !finalEmail.includes('@')) {
      finalEmail = `${finalEmail}${domain}`
      setEmail(finalEmail)
    } else if (finalEmail && finalEmail.includes('@') && !finalEmail.includes(domain)) {
      const localPart = finalEmail.split('@')[0]
      finalEmail = `${localPart}${domain}`
      setEmail(finalEmail)
    }
    
    if (!finalEmail.endsWith(domain)) {
      toast.error(`Please use your ${domain} email address`)
      emailInputRef.current?.focus()
      return
    }
    
    if (!finalEmail.trim()) {
      toast.error('Please enter your email')
      emailInputRef.current?.focus()
      return
    }
    
    if (!password) {
      toast.error('Please enter your password')
      passwordInputRef.current?.focus()
      return
    }
    
    setLoading(true)
    try {
      const response = await authService.login({ email: finalEmail, password })
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        login(response.user, response.token)
        
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
        toast.error(response.message || 'Invalid email or password')
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
      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={emailInputRef}
            type="text"
            value={email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="username"
            disabled={loading}
            autoComplete="username"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Enter username, @ will auto-add {domain}
        </p>
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