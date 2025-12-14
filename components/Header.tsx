'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              <div className="flex flex-col space-y-1">
                <div className="w-1 h-3 bg-white"></div>
                <div className="w-1 h-2 bg-white"></div>
                <div className="w-1 h-4 bg-white"></div>
              </div>
              <span className="ml-2 text-xl font-bold">MEDITRUST</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="hover:text-purple-300 transition-colors">
              About Us
            </Link>
            <Link href="/doctors" className="hover:text-purple-300 transition-colors">
              Doctors
            </Link>
            <Link href="/patients" className="hover:text-purple-300 transition-colors">
              Patients
            </Link>
            <Link href="/pharmacies" className="hover:text-purple-300 transition-colors">
              Pharmacies
            </Link>
            <Link href="/blog" className="hover:text-purple-300 transition-colors">
              Blog
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-purple-300 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black">
              <Link href="/about" className="block px-3 py-2 hover:text-purple-300 transition-colors">
                About Us
              </Link>
              <Link href="/doctors" className="block px-3 py-2 hover:text-purple-300 transition-colors">
                Doctors
              </Link>
              <Link href="/patients" className="block px-3 py-2 hover:text-purple-300 transition-colors">
                Patients
              </Link>
              <Link href="/pharmacies" className="block px-3 py-2 hover:text-purple-300 transition-colors">
                Pharmacies
              </Link>
              <Link href="/blog" className="block px-3 py-2 hover:text-purple-300 transition-colors">
                Blog
              </Link>
              <div className="pt-4 space-y-2">
                <Link 
                  href="/login" 
                  className="block w-full bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-center"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
