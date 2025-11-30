"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function PatientSettings() {
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("patientUser")
    if (!storedUser) {
      router.push("/patient/signin")
      return
    }
    const settingsRaw = localStorage.getItem("patientSettings")
    if (settingsRaw) {
      try {
        const s = JSON.parse(settingsRaw)
        setNotificationsEnabled(Boolean(s.notificationsEnabled))
      } catch {}
    }
  }, [router])

  const handleSave = () => {
    localStorage.setItem("patientSettings", JSON.stringify({ notificationsEnabled }))
  }

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <div className="max-w-[1060px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#37322F] mb-6">Settings</h1>
        <div className="bg-white border border-[#E0DEDB] rounded-lg p-6 space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
            <span className="text-[#37322F]">Receive prescription notifications (email/SMS)</span>
          </label>
          <button onClick={handleSave} className="bg-[#37322F] text-white px-4 py-2 rounded-md">Save</button>
        </div>
      </div>
    </div>
  )
}


