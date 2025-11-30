'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Prescription {
  id: string
  patientName: string
  medicationName: string
  dosage: string
  doctorName: string
  issueDate: string
  status: 'verified' | 'dispensed' | 'expired'
  verifiedAt?: string
  dispensedAt?: string
  dispensedBy?: string
}

interface DispenseResult {
  success: boolean
  prescriptionId: string
  dispensedAt: string
  dispensedBy: string
  message: string
  error?: string
}

export default function DispensePrescription() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [dispensing, setDispensing] = useState<string | null>(null)
  const [result, setResult] = useState<DispenseResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPrescriptions()
  }, [])

  const loadPrescriptions = () => {
    // Load verified prescriptions from localStorage
    const storedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
    const verifiedPrescriptions = storedPrescriptions.filter((p: any) => 
      p.status === 'verified' || p.status === 'dispensed'
    )
    setPrescriptions(verifiedPrescriptions)
    setLoading(false)
  }

  const handleDispense = async (prescriptionId: string) => {
    setDispensing(prescriptionId)
    setError('')
    setResult(null)

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000)) // 2-5 seconds
      
      // Get current user info
      const pharmacistUser = JSON.parse(localStorage.getItem('pharmacistUser') || '{}')
      
      // Update prescription status
      const updatedPrescriptions = prescriptions.map(p => {
        if (p.id === prescriptionId) {
          return {
            ...p,
            status: 'dispensed' as const,
            dispensedAt: new Date().toISOString(),
            dispensedBy: pharmacistUser.name || 'Unknown Pharmacist'
          }
        }
        return p
      })

      // Update localStorage
      const allPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]')
      const updatedAllPrescriptions = allPrescriptions.map((p: any) => {
        if (p.id === prescriptionId) {
          return {
            ...p,
            status: 'dispensed',
            dispensedAt: new Date().toISOString(),
            dispensedBy: pharmacistUser.name || 'Unknown Pharmacist'
          }
        }
        return p
      })
      localStorage.setItem('prescriptions', JSON.stringify(updatedAllPrescriptions))

      // Store dispense action in history
      const dispenseHistory = JSON.parse(localStorage.getItem('dispenseHistory') || '[]')
      dispenseHistory.unshift({
        id: Date.now().toString(),
        prescriptionId,
        patientName: prescriptions.find(p => p.id === prescriptionId)?.patientName,
        medicationName: prescriptions.find(p => p.id === prescriptionId)?.medicationName,
        dispensedAt: new Date().toISOString(),
        dispensedBy: pharmacistUser.name || 'Unknown Pharmacist',
        pharmacy: pharmacistUser.pharmacy || 'Unknown Pharmacy'
      })
      localStorage.setItem('dispenseHistory', JSON.stringify(dispenseHistory.slice(0, 100))) // Keep last 100

      setPrescriptions(updatedPrescriptions)
      
      setResult({
        success: true,
        prescriptionId,
        dispensedAt: new Date().toLocaleString(),
        dispensedBy: pharmacistUser.name || 'Unknown Pharmacist',
        message: 'Prescription successfully dispensed'
      })

    } catch (error) {
      setError('Failed to log dispense action. Please try again.')
    } finally {
      setDispensing(null)
    }
  }

  const resetResult = () => {
    setResult(null)
    setError('')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
        <h3 className="text-lg font-semibold text-[#37322F] mb-4">Dispense Prescriptions</h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-[#605A57] mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#37322F] mb-2">No verified prescriptions</h4>
          <p className="text-[#605A57]">Verify prescriptions first to dispense them</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="px-6 py-4 border-b border-[#E0DEDB]">
        <h3 className="text-lg font-semibold text-[#37322F]">Dispense Prescriptions</h3>
        <p className="text-sm text-[#605A57] mt-1">Mark verified prescriptions as dispensed</p>
      </div>
      
      <div className="divide-y divide-[#E0DEDB]">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="p-4 hover:bg-[#F7F5F3] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="text-sm font-medium text-[#37322F]">
                    {prescription.patientName}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    prescription.status === 'dispensed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {prescription.status === 'dispensed' ? 'Dispensed' : 'Verified'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#605A57]">
                  <div>
                    <span className="font-medium">Medication:</span> {prescription.medicationName}
                  </div>
                  <div>
                    <span className="font-medium">Dosage:</span> {prescription.dosage}
                  </div>
                  <div>
                    <span className="font-medium">Doctor:</span> {prescription.doctorName}
                  </div>
                  <div>
                    <span className="font-medium">Issue Date:</span> {prescription.issueDate}
                  </div>
                </div>

                {prescription.status === 'dispensed' && prescription.dispensedAt && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center text-sm text-green-700">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      <span>Dispensed on {new Date(prescription.dispensedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                {prescription.status === 'verified' ? (
                  <button
                    onClick={() => handleDispense(prescription.id)}
                    disabled={dispensing === prescription.id}
                    className="px-4 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {dispensing === prescription.id ? 'Dispensing...' : 'Mark as Dispensed'}
                  </button>
                ) : (
                  <div className="text-sm text-[#605A57] text-right">
                    <div className="font-medium">Already Dispensed</div>
                    <div className="text-xs">
                      {prescription.dispensedBy}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Success/Error Messages */}
      {result && (
        <div className="px-6 py-4 border-t border-[#E0DEDB] bg-green-50">
          <div className="flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800">Prescription Dispensed Successfully</h4>
              <p className="text-sm text-green-700 mt-1">{result.message}</p>
              <div className="mt-2 text-xs text-green-600">
                <div>Prescription ID: {result.prescriptionId}</div>
                <div>Dispensed at: {result.dispensedAt}</div>
                <div>Dispensed by: {result.dispensedBy}</div>
              </div>
            </div>
            <button
              onClick={resetResult}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6 py-4 border-t border-[#E0DEDB] bg-red-50">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Dispense Failed</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={resetResult}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
