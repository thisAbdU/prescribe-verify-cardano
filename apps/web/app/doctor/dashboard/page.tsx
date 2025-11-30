'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RecentPrescriptions from '@/components/prescription/RecentPrescriptions'

interface DoctorUser {
  email: string
  name: string
  loginTime: number
}

export default function DoctorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<DoctorUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('doctorUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/doctor/signin')
    }
    setLoading(false)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('doctorUser')
    router.push('/doctor/signin')
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
              <h1 className="text-2xl font-bold text-[#37322F]">MediTrust Dashboard</h1>
              <p className="text-sm text-[#605A57]">Welcome back, {user.name}</p>
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[#37322F] rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">📝</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#605A57] truncate">
                        Issue New Prescription
                      </dt>
                      <dd className="text-lg font-medium text-[#37322F]">
                        Create secure prescription
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => router.push('/doctor/issue-prescription')}
                    className="w-full bg-[#37322F] hover:bg-[#2a2522] text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Create Prescription
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Prescriptions */}
            <RecentPrescriptions />

            {/* Verification Requests */}
            <div className="bg-white overflow-hidden shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[#37322F] rounded-md flex items-center justify-center">
                      <span className="text-white text-sm">🔍</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#605A57] truncate">
                        Verification Requests
                      </dt>
                      <dd className="text-lg font-medium text-[#37322F]">
                        3 pending
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-[#37322F] hover:bg-[#2a2522] text-white px-4 py-2 rounded-md text-sm font-medium">
                    Review Requests
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB] rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-[#37322F]">
                  Recent Activity
                </h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      <li>
                        <div className="relative pb-8">
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <span className="text-white text-xs">📝</span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-[#605A57]">
                                  Issued prescription for <span className="font-medium text-[#37322F]">John Doe</span>
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-[#605A57]">
                                <time>2 hours ago</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
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
                                  Prescription verified by <span className="font-medium text-[#37322F]">CVS Pharmacy</span>
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-[#605A57]">
                                <time>4 hours ago</time>
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
                                <span className="text-white text-xs">🔍</span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-[#605A57]">
                                  Verification request from <span className="font-medium text-[#37322F]">Walgreens</span>
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-[#605A57]">
                                <time>6 hours ago</time>
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
          </div>
        </div>
      </main>
    </div>
  )
}
