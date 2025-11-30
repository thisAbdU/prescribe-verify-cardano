import { NextRequest, NextResponse } from 'next/server'
import { OTPService } from '@/lib/otp/otp-service'

export async function POST(request: NextRequest) {
  try {
    const { phone, email, prescriptionId } = await request.json()
    
    if (!email || !prescriptionId) {
      return NextResponse.json(
        { error: 'Email and prescription ID are required' },
        { status: 400 }
      )
    }

    console.log('📧 Sending OTP to patient via email...')
    console.log('Email:', email)
    console.log('Phone:', phone || 'Not provided')
    console.log('Prescription ID:', prescriptionId)

    const otpService = new OTPService()
    const result = await otpService.sendOTP(phone || '', email, prescriptionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    console.log('✅ OTP sent successfully')

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      otpId: result.otpId
    })
  } catch (error: any) {
    console.error('❌ Failed to send OTP:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
