'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface LoginAttempt {
  email: string
  attempts: number
  lastAttempt: number
  lockedUntil?: number
}

export default function DoctorSignIn() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Track login attempts (in real app, this would be server-side)
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])

  // Mock user database
  const mockUsers = [
    { email: 'doctor@example.com', password: 'SecurePass123!', name: 'Dr. John Smith' },
    { email: 'test@meditrust.com', password: 'TestPass456!', name: 'Dr. Jane Doe' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const isAccountLocked = (email: string): boolean => {
    const attempt = loginAttempts.find(att => att.email === email)
    if (!attempt) return false
    
    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
      return true
    }
    return false
  }

  const getRemainingLockTime = (email: string): number => {
    const attempt = loginAttempts.find(att => att.email === email)
    if (!attempt?.lockedUntil) return 0
    
    return Math.max(0, Math.ceil((attempt.lockedUntil - Date.now()) / 1000 / 60))
  }

  const recordFailedAttempt = (email: string) => {
    setLoginAttempts(prev => {
      const existing = prev.find(att => att.email === email)
      const now = Date.now()
      
      if (existing) {
        const newAttempts = existing.attempts + 1
        const lockedUntil = newAttempts >= 5 ? now + (15 * 60 * 1000) : undefined // 15 minutes
        
        return prev.map(att => 
          att.email === email 
            ? { ...att, attempts: newAttempts, lastAttempt: now, lockedUntil }
            : att
        )
      } else {
        return [...prev, { email, attempts: 1, lastAttempt: now }]
      }
    })
  }

  const clearFailedAttempts = (email: string) => {
    setLoginAttempts(prev => prev.filter(att => att.email !== email))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    if (!validateForm()) {
      setLoading(false)
      return
    }

    // Check if account is locked
    if (isAccountLocked(formData.email)) {
      const remainingTime = getRemainingLockTime(formData.email)
      setErrors({ 
        general: `Account is locked due to too many failed attempts. Please try again in ${remainingTime} minutes.` 
      })
      setLoading(false)
      return
    }

    try {
      // Simulate API delay (max 3 seconds as per requirements)
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)) // 1-3 seconds
      
      // Mock authentication
      const user = mockUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase())
      
      if (!user || user.password !== formData.password) {
        recordFailedAttempt(formData.email)
        setErrors({ general: 'Incorrect email or password.' })
        setLoading(false)
        return
      }

      // Successful login
      clearFailedAttempts(formData.email)
      
      // Store user session (in real app, this would be handled by auth provider)
      localStorage.setItem('doctorUser', JSON.stringify({
        email: user.email,
        name: user.name,
        loginTime: Date.now()
      }))

      // Redirect to dashboard
      router.push('/doctor/dashboard')

    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setShowForgotPassword(true)
    // In real app, this would trigger password reset flow
    setTimeout(() => {
      setShowForgotPassword(false)
      setErrors({ general: 'Password reset instructions have been sent to your email.' })
    }, 2000)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#37322F] mb-2">Doctor Sign In</h2>
        <p className="text-[#605A57]">Access your dashboard to manage prescriptions</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#37322F]">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.email 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
            }`}
            placeholder="doctor@example.com"
            disabled={isAccountLocked(formData.email)}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#37322F]">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.password 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
            }`}
            placeholder="Enter your password"
            disabled={isAccountLocked(formData.email)}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        {isAccountLocked(formData.email) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Account locked due to too many failed attempts. Please try again in {getRemainingLockTime(formData.email)} minutes.
            </p>
          </div>
        )}

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isAccountLocked(formData.email)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#37322F] hover:bg-[#2a2522] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={handleForgotPassword}
          className="text-[#37322F] hover:text-[#2a2522] text-sm font-medium"
          disabled={loading}
        >
          Forgot Password?
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-[#605A57]">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/doctor/signup')}
            className="text-[#37322F] hover:text-[#2a2522] font-medium"
          >
            Sign Up
          </button>
        </p>
      </div>

      {showForgotPassword && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">
            Sending password reset instructions...
          </p>
        </div>
      )}

      {/* Demo credentials info */}
      <div className="mt-6 p-4 bg-[#F7F5F3] rounded-md border border-[#E0DEDB]">
        <h3 className="text-sm font-medium text-[#37322F] mb-2">Demo Credentials:</h3>
        <div className="text-xs text-[#605A57] space-y-1">
          <p><strong>Email:</strong> doctor@example.com</p>
          <p><strong>Password:</strong> SecurePass123!</p>
          <p className="text-[#605A57] mt-2">Or try: test@meditrust.com / TestPass456!</p>
        </div>
      </div>
    </div>
  )
}
