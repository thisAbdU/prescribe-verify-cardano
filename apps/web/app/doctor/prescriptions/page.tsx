'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, FunnelIcon, PrinterIcon, EyeIcon } from '@heroicons/react/24/outline'
import PrescriptionStats from '@/components/prescription/PrescriptionStats'

interface DoctorUser {
  email: string
  name: string
  loginTime: number
}

interface Prescription {
  id: string
  patientName: string
  patientId: string
  medicationName: string
  dosage: string
  duration: string
  instructions: string
  doctorNotes: string
  timestamp: string
  qrCode: string
  status: string
}

export default function PrescriptionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<DoctorUser | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('doctorUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/doctor/signin')
    }

    // Load prescriptions
    const storedPrescriptions = localStorage.getItem('prescriptions')
    if (storedPrescriptions) {
      const parsed = JSON.parse(storedPrescriptions)
      // Sort by timestamp, most recent first
      const sorted = parsed.sort((a: Prescription, b: Prescription) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setPrescriptions(sorted)
    }
    
    setLoading(false)
  }, [router])

  // Filter and search logic
  useEffect(() => {
    let filtered = [...prescriptions]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'patient':
          return a.patientName.localeCompare(b.patientName)
        case 'medication':
          return a.medicationName.localeCompare(b.medicationName)
        default:
          return 0
      }
    })

    setFilteredPrescriptions(filtered)
  }, [prescriptions, searchTerm, statusFilter, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto"></div>
          <p className="mt-4 text-[#605A57]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to sign in
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      {/* Header */}
      <header className="bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border-b border-[#E0DEDB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-[#37322F]">All Prescriptions</h1>
              <p className="text-sm text-[#605A57]">View and manage all issued prescriptions</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/doctor/issue-prescription')}
                className="px-4 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] transition-colors"
              >
                Issue New
              </button>
              <button
                onClick={() => router.push('/doctor/dashboard')}
                className="px-4 py-2 border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Statistics */}
          {prescriptions.length > 0 && <PrescriptionStats />}

          {/* Search and Filter Controls */}
          {prescriptions.length > 0 && (
            <div className="mb-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#605A57]" />
                  <input
                    type="text"
                    placeholder="Search prescriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-[#E0DEDB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37322F] focus:border-[#37322F]"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#E0DEDB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37322F] focus:border-[#37322F]"
                >
                  <option value="all">All Status</option>
                  <option value="issued">Issued</option>
                  <option value="verified">Verified</option>
                  <option value="dispensed">Dispensed</option>
                  <option value="expired">Expired</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-[#E0DEDB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37322F] focus:border-[#37322F]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="patient">Patient Name</option>
                  <option value="medication">Medication</option>
                </select>

                {/* Results Count */}
                <div className="flex items-center text-sm text-[#605A57]">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  {filteredPrescriptions.length} of {prescriptions.length} prescriptions
                </div>
              </div>
            </div>
          )}

          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F5F3] rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-[#37322F] mb-2">No prescriptions yet</h3>
              <p className="text-[#605A57] mb-6">Start by issuing your first prescription</p>
              <button
                onClick={() => router.push('/doctor/issue-prescription')}
                className="px-6 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] transition-colors"
              >
                Issue First Prescription
              </button>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#F7F5F3] rounded-full flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-[#37322F] mb-2">No prescriptions found</h3>
              <p className="text-[#605A57] mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setSortBy('newest')
                }}
                className="px-6 py-2 bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-[#37322F]">
                          {prescription.medicationName}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {prescription.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#605A57] mt-1">
                        Patient: {prescription.patientName} • ID: {prescription.patientId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#605A57]">
                        {new Date(prescription.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-[#605A57] font-mono">
                        {prescription.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#605A57] uppercase tracking-wide">Dosage</p>
                      <p className="text-sm text-[#37322F] font-medium">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#605A57] uppercase tracking-wide">Duration</p>
                      <p className="text-sm text-[#37322F] font-medium">{prescription.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#605A57] uppercase tracking-wide">QR Code</p>
                      <p className="text-xs text-[#37322F] font-mono break-all">{prescription.qrCode}</p>
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div className="mb-4">
                      <p className="text-xs text-[#605A57] uppercase tracking-wide mb-1">Instructions</p>
                      <p className="text-sm text-[#37322F]">{prescription.instructions}</p>
                    </div>
                  )}

                  {prescription.doctorNotes && (
                    <div className="mb-4">
                      <p className="text-xs text-[#605A57] uppercase tracking-wide mb-1">Doctor Notes</p>
                      <p className="text-sm text-[#37322F]">{prescription.doctorNotes}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => router.push(`/doctor/prescriptions/${prescription.id}`)}
                      className="px-3 py-1 text-xs bg-[#F7F5F3] text-[#37322F] rounded border border-[#E0DEDB] hover:bg-[#E0DEDB] transition-colors flex items-center"
                    >
                      <EyeIcon className="h-3 w-3 mr-1" />
                      View Details
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="px-3 py-1 text-xs bg-[#37322F] text-white rounded hover:bg-[#2a2522] transition-colors flex items-center"
                    >
                      <PrinterIcon className="h-3 w-3 mr-1" />
                      Print QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
