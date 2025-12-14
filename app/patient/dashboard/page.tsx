"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Prescription = {
  id: string
  doctorName: string
  medication: string
  dosage: string
  date: string
}

export default function PatientDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  useEffect(() => {
    const storedUser = localStorage.getItem("patientUser")
    if (!storedUser) {
      router.push("/patient/signin")
      return
    }
    const user = JSON.parse(storedUser)
    setUserName(user.name || user.email || "Patient")

    // Load prescriptions (mock) — in real app fetch from API/database
    const mock: Prescription[] = [
      { id: "RX-1001", doctorName: "Dr. John Smith", medication: "Amoxicillin", dosage: "500mg", date: "2025-10-01" },
      { id: "RX-1002", doctorName: "Dr. Emily Davis", medication: "Ibuprofen", dosage: "200mg", date: "2025-10-03" },
    ]
    setPrescriptions(mock)
  }, [router])

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <div className="max-w-[1060px] mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#37322F]">Welcome, {userName}</h1>
          <button
            className="text-sm underline"
            onClick={() => {
              localStorage.removeItem("patientUser")
              router.push("/patient/signin")
            }}
          >
            Sign out
          </button>
        </div>

        <div className="bg-white border border-[#E0DEDB] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#37322F]">Your Prescriptions</h2>
          </div>
          {prescriptions.length === 0 ? (
            <div className="text-[#605A57]">No prescriptions yet. Please contact your doctor.</div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((p) => (
                <div key={p.id} className="flex items-center justify-between border border-[#E0DEDB] rounded-md p-3">
                  <div>
                    <div className="text-[#37322F] font-medium">{p.medication} • {p.dosage}</div>
                    <div className="text-[#605A57] text-sm">{p.doctorName} • {p.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-sm underline" onClick={() => router.push(`/patient/prescriptions/${p.id}`)}>View QR</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


