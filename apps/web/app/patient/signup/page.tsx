"use client"

import PatientSignUp from "@/components/auth/PatientSignUp"

export default function Page() {
  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <div className="max-w-[1060px] mx-auto px-4 py-10">
        {/* Header Bar */}
        <div className="w-full bg-white border border-[#E0DEDB] rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#37322F] text-white flex items-center justify-center text-lg font-bold">M</div>
            <div>
              <div className="text-[#37322F] text-xl font-semibold leading-tight">MediTrust</div>
              <div className="text-[#605A57] text-sm leading-tight">Secure Prescriptions</div>
            </div>
          </div>
          <a href="/" className="text-[#37322F] hover:text-[#2a2522] text-sm font-medium">Back to Home</a>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#37322F]">Patient Sign Up</h1>
          <p className="text-[#605A57] mt-2">Create your secure account</p>
        </div>
        <PatientSignUp />
      </div>
    </div>
  )
}


