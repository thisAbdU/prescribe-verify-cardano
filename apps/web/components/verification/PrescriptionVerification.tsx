'use client'

import { useState } from 'react'

interface PrescriptionData {
  prescriptionId: string
  patientName: string
  patientId: string
  medicationName: string
  dosage: string
  duration: string
  instructions: string
  doctorName: string
  timestamp: string
}

interface VerificationResult {
  success: boolean
  verified: boolean
  message: string
  prescriptionData?: PrescriptionData
  error?: string
}

export default function PrescriptionVerification() {
  const [qrCodeInput, setQrCodeInput] = useState('')
  const [prescriptionId, setPrescriptionId] = useState('')
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpId, setOtpId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [mockOtpCode, setMockOtpCode] = useState('')
  const [dispensed, setDispensed] = useState(false)
  const [dispenseLoading, setDispenseLoading] = useState(false)
  const [dispenseResult, setDispenseResult] = useState<any>(null)

  const handleQRCodeScan = async () => {
    if (!qrCodeInput.trim()) {
      alert('Please enter a QR code or prescription ID')
      return
    }

    setLoading(true)
    setVerificationResult(null)

    try {
      // Parse QR code data (assuming it contains JSON with prescription ID)
      let qrData
      let prescriptionIdFromQR

      try {
        qrData = JSON.parse(qrCodeInput)
        prescriptionIdFromQR = qrData.prescriptionId
      } catch {
        // If not JSON, treat as prescription ID
        prescriptionIdFromQR = qrCodeInput
      }

      console.log('🔍 Verifying prescription...')
      console.log('Prescription ID:', prescriptionIdFromQR)

      // Load prescription from localStorage (in real app, fetch from database)
      const storedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
      const prescription = storedPrescriptions.find((p: any) => p.id === prescriptionIdFromQR)

      if (prescription) {
        setVerificationResult({
          success: true,
          verified: true,
          message: 'Prescription verified successfully',
          prescriptionData: {
            prescriptionId: prescription.id,
            patientName: prescription.patientName,
            patientId: prescription.patientId,
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            duration: prescription.duration,
            instructions: prescription.instructions || '',
            doctorName: 'Dr. Smith', // Mock - in real app, get from prescription
            timestamp: prescription.timestamp
          }
        })
        setPrescriptionId(prescriptionIdFromQR)
        console.log('✅ Prescription verified successfully')
      } else {
        setVerificationResult({
          success: false,
          verified: false,
          message: 'Prescription not found'
        })
        console.log('❌ Prescription verification failed: Prescription not found')
      }
    } catch (error: any) {
      console.error('❌ Verification failed:', error)
      setVerificationResult({
        success: false,
        verified: false,
        message: 'Failed to verify prescription',
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualEntry = async () => {
    if (!prescriptionId.trim()) {
      alert('Please enter a prescription ID')
      return
    }

    setLoading(true)
    setVerificationResult(null)

    try {
      console.log('🔍 Verifying prescription manually...')
      console.log('Prescription ID:', prescriptionId)

      // Load prescription from localStorage (in real app, fetch from database)
      const storedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
      const prescription = storedPrescriptions.find((p: any) => p.id === prescriptionId)

      if (prescription) {
        setVerificationResult({
          success: true,
          verified: true,
          message: 'Prescription verified successfully',
          prescriptionData: {
            prescriptionId: prescription.id,
            patientName: prescription.patientName,
            patientId: prescription.patientId,
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            duration: prescription.duration,
            instructions: prescription.instructions || '',
            doctorName: 'Dr. Smith', // Mock - in real app, get from prescription
            timestamp: prescription.timestamp
          }
        })
        console.log('✅ Prescription verified successfully')
      } else {
        setVerificationResult({
          success: false,
          verified: false,
          message: 'Prescription not found'
        })
        console.log('❌ Prescription verification failed: Prescription not found')
      }
    } catch (error: any) {
      console.error('❌ Verification failed:', error)
      setVerificationResult({
        success: false,
        verified: false,
        message: 'Failed to verify prescription',
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const sendOTP = async () => {
    if (!verificationResult?.prescriptionData) {
      alert('No verified prescription found')
      return
    }

    setOtpLoading(true)

    try {
      console.log('📱 Sending OTP to patient...')
      
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: verificationResult.prescriptionData.patientId, // In real app, get from prescription data
          email: (verificationResult.prescriptionData as any).patientEmail || 'patient@example.com', // Use patient email from prescription
          prescriptionId: verificationResult.prescriptionData.prescriptionId
        }),
      })

      const result = await response.json()

      if (result.success) {
        setOtpId(result.otpId)
        setOtpSent(true)
        console.log('✅ OTP sent successfully')
        
        // For development: extract OTP from console logs
        // In real app, patient would receive this via SMS
        console.log('🔑 [DEV] Mock OTP Code will be shown in UI for testing')
      } else {
        alert(`Failed to send OTP: ${result.error}`)
      }
    } catch (error: any) {
      console.error('❌ Failed to send OTP:', error)
      alert(`Failed to send OTP: ${error.message}`)
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otpId || !otpCode.trim()) {
      alert('Please enter the OTP code')
      return
    }

    setOtpLoading(true)

    try {
      console.log('🔐 Verifying OTP...')
      
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otpId: otpId,
          otp: otpCode
        }),
      })

      const result = await response.json()

      if (result.success) {
        setOtpVerified(true)
        console.log('✅ OTP verified successfully')
        alert('✅ Patient identity confirmed! Prescription is ready for dispensing.')
      } else {
        alert(`❌ OTP verification failed: ${result.message}`)
      }
    } catch (error: any) {
      console.error('❌ Failed to verify OTP:', error)
      alert(`Failed to verify OTP: ${error.message}`)
    } finally {
      setOtpLoading(false)
    }
  }

  const dispensePrescription = async () => {
    if (!verificationResult?.prescriptionData) {
      alert('No verified prescription found')
      return
    }

    setDispenseLoading(true)

    try {
      console.log('💊 Dispensing prescription...')
      
      const pharmacyData = {
        pharmacyId: 'PH001', // In real app, get from auth context
        pharmacyName: 'MediTrust Pharmacy',
        pharmacistId: 'PHARM001', // In real app, get from auth context
        pharmacistName: 'Dr. Pharmacist',
        dispensedAt: new Date().toISOString()
      }
      
      // Update prescription status in localStorage (in real app, update database)
      const storedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
      const updatedPrescriptions = storedPrescriptions.map((p: any) => {
        if (p.id === verificationResult.prescriptionData.prescriptionId) {
          return {
            ...p,
            status: 'dispensed',
            dispensedAt: pharmacyData.dispensedAt,
            pharmacyData
          }
        }
        return p
      })
      localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions))

      setDispensed(true)
      setDispenseResult({
        success: true,
        prescriptionId: verificationResult.prescriptionData.prescriptionId,
        pharmacyData,
        message: 'Prescription successfully dispensed'
      })
      console.log('✅ Prescription dispensed successfully')
      alert('✅ Prescription successfully dispensed!')
    } catch (error: any) {
      console.error('❌ Failed to dispense prescription:', error)
      alert(`Failed to dispense prescription: ${error.message}`)
    } finally {
      setDispenseLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Prescription Verification</h1>
        
        {/* QR Code Scanner Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">📱 QR Code Scanner</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Scan QR code or enter prescription ID"
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleQRCodeScan}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Manual Entry Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">⌨️ Manual Entry</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter prescription ID"
              value={prescriptionId}
              onChange={(e) => setPrescriptionId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleManualEntry}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Manually'}
            </button>
          </div>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`mb-8 p-6 rounded-lg border-2 ${
            verificationResult.verified 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">
                {verificationResult.verified ? '✅' : '❌'}
              </span>
              <h3 className="text-xl font-semibold">
                {verificationResult.verified ? 'Verified' : 'Not Verified'}
              </h3>
            </div>
            
            <p className="text-gray-700 mb-4">{verificationResult.message}</p>
            
            {verificationResult.verified && verificationResult.prescriptionData && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3">📋 Prescription Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Patient:</span>
                    <span className="ml-2 text-gray-800">{verificationResult.prescriptionData.patientName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ID:</span>
                    <span className="ml-2 text-gray-800">{verificationResult.prescriptionData.patientId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Medication:</span>
                    <span className="ml-2 text-gray-800">{verificationResult.prescriptionData.medicationName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Dosage:</span>
                    <span className="ml-2 text-gray-800">{verificationResult.prescriptionData.dosage}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="ml-2 text-gray-800">{verificationResult.prescriptionData.duration}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Doctor:</span>
                    <span className="ml-2 text-gray-800">{verificationResult.prescriptionData.doctorName}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-600">Instructions:</span>
                  <p className="text-gray-800 mt-1">{verificationResult.prescriptionData.instructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* OTP Verification Section */}
        {verificationResult?.verified && !otpVerified && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">🔐 Patient Identity Verification</h3>
            
            {!otpSent ? (
              <div>
                <p className="text-blue-700 mb-4">
                  To ensure the prescription belongs to the correct patient, we'll send a verification code to their registered email address.
                </p>
                <button
                  onClick={sendOTP}
                  disabled={otpLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? 'Sending...' : 'Send OTP to Patient Email'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-blue-700 mb-4">
                  A 6-digit verification code has been sent to the patient's email. Please ask the patient to check their email and provide the code.
                </p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <button
                    onClick={verifyOTP}
                    disabled={otpLoading || otpCode.length !== 6}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  OTP expires in 5 minutes. Maximum 3 attempts allowed.
                </p>
                
                {/* Development Helper - Show OTP in Console */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium">🔧 Development Mode</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Check the server console for the OTP code. In production, this would be sent via email.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Verification Status */}
        {otpVerified && !dispensed && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✅</span>
              <h3 className="text-2xl font-semibold text-green-800">Identity Confirmed</h3>
            </div>
            <p className="text-green-700 mb-4">
              Patient identity has been verified. The prescription is authentic and ready for dispensing.
            </p>
            <div className="bg-white p-4 rounded-lg border mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">✅ Verification Complete</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Prescription verified</li>
                <li>• Patient identity confirmed via OTP</li>
                <li>• Ready for medication dispensing</li>
              </ul>
            </div>
            
            {/* Dispense Button */}
            <div className="text-center">
              <button
                onClick={dispensePrescription}
                disabled={dispenseLoading}
                className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {dispenseLoading ? 'Dispensing...' : '💊 Dispense Medication'}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                This will mark the prescription as dispensed
              </p>
            </div>
          </div>
        )}

        {/* Dispensed Status */}
        {dispensed && dispenseResult && (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💊</span>
              <h3 className="text-2xl font-semibold text-blue-800">Medication Dispensed</h3>
            </div>
            <p className="text-blue-700 mb-4">
              The prescription has been successfully dispensed.
            </p>
            
            <div className="bg-white p-4 rounded-lg border mb-4">
              <h4 className="font-semibold text-gray-800 mb-3">📋 Dispensing Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Pharmacy:</span>
                  <span className="ml-2 text-gray-800">{dispenseResult.pharmacyData?.pharmacyName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Pharmacist:</span>
                  <span className="ml-2 text-gray-800">{dispenseResult.pharmacyData?.pharmacistName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Dispensed At:</span>
                  <span className="ml-2 text-gray-800">{new Date(dispenseResult.pharmacyData?.dispensedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="ml-2 text-green-600 font-semibold">✅ Dispensed</span>
                </div>
              </div>
            </div>

            {/* Dispensing Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Dispensing Record</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Prescription ID:</span>
                  <span className="text-xs font-mono text-blue-800 break-all">{dispenseResult.prescriptionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Status:</span>
                  <span className="text-sm text-green-600 font-semibold">✅ Dispensed</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}