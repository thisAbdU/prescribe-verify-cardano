/**
 * Notifications Service
 * 
 * Background service for sending SMS and email notifications.
 * 
 * This service:
 * 1. Polls Supabase events table for new notification events
 * 2. Sends SMS via Twilio
 * 3. Sends emails via SendGrid/SMTP
 * 4. Updates event status after sending
 * 
 * TODO: Install dependencies
 *   npm install twilio nodemailer @supabase/supabase-js dotenv
 */

import twilio from "twilio";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// TODO: Initialize clients
// const twilioClient = twilio(
//   process.env.TWILIO_SID!,
//   process.env.TWILIO_TOKEN!
// );
// 
// const emailTransporter = nodemailer.createTransport({
//   // Configure based on provider (SendGrid, SMTP, etc.)
//   service: "SendGrid", // or SMTP config
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_API_KEY,
//   },
// });
// 
// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

const POLL_INTERVAL_MS = 10000; // Poll every 10 seconds

/**
 * Main notification worker loop
 */
async function runNotificationWorker() {
  console.log("Starting notifications worker...");

  // TODO: Implement polling loop
  // 
  // while (true) {
  //   try {
  //     await processPendingNotifications();
  //     await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  //   } catch (error) {
  //     console.error("Error in notification worker:", error);
  //     await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  //   }
  // }
}

/**
 * Process pending notifications from events table
 */
async function processPendingNotifications() {
  // TODO: Implement
  // 
  // 1. Query Supabase events table for pending notifications
  //    const { data: events } = await supabase
  //      .from("events")
  //      .select("*")
  //      .eq("processed", false)
  //      .order("created_at", { ascending: true })
  //      .limit(10);
  // 
  // 2. For each event:
  //    - Determine notification type (SMS, email, or both)
  //    - Fetch patient contact info from Supabase (if needed)
  //    - Send notification
  //    - Mark event as processed
}

/**
 * Send SMS notification via Twilio
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  // TODO: Implement SMS sending
  // 
  // await twilioClient.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_FROM!,
  //   to: phoneNumber,
  // });
  // 
  // console.log(`SMS sent to ${phoneNumber}`);

  throw new Error("TODO: Implement sendSMS using Twilio");
}

/**
 * Send email notification
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  // TODO: Implement email sending
  // 
  // await emailTransporter.sendMail({
  //   from: process.env.EMAIL_FROM!,
  //   to,
  //   subject,
  //   html: htmlBody,
  // });
  // 
  // console.log(`Email sent to ${to}`);

  throw new Error("TODO: Implement sendEmail using nodemailer");
}

/**
 * Send prescription issued notification
 */
export async function notifyPrescriptionIssued(
  prescriptionId: string,
  patientPhone?: string,
  patientEmail?: string,
  redeemCode?: string
): Promise<void> {
  // TODO: Implement
  // 
  // const smsMessage = `Your prescription has been issued. Redeem code: ${redeemCode}. Visit [link] to view details.`;
  // const emailSubject = "Your Prescription Has Been Issued";
  // const emailBody = generatePrescriptionIssuedEmail(prescriptionId, redeemCode);
  // 
  // if (patientPhone) {
  //   await sendSMS(patientPhone, smsMessage);
  // }
  // 
  // if (patientEmail) {
  //   await sendEmail(patientEmail, emailSubject, emailBody);
  // }
}

/**
 * Send prescription redeemed notification
 */
export async function notifyPrescriptionRedeemed(
  prescriptionId: string,
  patientPhone?: string,
  patientEmail?: string
): Promise<void> {
  // TODO: Implement
  // 
  // const smsMessage = `Your prescription has been redeemed. Visit [link] to view details.`;
  // const emailSubject = "Your Prescription Has Been Redeemed";
  // const emailBody = generatePrescriptionRedeemedEmail(prescriptionId);
  // 
  // if (patientPhone) {
  //   await sendSMS(patientPhone, smsMessage);
  // }
  // 
  // if (patientEmail) {
  //   await sendEmail(patientEmail, emailSubject, emailBody);
  // }
}

/**
 * Generate email template for prescription issued
 */
function generatePrescriptionIssuedEmail(
  prescriptionId: string,
  redeemCode?: string
): string {
  // TODO: Implement email template
  return `
    <html>
      <body>
        <h1>Your Prescription Has Been Issued</h1>
        <p>Prescription ID: ${prescriptionId}</p>
        ${redeemCode ? `<p>Redeem Code: ${redeemCode}</p>` : ""}
        <p>Visit [link] to view your prescription details.</p>
      </body>
    </html>
  `;
}

/**
 * Generate email template for prescription redeemed
 */
function generatePrescriptionRedeemedEmail(prescriptionId: string): string {
  // TODO: Implement email template
  return `
    <html>
      <body>
        <h1>Your Prescription Has Been Redeemed</h1>
        <p>Prescription ID: ${prescriptionId}</p>
        <p>Your prescription has been successfully redeemed at the pharmacy.</p>
      </body>
    </html>
  `;
}

// Start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runNotificationWorker().catch(console.error);
}

