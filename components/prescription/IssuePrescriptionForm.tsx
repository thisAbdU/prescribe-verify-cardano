'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrescriptionUtils, type PrescriptionData } from '@/lib/prescription-utils'

interface FormPrescriptionData {
  patientName: string
  patientId: string
  patientEmail: string
  patientPhone: string
  medicationName: string
  dosage: string
  duration: string
  instructions: string
  doctorNotes: string
}

interface FormErrors {
  patientName?: string
  patientId?: string
  patientEmail?: string
  patientPhone?: string
  medicationName?: string
  dosage?: string
  duration?: string
  general?: string
}

export default function IssuePrescriptionForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormPrescriptionData>({
    patientName: '',
    patientId: '',
    patientEmail: '',
    patientPhone: '',
    medicationName: '',
    dosage: '',
    duration: '',
    instructions: '',
    doctorNotes: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [prescriptionId, setPrescriptionId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [status, setStatus] = useState('')
  const [notificationResults, setNotificationResults] = useState<{
    sms: { success: boolean; message: string; error?: string }
    email: { success: boolean; message: string; error?: string }
  } | null>(null)
  const [prescriptionUtils] = useState(() => new PrescriptionUtils())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required'
    }

    if (!formData.patientId.trim()) {
      newErrors.patientId = 'Patient ID is required'
    }

    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = 'Patient email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.patientEmail)) {
      newErrors.patientEmail = 'Please enter a valid email address'
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = 'Patient phone is required'
    }

    if (!formData.medicationName.trim()) {
      newErrors.medicationName = 'Medication name is required'
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required'
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePrescriptionId = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `RX${timestamp}${random}`
  }

  const generateQRCode = (prescriptionId: string): string => {
    // Mock QR code generation - in real app, this would use a QR library
    return `https://meditrust.verify/rx/${prescriptionId}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setStatus('Validating prescription data...')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // Generate prescription ID
      const newPrescriptionId = prescriptionUtils.generatePrescriptionId()
      setPrescriptionId(newPrescriptionId)
      setStatus('Generating prescription ID...')

      // Prepare prescription data
      const prescriptionData: PrescriptionData = {
        prescriptionId: newPrescriptionId,
        patientId: formData.patientId,
        doctorId: 'DOC001', // Mock doctor ID - in real app, get from auth
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        duration: formData.duration,
        instructions: formData.instructions,
        doctorNotes: formData.doctorNotes
      }

      setStatus('Generating QR code...')

      // Generate QR code
      const qrCodeUrl = await prescriptionUtils.generateQRCode(newPrescriptionId)
      setQrCode(qrCodeUrl)

      // Send prescription to patient
      setStatus('Sending prescription to patient...')
      const sendResult = await prescriptionUtils.sendPrescriptionToPatient(
        prescriptionData,
        qrCodeUrl
      )

      if (!sendResult.success) {
        console.warn('Failed to send prescription to patient:', sendResult.message)
      }

      // Store prescription in local database
      const prescription = {
        id: newPrescriptionId,
        patientName: formData.patientName,
        patientId: formData.patientId,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        medicationName: formData.medicationName,
        dosage: formData.dosage,
        duration: formData.duration,
        instructions: formData.instructions,
        doctorNotes: formData.doctorNotes,
        timestamp: new Date().toISOString(),
        qrCode: qrCodeUrl,
        status: 'issued'
      }

      // Store in localStorage (in real app, this would be stored in database)
      const existingPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
      existingPrescriptions.push(prescription)
      localStorage.setItem('prescriptions', JSON.stringify(existingPrescriptions))

      setStatus('Prescription successfully issued!')
      setSuccess(true)

    } catch (error: any) {
      setErrors({ general: `Failed to issue prescription: ${error.message}` })
      setStatus('Failed to issue prescription')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#37322F] mb-2">Prescription Issued Successfully!</h2>
          <p className="text-[#605A57] mb-6">
            Your prescription has been issued and is now ready for verification.
          </p>
          
          <div className="bg-[#F7F5F3] rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-[#605A57]">Prescription ID:</p>
                <p className="font-mono text-[#37322F] font-semibold">{prescriptionId}</p>
              </div>
              <div>
                <p className="text-sm text-[#605A57]">Issued:</p>
                <p className="text-[#37322F]">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-[#605A57]">Patient:</p>
                <p className="text-[#37322F]">{formData.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-[#605A57]">Medication:</p>
                <p className="text-[#37322F]">{formData.medicationName}</p>
              </div>
            </div>
          </div>

          {/* Prescription Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Prescription Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Prescription ID:</span>
                <span className="text-xs font-mono text-blue-800 break-all">{prescriptionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">Status:</span>
                <span className="text-sm text-green-600 font-semibold">✅ Issued</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-blue-200">
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(prescriptionId)}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  📋 Copy Prescription ID
                </button>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white border border-[#E0DEDB] rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-[#37322F] mb-2">QR Code for Verification</h3>
            <div className="flex justify-center mb-4">
              {qrCode ? (
                <img 
                  src={qrCode} 
                  alt="Prescription QR Code" 
                  className="w-48 h-48 border border-gray-300 rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="text-xs text-gray-500">QR Code</div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-[#605A57] text-center">
              Pharmacies can scan this QR code to verify the prescription
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSuccess(false)
                setFormData({
                  patientName: '',
                  patientId: '',
                  patientEmail: '',
                  patientPhone: '',
                  medicationName: '',
                  dosage: '',
                  duration: '',
                  instructions: '',
                  doctorNotes: ''
                })
              }}
              className="px-6 py-2 border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3] transition-colors"
            >
              Issue Another
            </button>
            <button
              onClick={() => router.push('/doctor/dashboard')}
              className="px-6 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#37322F] mb-2">Issue New Prescription</h2>
        <p className="text-[#605A57]">Create a secure, verifiable prescription</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="bg-[#F7F5F3] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-[#37322F] mb-4">Patient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-medium text-[#37322F]">
                Patient Name *
              </label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                value={formData.patientName}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.patientName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
                placeholder="John Doe"
              />
              {errors.patientName && <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>}
            </div>

            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-[#37322F]">
                Patient ID *
              </label>
              <input
                id="patientId"
                name="patientId"
                type="text"
                value={formData.patientId}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.patientId 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
                placeholder="P123456789"
              />
              {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
            </div>

            <div>
              <label htmlFor="patientEmail" className="block text-sm font-medium text-[#37322F]">
                Patient Email *
              </label>
              <input
                id="patientEmail"
                name="patientEmail"
                type="email"
                value={formData.patientEmail}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.patientEmail 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
                placeholder="patient@example.com"
              />
              {errors.patientEmail && <p className="mt-1 text-sm text-red-600">{errors.patientEmail}</p>}
            </div>

            <div>
              <label htmlFor="patientPhone" className="block text-sm font-medium text-[#37322F]">
                Patient Phone *
              </label>
              <input
                id="patientPhone"
                name="patientPhone"
                type="tel"
                value={formData.patientPhone}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.patientPhone 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
                placeholder="+1234567890"
              />
              {errors.patientPhone && <p className="mt-1 text-sm text-red-600">{errors.patientPhone}</p>}
            </div>
          </div>
        </div>

        {/* Medication Information */}
        <div className="bg-[#F7F5F3] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-[#37322F] mb-4">Medication Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="medicationName" className="block text-sm font-medium text-[#37322F]">
                Medication Name *
              </label>
              <input
                id="medicationName"
                name="medicationName"
                type="text"
                value={formData.medicationName}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.medicationName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
                placeholder="Amoxicillin"
              />
              {errors.medicationName && <p className="mt-1 text-sm text-red-600">{errors.medicationName}</p>}
            </div>

            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-[#37322F]">
                Dosage *
              </label>
              <input
                id="dosage"
                name="dosage"
                type="text"
                value={formData.dosage}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.dosage 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
                placeholder="500mg"
              />
              {errors.dosage && <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-[#37322F]">
                Duration *
              </label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  errors.duration 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]'
                }`}
              >
                <option value="">Select duration</option>
                <option value="3 days">3 days</option>
                <option value="5 days">5 days</option>
                <option value="7 days">7 days</option>
                <option value="10 days">10 days</option>
                <option value="14 days">14 days</option>
                <option value="21 days">21 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
              </select>
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-[#F7F5F3] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-[#37322F] mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-[#37322F]">
                Instructions for Patient
              </label>
              <textarea
                id="instructions"
                name="instructions"
                rows={3}
                value={formData.instructions}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-[#E0DEDB] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] focus:border-[#37322F]"
                placeholder="Take with food, twice daily..."
              />
            </div>

            <div>
              <label htmlFor="doctorNotes" className="block text-sm font-medium text-[#37322F]">
                Doctor Notes (Internal)
              </label>
              <textarea
                id="doctorNotes"
                name="doctorNotes"
                rows={3}
                value={formData.doctorNotes}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-[#E0DEDB] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] focus:border-[#37322F]"
                placeholder="Internal notes about the prescription..."
              />
            </div>
          </div>
        </div>

        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-600 font-medium">📋 {status}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/doctor/dashboard')}
            className="px-6 py-2 border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Issuing Prescription...
              </div>
            ) : (
              'Issue Prescription'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
