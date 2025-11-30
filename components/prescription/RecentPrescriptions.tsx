'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Prescription {
  id: string
  patientName: string
  patientId: string
  medicationName: string
  dosage: string
  duration: string
  timestamp: string
  status: string
}

export default function RecentPrescriptions() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load prescriptions from localStorage
    const storedPrescriptions = localStorage.getItem('prescriptions')
    if (storedPrescriptions) {
      const parsed = JSON.parse(storedPrescriptions)
      // Sort by timestamp, most recent first
      const sorted = parsed.sort((a: Prescription, b: Prescription) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setPrescriptions(sorted.slice(0, 5)) // Show only 5 most recent
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] rounded-lg">
        <div className="p-5">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <div className="bg-white overflow-hidden shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-[#37322F] rounded-md flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#605A57] truncate">
                  Recent Prescriptions
                </dt>
                <dd className="text-lg font-medium text-[#37322F]">
                  No prescriptions yet
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] rounded-lg">
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#37322F] rounded-md flex items-center justify-center">
              <span className="text-white text-sm">📋</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-[#605A57] truncate">
                Recent Prescriptions
              </dt>
              <dd className="text-lg font-medium text-[#37322F]">
                {prescriptions.length} this week
              </dd>
            </dl>
          </div>
        </div>

        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="border border-[#E0DEDB] rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-[#37322F]">
                      {prescription.medicationName}
                    </h4>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {prescription.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#605A57] mt-1">
                    Patient: {prescription.patientName} • {prescription.dosage} • {prescription.duration}
                  </p>
                  <p className="text-xs text-[#605A57]">
                    ID: {prescription.id} • {new Date(prescription.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <button 
            onClick={() => router.push('/doctor/prescriptions')}
            className="w-full bg-[#37322F] hover:bg-[#2a2522] text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            View All Prescriptions
          </button>
        </div>
      </div>
    </div>
  )
}
