'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'

interface VerificationRecord {
  id: string
  prescriptionId: string
  patientName: string
  medicationName: string
  verifiedAt: string
  isValid: boolean
  error?: string
}

export default function VerificationHistory() {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load verification history from localStorage
    const storedHistory = localStorage.getItem('verificationHistory')
    if (storedHistory) {
      const parsed = JSON.parse(storedHistory)
      setVerifications(parsed)
    }
    setLoading(false)
  }, [])

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

  if (verifications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
        <h3 className="text-lg font-semibold text-[#37322F] mb-4">Verification History</h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-[#605A57] mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#37322F] mb-2">No verifications yet</h4>
          <p className="text-[#605A57]">Start by verifying your first prescription</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="px-6 py-4 border-b border-[#E0DEDB]">
        <h3 className="text-lg font-semibold text-[#37322F]">Recent Verifications</h3>
        <p className="text-sm text-[#605A57] mt-1">{verifications.length} verifications completed</p>
      </div>
      
      <div className="divide-y divide-[#E0DEDB]">
        {verifications.slice(0, 10).map((verification) => (
          <div key={verification.id} className="p-4 hover:bg-[#F7F5F3] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {verification.isValid ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-[#37322F]">
                      {verification.patientName || 'Unknown Patient'}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      verification.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {verification.isValid ? 'Verified' : 'Failed'}
                    </span>
                  </div>
                  <p className="text-sm text-[#605A57] mt-1">
                    {verification.medicationName || 'Unknown Medication'}
                  </p>
                  <p className="text-xs text-[#605A57] mt-1">
                    ID: {verification.prescriptionId}
                  </p>
                  {verification.error && (
                    <p className="text-xs text-red-600 mt-1">{verification.error}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#605A57]">
                  {new Date(verification.verifiedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-[#605A57]">
                  {new Date(verification.verifiedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {verifications.length > 10 && (
        <div className="px-6 py-3 border-t border-[#E0DEDB] bg-[#F7F5F3]">
          <p className="text-sm text-[#605A57] text-center">
            Showing 10 of {verifications.length} verifications
          </p>
        </div>
      )}
    </div>
  )
}
