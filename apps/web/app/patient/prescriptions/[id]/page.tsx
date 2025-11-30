"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

function generateQRCodeDataUrl(text: string): string {
  // Minimal placeholder QR generation: encode as data URL for demo
  // In production, use a QR lib (e.g., qrcode) to render proper QR.
  const safe = encodeURIComponent(text)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><rect width='100%' height='100%' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12'>QR:${safe}</text></svg>`
  return `data:image/svg+xml;utf8,${svg}`
}

export default function PatientPrescriptionDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const prescription = useMemo(() => {
    // Mock lookup; in real app fetch from API/database by params.id
    const all = [
      { id: "RX-1001", doctorName: "Dr. John Smith", medication: "Amoxicillin", dosage: "500mg", date: "2025-10-01" },
      { id: "RX-1002", doctorName: "Dr. Emily Davis", medication: "Ibuprofen", dosage: "200mg", date: "2025-10-03" },
    ]
    return all.find((p) => p.id === params.id)
  }, [params.id])

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false)
      if (!prescription) setNotFound(true)
    }, 200)
    return () => clearTimeout(t)
  }, [prescription])

  const qrDataUrl = useMemo(() => (prescription ? generateQRCodeDataUrl(prescription.id) : ""), [prescription])

  if (loading) return <div className="min-h-screen bg-[#F7F5F3]"> <div className="max-w-[1060px] mx-auto px-4 py-10">Loading...</div></div>
  if (notFound) return <div className="min-h-screen bg-[#F7F5F3]"><div className="max-w-[1060px] mx-auto px-4 py-10">Not found.</div></div>

  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <div className="max-w-[1060px] mx-auto px-4 py-10">
        <button className="text-sm underline mb-4" onClick={() => router.push("/patient/dashboard")}>Back</button>
        <div className="bg-white border border-[#E0DEDB] rounded-lg p-6">
          <h1 className="text-xl font-semibold text-[#37322F] mb-4">Prescription {prescription!.id}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img src={qrDataUrl} alt="Prescription QR" className="w-64 h-64 bg-white border border-[#E0DEDB]" />
              <a
                href={qrDataUrl}
                download={`${prescription!.id}.svg`}
                className="inline-block mt-3 text-sm underline"
              >
                Download QR
              </a>
            </div>
            <div className="space-y-2 text-[#37322F]">
              <div><strong>Doctor:</strong> {prescription!.doctorName}</div>
              <div><strong>Medication:</strong> {prescription!.medication}</div>
              <div><strong>Dosage:</strong> {prescription!.dosage}</div>
              <div><strong>Date:</strong> {prescription!.date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


