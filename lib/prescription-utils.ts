import QRCode from 'qrcode'

// Prescription data interface
export interface PrescriptionData {
  prescriptionId: string
  patientId: string
  doctorId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  medicationName: string
  dosage: string
  duration: string
  instructions: string
  doctorNotes: string
}

// QR code data interface
export interface QRCodeData {
  prescriptionId: string
  verificationUrl: string
  timestamp: string
}

export class PrescriptionUtils {
  // Generate unique prescription ID
  generatePrescriptionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `RX${timestamp}${random}`
  }

  // Generate QR code
  async generateQRCode(prescriptionId: string): Promise<string> {
    try {
      const qrData: QRCodeData = {
        prescriptionId,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pharmacy/verify-prescription`,
        timestamp: new Date().toISOString()
      }

      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      return qrCodeDataUrl
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`)
    }
  }

  // Send prescription to patient via email/SMS (mock implementation)
  async sendPrescriptionToPatient(
    prescriptionData: PrescriptionData,
    qrCodeUrl: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Mock email/SMS sending
      console.log('Sending prescription to patient:', {
        email: prescriptionData.patientEmail,
        phone: prescriptionData.patientPhone,
        prescriptionId: prescriptionData.prescriptionId
      })

      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: true,
        message: `Prescription sent to ${prescriptionData.patientEmail} and ${prescriptionData.patientPhone}`
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to send prescription: ${error}`
      }
    }
  }

  // Validate prescription data
  validatePrescriptionData(data: Partial<PrescriptionData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.patientName?.trim()) {
      errors.push('Patient name is required')
    }

    if (!data.patientId?.trim()) {
      errors.push('Patient ID is required')
    }

    if (!data.patientEmail?.trim()) {
      errors.push('Patient email is required')
    }

    if (!data.patientPhone?.trim()) {
      errors.push('Patient phone is required')
    }

    if (!data.medicationName?.trim()) {
      errors.push('Medication name is required')
    }

    if (!data.dosage?.trim()) {
      errors.push('Dosage is required')
    }

    if (!data.duration?.trim()) {
      errors.push('Duration is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

