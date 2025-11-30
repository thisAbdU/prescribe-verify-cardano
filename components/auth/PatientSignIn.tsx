"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function PatientSignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const failedAttemptsRef = useRef<number>(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)

  useEffect(() => {
    const storedLock = localStorage.getItem("patientLockUntil")
    if (storedLock) setLockUntil(Number(storedLock))
  }, [])

  const isLocked = () => (lockUntil ? Date.now() < lockUntil : false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isLocked()) {
      setError("Account locked. Try again in 15 minutes.")
      return
    }

    setLoading(true)
    const start = performance.now()

    // Mock users to match doctor/pharmacy style (demo accounts)
    const mockUsers = [
      { email: "patient@example.com", password: "SecurePass123!", name: "Jane Patient" },
      { email: "test@meditrust.com", password: "TestPass456!", name: "Test Patient" },
    ]

    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    const validPassword = !!user && user.password === password

    if (!user || !validPassword) {
      failedAttemptsRef.current += 1
      if (failedAttemptsRef.current >= 5) {
        const until = Date.now() + 15 * 60 * 1000
        setLockUntil(until)
        localStorage.setItem("patientLockUntil", String(until))
        setError("Account locked due to too many failed attempts. Try again in 15 minutes.")
      } else {
        setError("Incorrect email or password.")
      }
      setLoading(false)
      return
    }

    // Sign user in
    localStorage.setItem("patientUser", JSON.stringify({ email: user.email, name: user.name, loginTime: Date.now() }))

    // Clear lock state on success
    failedAttemptsRef.current = 0
    localStorage.removeItem("patientLockUntil")
    setLockUntil(null)

    const elapsed = performance.now() - start
    const remaining = Math.max(0, 150 - elapsed) // keep UX fast (<3s budget)
    setTimeout(() => router.push("/patient/dashboard"), remaining)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-[0px_0px_0px_0.75px_#E0DEDB_inset] border border-[#E0DEDB]">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#37322F] mb-2">Patient Sign In</h2>
        <p className="text-[#605A57]">Access your prescriptions and QR codes</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#37322F]">Email Address *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]"
            placeholder="jane@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#37322F]">Password *</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 border-[#E0DEDB] focus:ring-[#37322F] focus:border-[#37322F]"
            placeholder="Your password"
          />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#37322F] hover:bg-[#2a2522] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#37322F] disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <div className="flex justify-between text-sm text-[#605A57]">
          <button type="button" className="underline" onClick={() => router.push("/patient/signup")}>Create account</button>
          <button type="button" className="underline" onClick={() => router.push("/patient/reset-password")}>Forgot Password</button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-[#F7F5F3] rounded-md border border-[#E0DEDB]">
        <h3 className="text-sm font-medium text-[#37322F] mb-2">Demo Credentials:</h3>
        <div className="text-xs text-[#605A57] space-y-1">
          <p><strong>Email:</strong> patient@example.com</p>
          <p><strong>Password:</strong> SecurePass123!</p>
          <p className="text-[#605A57] mt-2">Or try: test@meditrust.com / TestPass456!</p>
        </div>
      </div>
    </div>
  )
}


