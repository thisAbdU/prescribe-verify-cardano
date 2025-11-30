'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FormData {
  name: string
  email: string
  medicalLicense: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  medicalLicense?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function DoctorSignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    medicalLicense: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Password validation
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character'
    }
    return null
  }

  // Medical license validation (mock)
  const validateMedicalLicense = async (license: string): Promise<boolean> => {
    // Mock validation - in real app, this would check against a database
    const validLicenses = ['MD123456', 'MD789012', 'MD345678', 'MD901234']
    return validLicenses.includes(license.toUpperCase())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Medical license validation
    if (!formData.medicalLicense.trim()) {
      newErrors.medicalLicense = 'Medical license number is required'
    } else if (!/^[A-Z]{2}\d{6}$/.test(formData.medicalLicense.toUpperCase())) {
      newErrors.medicalLicense = 'License must be in format MD123456'
    } else {
      const isValidLicense = await validateMedicalLicense(formData.medicalLicense)
      if (!isValidLicense) {
        newErrors.medicalLicense = 'Invalid medical license number'
      }
    }

    // Password validation
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      newErrors.password = passwordError
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const isValid = await validateForm()
    
    if (!isValid) {
      setLoading(false)
      return
    }

    try {
      // Mock API call - in real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate 2-second delay
      
      // Mock email already exists check
      const existingEmails = ['doctor@example.com', 'test@meditrust.com']
      if (existingEmails.includes(formData.email.toLowerCase())) {
        setErrors({ general: 'An account with this email already exists' })
        setLoading(false)
        return
      }

      // Mock successful signup
      setSuccess(true)
      
      // Mock email verification (in real app, this would send actual email)
      setTimeout(() => {
        setSuccess(false)
        router.push('/doctor/dashboard')
      }, 3000)

    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-4">
            We've sent a verification link to <strong>{formData.email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Please check your email and click the verification link to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#37322F] mb-2">Doctor Sign Up</h2>
        <p className="text-[#605A57]">Create your account to start issuing secure prescriptions</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#37322F]">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.name 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
            }`}
            placeholder="Dr. John Smith"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

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
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="medicalLicense" className="block text-sm font-medium text-[#37322F]">
            Medical License Number *
          </label>
          <input
            id="medicalLicense"
            name="medicalLicense"
            type="text"
            value={formData.medicalLicense}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.medicalLicense 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
            }`}
            placeholder="MD123456"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.medicalLicense && <p className="mt-1 text-sm text-red-600">{errors.medicalLicense}</p>}
          <p className="mt-1 text-xs text-[#605A57]">Format: MD followed by 6 digits</p>
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
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          <div className="mt-1 text-xs text-[#605A57]">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside ml-2">
              <li>At least 8 characters</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#37322F]">
            Confirm Password *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              errors.confirmPassword 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#37322F] hover:bg-[#2a2522] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-[#605A57]">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/doctor/signin')}
            className="text-[#37322F] hover:text-[#2a2522] font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
