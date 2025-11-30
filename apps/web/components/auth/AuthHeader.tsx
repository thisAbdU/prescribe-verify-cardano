'use client'

import Link from 'next/link'

export default function AuthHeader() {
  return (
    <header className="bg-white shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border-b border-[#E0DEDB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 bg-[#37322F] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white text-lg font-bold">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#37322F] group-hover:text-[#2a2522] transition-colors">
                MediTrust
              </h1>
              <p className="text-xs text-[#605A57] -mt-1">Secure Prescriptions</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-sm text-[#605A57] hover:text-[#37322F] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
