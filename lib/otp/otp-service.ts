import twilio from 'twilio'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// Twilio client for SMS (backup)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Email transporter for OTP delivery
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map<string, {
  otp: string
  phone: string
  email: string
  prescriptionId: string
  createdAt: number
  attempts: number
  expiresAt: number
}>()

export interface OTPData {
  otp: string
  phone: string
  prescriptionId: string
  expiresAt: number
}

export class OTPService {
  
  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send OTP via Email
  async sendOTP(phone: string, email: string, prescriptionId: string): Promise<{
    success: boolean
    message: string
    otpId?: string
    error?: string
  }> {
    try {
      console.log('📧 Sending OTP to patient via email...')
      
      const otp = this.generateOTP()
      const otpId = crypto.randomUUID()
      const expiresAt = Date.now() + (5 * 60 * 1000) // 5 minutes
      
      // Generate HTML email for OTP
      const emailHtml = this.generateOTPEmailHTML(otp, prescriptionId)
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Your Prescription Verification Code - ${prescriptionId}`,
        html: emailHtml
      }
      
      // Send email with OTP
      const result = await emailTransporter.sendMail(mailOptions)
      
      console.log('✅ OTP email sent successfully:', result.messageId)
      console.log('📧 Email sent to:', email)
      console.log('🔑 OTP Code:', otp)
      
      // Store OTP data
      otpStore.set(otpId, {
        otp,
        phone,
        email,
        prescriptionId,
        createdAt: Date.now(),
        attempts: 0,
        expiresAt
      })
      
      console.log('✅ OTP sent successfully via email')
      console.log('🔑 OTP ID:', otpId)
      
      return {
        success: true,
        message: 'OTP sent successfully via email',
        otpId
      }
    } catch (error: any) {
      console.error('❌ Failed to send OTP email:', error)
      return {
        success: false,
        message: 'Failed to send OTP email',
        error: error.message
      }
    }
  }

  // Verify OTP
  async verifyOTP(otpId: string, enteredOTP: string): Promise<{
    success: boolean
    message: string
    prescriptionId?: string
    error?: string
  }> {
    try {
      console.log('🔐 Verifying OTP...')
      
      const otpData = otpStore.get(otpId)
      
      if (!otpData) {
        return {
          success: false,
          message: 'OTP not found or expired',
          error: 'Invalid OTP ID'
        }
      }
      
      // Check if OTP is expired
      if (Date.now() > otpData.expiresAt) {
        otpStore.delete(otpId)
        return {
          success: false,
          message: 'OTP has expired',
          error: 'OTP expired'
        }
      }
      
      // Check attempt limit
      if (otpData.attempts >= 3) {
        otpStore.delete(otpId)
        return {
          success: false,
          message: 'Too many failed attempts',
          error: 'Maximum attempts exceeded'
        }
      }
      
      // Verify OTP
      if (otpData.otp === enteredOTP) {
        // OTP is correct
        otpStore.delete(otpId)
        console.log('✅ OTP verified successfully')
        
        return {
          success: true,
          message: 'OTP verified successfully',
          prescriptionId: otpData.prescriptionId
        }
      } else {
        // OTP is incorrect
        otpData.attempts++
        otpStore.set(otpId, otpData)
        
        console.log(`❌ OTP verification failed. Attempts: ${otpData.attempts}/3`)
        
        return {
          success: false,
          message: 'Invalid OTP',
          error: `Invalid OTP. ${3 - otpData.attempts} attempts remaining`
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to verify OTP:', error)
      return {
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      }
    }
  }

  // Get OTP status
  getOTPStatus(otpId: string): {
    exists: boolean
    attempts: number
    expiresAt: number
    timeRemaining: number
  } {
    const otpData = otpStore.get(otpId)
    
    if (!otpData) {
      return {
        exists: false,
        attempts: 0,
        expiresAt: 0,
        timeRemaining: 0
      }
    }
    
    return {
      exists: true,
      attempts: otpData.attempts,
      expiresAt: otpData.expiresAt,
      timeRemaining: Math.max(0, otpData.expiresAt - Date.now())
    }
  }

  // Generate HTML email template for OTP
  private generateOTPEmailHTML(otp: string, prescriptionId: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Prescription Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .otp-section { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .otp-code { font-size: 36px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Prescription Verification Code</h1>
            <p>Prescription ID: ${prescriptionId}</p>
          </div>
          
          <div class="content">
            <h2>Your Verification Code</h2>
            <p>Please provide this verification code to the pharmacist to confirm your identity:</p>
            
            <div class="otp-section">
              <h3>Verification Code</h3>
              <div class="otp-code">${otp}</div>
              <p><strong>This code expires in 5 minutes</strong></p>
            </div>
            
            <div class="warning">
              <h3>⚠️ Important Security Information</h3>
              <ul>
                <li>This code is valid for 5 minutes only</li>
                <li>Do not share this code with anyone except the pharmacist</li>
                <li>If you did not request this code, please contact your doctor immediately</li>
                <li>Maximum 3 attempts allowed</li>
              </ul>
            </div>
            
            <p>Please show this code to the pharmacist to complete your prescription verification.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from MediTrust Prescription System.</p>
            <p>If you have any questions, please contact your doctor.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  // Clean up expired OTPs (call this periodically)
  cleanupExpiredOTPs(): void {
    const now = Date.now()
    otpStore.forEach((otpData, otpId) => {
      if (now > otpData.expiresAt) {
        otpStore.delete(otpId)
        console.log(`🧹 Cleaned up expired OTP: ${otpId}`)
      }
    })
  }
}
