'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PharmacistUser {
  email: string
  name: string
  pharmacy: string
  loginTime: number
}

export default function PharmacyDashboard() {
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

  const handleSignOut = () => {
    localStorage.removeItem('pharmacistUser')
    router.push('/pharmacy/signin')
  }

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
              <h1 className="text-2xl font-bold text-[#37322F]">Pharmacy Dashboard</h1>
              <p className="text-sm text-[#605A57]">Welcome back, {user.name}</p>
              <p className="text-xs text-[#605A57]">{user.pharmacy}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[#605A57]">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-[#37322F] hover:bg-[#2a2522] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#605A57] mb-1">Verifications Today</p>
                  <p className="text-2xl font-bold text-[#37322F]">8</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🔍</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#605A57] mb-1">Successful</p>
                  <p className="text-2xl font-bold text-[#37322F]">7</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#605A57] mb-1">Dispensed</p>
                  <p className="text-2xl font-bold text-[#37322F]">12</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xl">💊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#605A57] mb-1">Avg Response</p>
                  <p className="text-2xl font-bold text-[#37322F]">2.3s</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⏱️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#37322F] mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => router.push('/pharmacy/verify-prescription')}
                className="group bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-[#37322F] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-xl">🔍</span>
                  </div>
                  <div>
                    <h4 className="text-[#37322F] font-semibold text-sm">Verify Prescription</h4>
                    <p className="text-[#605A57] text-xs">Scan QR code</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => router.push('/pharmacy/dispense-prescription')}
                className="group bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-[#37322F] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-xl">💊</span>
                  </div>
                  <div>
                    <h4 className="text-[#37322F] font-semibold text-sm">Dispense</h4>
                    <p className="text-[#605A57] text-xs">Mark as dispensed</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => router.push('/pharmacy/verification-history')}
                className="group bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-[#37322F] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div>
                    <h4 className="text-[#37322F] font-semibold text-sm">Verification History</h4>
                    <p className="text-[#605A57] text-xs">View all verifications</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => router.push('/pharmacy/dispense-history')}
                className="group bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] p-6 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-[#37322F] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <span className="text-white text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="text-[#37322F] font-semibold text-sm">Dispense History</h4>
                    <p className="text-[#605A57] text-xs">View all dispenses</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
            <div className="px-6 py-5 border-b border-[#E0DEDB]">
              <h3 className="text-lg font-semibold text-[#37322F]">Recent Activity</h3>
              <p className="text-sm text-[#605A57] mt-1">Latest verification and dispense activities</p>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-xs">✅</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-[#605A57]">
                              Verified prescription for <span className="font-medium text-[#37322F]">John Doe</span>
                            </p>
                            <p className="text-xs text-[#605A57] mt-1">Medication: Amoxicillin 500mg</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-[#605A57]">
                            <time>1 hour ago</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-xs">💊</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-[#605A57]">
                              Dispensed prescription for <span className="font-medium text-[#37322F]">Sarah Johnson</span>
                            </p>
                            <p className="text-xs text-[#605A57] mt-1">Medication: Ibuprofen 200mg</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-[#605A57]">
                            <time>2 hours ago</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-xs">⏳</span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-[#605A57]">
                              Verification request from <span className="font-medium text-[#37322F]">Dr. Smith</span>
                            </p>
                            <p className="text-xs text-[#605A57] mt-1">Awaiting verification</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-[#605A57]">
                            <time>3 hours ago</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}