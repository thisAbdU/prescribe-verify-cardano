import AuthHeader from '@/components/auth/AuthHeader'
import DoctorSignUp from '@/components/auth/DoctorSignUp'

export default function DoctorSignUpPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F3]">
      <AuthHeader />
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#37322F]">Doctor Sign Up</h1>
            <p className="mt-2 text-sm text-[#605A57]">Create your secure account</p>
          </div>
          <DoctorSignUp />
        </div>
      </div>
    </div>
  )
}
