'use client'

import { useState, useEffect } from 'react'
import { CheckCircleIcon, ClockIcon, PrinterIcon } from '@heroicons/react/24/outline'

interface DispenseRecord {
  id: string
  prescriptionId: string
  patientName: string
  medicationName: string
  dispensedAt: string
  dispensedBy: string
  pharmacy: string
}

export default function DispenseHistory() {
  const [dispenses, setDispenses] = useState<DispenseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  useEffect(() => {
    loadDispenseHistory()
  }, [])

  const loadDispenseHistory = () => {
    const storedHistory = localStorage.getItem('dispenseHistory')
    if (storedHistory) {
      const parsed = JSON.parse(storedHistory)
      setDispenses(parsed)
    }
    setLoading(false)
  }

  const filterDispenses = (dispenses: DispenseRecord[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return dispenses.filter(dispense => {
      const dispenseDate = new Date(dispense.dispensedAt)
      
      switch (filter) {
        case 'today':
          return dispenseDate >= today
        case 'week':
          return dispenseDate >= weekAgo
        case 'month':
          return dispenseDate >= monthAgo
        default:
          return true
      }
    })
  }

  const filteredDispenses = filterDispenses(dispenses)

  const getStats = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    return {
      today: dispenses.filter(d => new Date(d.dispensedAt) >= today).length,
      week: dispenses.filter(d => new Date(d.dispensedAt) >= weekAgo).length,
      month: dispenses.filter(d => new Date(d.dispensedAt) >= monthAgo).length,
      total: dispenses.length
    }
  }

  const stats = getStats()

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

  if (dispenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
        <h3 className="text-lg font-semibold text-[#37322F] mb-4">Dispense History</h3>
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-[#605A57] mx-auto mb-4" />
          <h4 className="text-lg font-medium text-[#37322F] mb-2">No dispenses yet</h4>
          <p className="text-[#605A57]">Start dispensing prescriptions to see history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
          <div className="text-2xl font-bold text-[#37322F]">{stats.today}</div>
          <div className="text-sm text-[#605A57]">Today</div>
        </div>
        <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
          <div className="text-2xl font-bold text-[#37322F]">{stats.week}</div>
          <div className="text-sm text-[#605A57]">This Week</div>
        </div>
        <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
          <div className="text-2xl font-bold text-[#37322F]">{stats.month}</div>
          <div className="text-sm text-[#605A57]">This Month</div>
        </div>
        <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
          <div className="text-2xl font-bold text-[#37322F]">{stats.total}</div>
          <div className="text-sm text-[#605A57]">Total</div>
        </div>
      </div>

      {/* Filter and History */}
      <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
        <div className="px-6 py-4 border-b border-[#E0DEDB]">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#37322F]">Dispense History</h3>
            <div className="flex space-x-1 bg-[#F7F5F3] p-1 rounded-lg">
              {(['all', 'today', 'week', 'month'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-white text-[#37322F] shadow-sm'
                      : 'text-[#605A57] hover:text-[#37322F]'
                  }`}
                >
                  {filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-[#E0DEDB]">
          {filteredDispenses.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="w-8 h-8 text-[#605A57] mx-auto mb-2" />
              <p className="text-[#605A57]">No dispenses found for selected period</p>
            </div>
          ) : (
            filteredDispenses.slice(0, 20).map((dispense) => (
              <div key={dispense.id} className="p-4 hover:bg-[#F7F5F3] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-[#37322F]">
                          {dispense.patientName}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Dispensed
                        </span>
                      </div>
                      <p className="text-sm text-[#605A57] mb-1">
                        {dispense.medicationName}
                      </p>
                      <p className="text-xs text-[#605A57]">
                        ID: {dispense.prescriptionId} • Dispensed by: {dispense.dispensedBy}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#605A57]">
                      {new Date(dispense.dispensedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-[#605A57]">
                      {new Date(dispense.dispensedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredDispenses.length > 20 && (
          <div className="px-6 py-3 border-t border-[#E0DEDB] bg-[#F7F5F3]">
            <p className="text-sm text-[#605A57] text-center">
              Showing 20 of {filteredDispenses.length} dispenses
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
