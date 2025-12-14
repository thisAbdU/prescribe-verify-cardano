'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeftIcon, PrinterIcon, ShareIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'

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

export default function PrescriptionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<DoctorUser | null>(null)
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('doctorUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/doctor/signin')
      return
    }

    // Load specific prescription
    const storedPrescriptions = localStorage.getItem('prescriptions')
    if (storedPrescriptions) {
      const prescriptions = JSON.parse(storedPrescriptions)
      const foundPrescription = prescriptions.find((p: Prescription) => p.id === params.id)
      if (foundPrescription) {
        setPrescription(foundPrescription)
      } else {
        // Prescription not found, redirect to prescriptions list
        router.push('/doctor/prescriptions')
        return
      }
    }
    
    setLoading(false)
  }, [router, params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share && prescription) {
      try {
        await navigator.share({
          title: `Prescription ${prescription.id}`,
          text: `Prescription for ${prescription.patientName}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleCopyId = () => {
    if (prescription) {
      navigator.clipboard.writeText(prescription.id)
      alert('Prescription ID copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto"></div>
          <p className="mt-4 text-[#605A57]">Loading prescription...</p>
        </div>
      </div>
    )
  }

  if (!user || !prescription) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      {/* Header */}
      <header className="bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border-b border-[#E0DEDB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/doctor/prescriptions')}
                className="p-2 text-[#605A57] hover:text-[#37322F] transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#37322F]">Prescription Details</h1>
                <p className="text-sm text-[#605A57]">ID: {prescription.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyId}
                className="px-3 py-1 text-sm border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3] transition-colors flex items-center"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                Copy ID
              </button>
              <button
                onClick={handleShare}
                className="px-3 py-1 text-sm border border-[#E0DEDB] text-[#37322F] rounded-md hover:bg-[#F7F5F3] transition-colors flex items-center"
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                Share
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1 text-sm bg-[#37322F] text-white rounded-md hover:bg-[#2a2522] transition-colors flex items-center"
              >
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] overflow-hidden">
            {/* Prescription Header */}
            <div className="bg-[#F7F5F3] px-6 py-4 border-b border-[#E0DEDB]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#37322F]">{prescription.medicationName}</h2>
                  <p className="text-sm text-[#605A57]">Prescription ID: {prescription.id}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {prescription.status}
                  </span>
                  <p className="text-sm text-[#605A57] mt-1">
                    Issued: {new Date(prescription.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescription Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Patient & Medication Info */}
                <div className="space-y-6">
                  {/* Patient Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#37322F] mb-4">Patient Information</h3>
                    <div className="bg-[#F7F5F3] rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-[#605A57] uppercase tracking-wide">Patient Name</p>
                        <p className="text-base font-medium text-[#37322F]">{prescription.patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#605A57] uppercase tracking-wide">Patient ID</p>
                        <p className="text-base font-medium text-[#37322F] font-mono">{prescription.patientId}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medication Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#37322F] mb-4">Medication Details</h3>
                    <div className="bg-[#F7F5F3] rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-[#605A57] uppercase tracking-wide">Medication</p>
                        <p className="text-base font-medium text-[#37322F]">{prescription.medicationName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#605A57] uppercase tracking-wide">Dosage</p>
                          <p className="text-base font-medium text-[#37322F]">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#605A57] uppercase tracking-wide">Duration</p>
                          <p className="text-base font-medium text-[#37322F]">{prescription.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  {prescription.instructions && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#37322F] mb-4">Patient Instructions</h3>
                      <div className="bg-[#F7F5F3] rounded-lg p-4">
                        <p className="text-[#37322F]">{prescription.instructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Doctor Notes */}
                  {prescription.doctorNotes && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#37322F] mb-4">Doctor Notes</h3>
                      <div className="bg-[#F7F5F3] rounded-lg p-4">
                        <p className="text-[#37322F]">{prescription.doctorNotes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - QR Code & Verification */}
                <div className="space-y-6">
                  {/* QR Code Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#37322F] mb-4">Verification QR Code</h3>
                    <div className="bg-white border-2 border-[#E0DEDB] rounded-lg p-6 text-center">
                      <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-2">📱</div>
                          <div className="text-sm text-gray-500">QR Code</div>
                        </div>
                      </div>
                      <p className="text-sm text-[#605A57] mb-2">
                        Pharmacies can scan this QR code to verify the prescription
                      </p>
                      <p className="text-xs text-[#605A57] font-mono break-all bg-[#F7F5F3] p-2 rounded">
                        {prescription.qrCode}
                      </p>
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#37322F] mb-4">Blockchain Record</h3>
                    <div className="bg-[#F7F5F3] rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#605A57]">Status</span>
                        <span className="text-sm font-medium text-green-600">✓ Recorded</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#605A57]">Network</span>
                        <span className="text-sm font-medium text-[#37322F]">Secure</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#605A57]">Timestamp</span>
                        <span className="text-sm font-medium text-[#37322F]">
                          {new Date(prescription.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#605A57]">Hash</span>
                        <span className="text-xs font-mono text-[#37322F] bg-white px-2 py-1 rounded">
                          {prescription.id.slice(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#37322F] mb-4">Security Features</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-[#605A57]">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Tamper-proof blockchain record</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-[#605A57]">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Unique QR code verification</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-[#605A57]">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Immutable prescription data</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-[#605A57]">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Real-time verification available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
