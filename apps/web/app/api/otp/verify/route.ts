import { NextRequest, NextResponse } from 'next/server'
import { OTPService } from '@/lib/otp/otp-service'

export async function POST(request: NextRequest) {
  try {
    const { otpId, otp } = await request.json()
    
    if (!otpId || !otp) {
      return NextResponse.json(
        { error: 'OTP ID and OTP code are required' },
        { status: 400 }
      )
    }

    console.log('🔐 Verifying OTP...')
    console.log('OTP ID:', otpId)
    console.log('OTP Code:', otp)

    const otpService = new OTPService()
    const result = await otpService.verifyOTP(otpId, otp)

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          message: result.message,
          error: result.error 
        },
        { status: 400 }
      )
    }

    console.log('✅ OTP verified successfully')

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      prescriptionId: result.prescriptionId
    })
  } catch (error: any) {
    console.error('❌ Failed to verify OTP:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
