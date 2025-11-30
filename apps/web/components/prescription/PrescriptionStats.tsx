'use client'

import { useState, useEffect } from 'react'

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

interface Stats {
  total: number
  thisWeek: number
  thisMonth: number
  byStatus: Record<string, number>
  topMedications: Array<{ name: string; count: number }>
}

export default function PrescriptionStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byStatus: {},
    topMedications: []
  })

  useEffect(() => {
    const storedPrescriptions = localStorage.getItem('prescriptions')
    if (storedPrescriptions) {
      const prescriptions: Prescription[] = JSON.parse(storedPrescriptions)
      
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      // Calculate stats
      const total = prescriptions.length
      const thisWeek = prescriptions.filter(p => new Date(p.timestamp) >= oneWeekAgo).length
      const thisMonth = prescriptions.filter(p => new Date(p.timestamp) >= oneMonthAgo).length

      // Status breakdown
      const byStatus = prescriptions.reduce((acc, prescription) => {
        acc[prescription.status] = (acc[prescription.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Top medications
      const medicationCounts = prescriptions.reduce((acc, prescription) => {
        acc[prescription.medicationName] = (acc[prescription.medicationName] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topMedications = Object.entries(medicationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        total,
        thisWeek,
        thisMonth,
        byStatus,
        topMedications
      })
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Prescriptions */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#37322F] rounded-md flex items-center justify-center">
              <span className="text-white text-sm">📋</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-[#605A57]">Total Prescriptions</p>
            <p className="text-2xl font-bold text-[#37322F]">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* This Week */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <span className="text-white text-sm">📅</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-[#605A57]">This Week</p>
            <p className="text-2xl font-bold text-[#37322F]">{stats.thisWeek}</p>
          </div>
        </div>
      </div>

      {/* This Month */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
              <span className="text-white text-sm">📊</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-[#605A57]">This Month</p>
            <p className="text-2xl font-bold text-[#37322F]">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
              <span className="text-white text-sm">✅</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm text-[#605A57]">Verified</p>
            <p className="text-2xl font-bold text-[#37322F]">{stats.byStatus.verified || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
