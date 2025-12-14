import twilio from 'twilio'
import nodemailer from 'nodemailer'

// Twilio configuration (optional)
const twilioClient = 
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

// Email transporter configuration (lazy initialization)
function getEmailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }

  const emailService = process.env.EMAIL_SERVICE || 'gmail'
  
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    })
  }

  return nodemailer.createTransport({
    service: emailService,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export interface PrescriptionNotificationData {
  prescriptionId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorName: string
  medicationName: string
  dosage: string
  duration: string
  instructions: string
  qrCodeUrl: string
  transactionHash: string
  verificationUrl: string
}

export class NotificationService {
  
  // Send SMS notification to patient
  async sendSMSNotification(data: PrescriptionNotificationData): Promise<{
    success: boolean
    message: string
    sid?: string
    error?: string
  }> {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      return {
        success: false,
        message: 'SMS not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.',
        error: 'SMS service not configured'
      }
    }

    try {
      console.log('📱 Sending SMS notification...')
      
      const smsMessage = `Your prescription from Dr. ${data.doctorName} is ready. ID: ${data.prescriptionId}. Check your email for QR code and details. ${data.verificationUrl}`
      
      const message = await twilioClient.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.patientPhone
      })
      
      console.log('✅ SMS sent successfully:', message.sid)
      
      return {
        success: true,
        message: 'SMS notification sent successfully',
        sid: message.sid
      }
    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error)
      return {
        success: false,
        message: 'Failed to send SMS notification',
        error: error.message
      }
    }
  }

  // Send email notification to patient
  async sendEmailNotification(data: PrescriptionNotificationData): Promise<{
    success: boolean
    message: string
    messageId?: string
    error?: string
  }> {
    const emailTransporter = getEmailTransporter()
    
    if (!emailTransporter) {
      return {
        success: false,
        message: 'Email not configured. Please set EMAIL_USER and EMAIL_PASS (or SENDGRID_API_KEY) environment variables.',
        error: 'Email service not configured'
      }
    }

    if (!process.env.EMAIL_FROM && !process.env.EMAIL_USER) {
      return {
        success: false,
        message: 'EMAIL_FROM or EMAIL_USER environment variable is required.',
        error: 'Email from address not configured'
      }
    }

    try {
      console.log('📧 Sending email notification...')
      
      const emailHtml = this.generateEmailHTML(data)
      
      const mailOptions: any = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: data.patientEmail,
        subject: `Your Prescription from Dr. ${data.doctorName} - ${data.prescriptionId}`,
        html: emailHtml
      }

      // Only add QR code attachment if qrCodeUrl is provided and is a data URL
      if (data.qrCodeUrl && data.qrCodeUrl.startsWith('data:image')) {
        // Extract base64 data from data URL
        const base64Data = data.qrCodeUrl.split(',')[1]
        mailOptions.attachments = [
          {
            filename: 'prescription-qr.png',
            content: base64Data,
            encoding: 'base64',
            cid: 'qr-code'
          }
        ]
      }
      
      const result = await emailTransporter.sendMail(mailOptions)
      
      console.log('✅ Email sent successfully:', result.messageId)
      
      return {
        success: true,
        message: 'Email notification sent successfully',
        messageId: result.messageId
      }
    } catch (error: any) {
      console.error('❌ Failed to send email:', error)
      return {
        success: false,
        message: 'Failed to send email notification',
        error: error.message
      }
    }
  }

  // Send both SMS and email notifications
  async sendPrescriptionNotifications(data: PrescriptionNotificationData): Promise<{
    sms: { success: boolean; message: string; error?: string }
    email: { success: boolean; message: string; error?: string }
  }> {
    console.log('📬 Sending prescription notifications...')
    
    // Send both notifications in parallel
    const [smsResult, emailResult] = await Promise.allSettled([
      this.sendSMSNotification(data),
      this.sendEmailNotification(data)
    ])
    
    const sms = smsResult.status === 'fulfilled' 
      ? smsResult.value 
      : { success: false, message: 'SMS failed', error: smsResult.reason }
    
    const email = emailResult.status === 'fulfilled' 
      ? emailResult.value 
      : { success: false, message: 'Email failed', error: emailResult.reason }
    
    console.log('📬 Notification results:', { sms, email })
    
    return { sms, email }
  }

  // Generate HTML email template
  private generateEmailHTML(data: PrescriptionNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Prescription - ${data.prescriptionId}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .prescription-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .qr-section { text-align: center; margin: 20px 0; }
          .qr-code { max-width: 200px; height: auto; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Your Prescription is Ready</h1>
            <p>Prescription ID: ${data.prescriptionId}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.patientName},</h2>
            <p>Your prescription from <strong>Dr. ${data.doctorName}</strong> has been issued.</p>
            
            <div class="prescription-details">
              <h3>📋 Prescription Details</h3>
              <p><strong>Medication:</strong> ${data.medicationName}</p>
              <p><strong>Dosage:</strong> ${data.dosage}</p>
              <p><strong>Duration:</strong> ${data.duration}</p>
              <p><strong>Instructions:</strong> ${data.instructions}</p>
              <p><strong>Prescription ID:</strong> ${data.prescriptionId}</p>
              <p><strong>Security:</strong> ✅ Secured and verifiable</p>
            </div>
            
            <div class="qr-section">
              <h3>📱 QR Code for Pharmacy</h3>
              <img src="cid:qr-code" alt="Prescription QR Code" class="qr-code">
              <p>Show this QR code to the pharmacist for verification</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${data.verificationUrl}" class="button">Verify Prescription Online</a>
            </div>
          </div>
          
          <div class="footer">
            <p>This prescription is secure and verifiable.</p>
            <p>If you have any questions, please contact your doctor.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}
