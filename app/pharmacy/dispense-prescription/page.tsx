'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DispensePrescription from '@/components/verification/DispensePrescription'

interface PharmacistUser {
  email: string
  name: string
  pharmacy: string
  loginTime: number
}

export default function DispensePrescriptionPage() {
  const router = useRouter()
  const [user, setUser] = useState<PharmacistUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('pharmacistUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/pharmacy/signin')
    }
    setLoading(false)
  }, [router])

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
              <h1 className="text-2xl font-bold text-[#37322F]">Dispense Prescriptions</h1>
              <p className="text-sm text-[#605A57]">Mark verified prescriptions as dispensed</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#605A57]">{user.name} - {user.pharmacy}</span>
              <button
                onClick={() => router.push('/pharmacy/dashboard')}
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
          <DispensePrescription />
        </div>
      </main>
    </div>
  )
}
