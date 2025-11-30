"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type PatientUser = {
  name: string
  email: string
  phone: string
}

export default function PatientSignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const storedUser = localStorage.getItem("patientUser")
    if (storedUser) {
      router.push("/patient/dashboard")
    }
  }, [router])

  const validatePassword = (pwd: string) => /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/.test(pwd)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters and include a number and special character.")
      return
    }

    setLoading(true)
    const start = performance.now()

    // Simulate uniqueness check using localStorage registry
    const registryRaw = localStorage.getItem("patientRegistry")
    const registry: PatientUser[] = registryRaw ? JSON.parse(registryRaw) : []

    if (registry.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())) {
      setLoading(false)
      setError("Email is already in use.")
      return
    }
    if (registry.some((u) => u.phone === formData.phone)) {
      setLoading(false)
      setError("Phone number is already in use.")
      return
    }

    // Create account (local mock). In production, call backend API.
    const newUser: PatientUser = { name: formData.name, email: formData.email, phone: formData.phone }
    localStorage.setItem("patientRegistry", JSON.stringify([...registry, newUser]))
    localStorage.setItem("patientUser", JSON.stringify(newUser))
    // Default settings
    localStorage.setItem("patientSettings", JSON.stringify({ notificationsEnabled: true }))

    // Simulate sending verification (email/SMS)
    setMessage("Verification sent to your email/phone. Please confirm to complete sign-up.")

    // Ensure completion time target (<= 5s) — this simulation completes quickly
    const elapsed = performance.now() - start
    const remaining = Math.max(0, 200 - elapsed) // brief UX pause only
    setTimeout(() => {
      router.push("/patient/dashboard")
    }, remaining)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#37322F] mb-2">Patient Sign Up</h2>
        <p className="text-[#605A57]">Create an account to access your prescriptions</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[#37322F] mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm text-[#37322F] mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-[#37322F] mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]"
            placeholder="+1 555 0100"
          />
        </div>
        <div>
          <label className="block text-sm text-[#37322F] mb-1">Password</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]"
            placeholder="At least 8 chars, 1 number & 1 special"
          />
          <p className="text-xs text-[#605A57] mt-1">Must include at least one number and one special character.</p>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        {message && <div className="text-sm text-green-600">{message}</div>}
        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#37322F] hover:bg-[#2a2522] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <div className="text-sm text-[#605A57]">
          Already have an account?{" "}
          <button type="button" className="underline" onClick={() => router.push("/patient/signin")}>Sign in</button>
        </div>
      </form>
      <div className="mt-6 p-4 bg-[#F7F5F3] rounded-md border border-[#E0DEDB]">
        <h3 className="text-sm font-medium text-[#37322F] mb-2">Demo Credentials:</h3>
        <div className="text-xs text-[#605A57] space-y-1">
          <p>Use <strong>patient@example.com</strong> / <strong>SecurePass123!</strong> to sign in instantly.</p>
        </div>
      </div>
    </div>
  )
}


