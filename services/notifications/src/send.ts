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

import "dotenv/config";
import twilio from "twilio";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are required");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const twilioClient =
  process.env.TWILIO_SID && process.env.TWILIO_TOKEN
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
    : null;

const emailTransporter =
  process.env.SENDGRID_API_KEY || process.env.EMAIL_USER
    ? nodemailer.createTransport(
        process.env.SENDGRID_API_KEY
          ? {
              service: "SendGrid",
              auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY,
              },
            }
          : {
              host: process.env.SMTP_HOST || "smtp.gmail.com",
              port: parseInt(process.env.SMTP_PORT || "587", 10),
              secure: false,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
              },
            }
      )
    : null;

const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || "10000", 10);

/**
 * Main notification worker loop
 */
async function runNotificationWorker() {
  console.log("Starting notifications worker...");

  while (true) {
    try {
      await processPendingNotifications();
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    } catch (error) {
      console.error("Error in notification worker:", error);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

/**
 * Process pending notifications from events table
 */
async function processPendingNotifications() {
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("processed", false)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error || !events || events.length === 0) {
    return;
  }

  for (const event of events) {
    try {
      if (event.type === "prescription_issued") {
        await notifyPrescriptionIssued(event.prescription_id, undefined, undefined);
      } else if (event.type === "prescription_redeemed") {
        await notifyPrescriptionRedeemed(event.prescription_id, undefined, undefined);
      }

      await supabase
        .from("events")
        .update({ processed: true })
        .eq("id", event.id);
    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
    }
  }
}

/**
 * Send SMS notification via Twilio
 */
export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<void> {
  if (!twilioClient || !process.env.TWILIO_FROM) {
    console.warn("Twilio not configured, skipping SMS");
    return;
  }

  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_FROM,
    to: phoneNumber,
  });

  console.log(`SMS sent to ${phoneNumber}`);
}

/**
 * Send email notification
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  if (!emailTransporter || !process.env.EMAIL_FROM) {
    console.warn("Email transporter not configured, skipping email");
    return;
  }

  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: htmlBody,
  });

  console.log(`Email sent to ${to}`);
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
  const smsMessage = `Your prescription has been issued. Prescription ID: ${prescriptionId}${redeemCode ? `. Redeem code: ${redeemCode}` : ""}. Visit your dashboard to view details.`;
  const emailSubject = "Your Prescription Has Been Issued";
  const emailBody = generatePrescriptionIssuedEmail(prescriptionId, redeemCode);

  if (patientPhone) {
    await sendSMS(patientPhone, smsMessage);
  }

  if (patientEmail) {
    await sendEmail(patientEmail, emailSubject, emailBody);
  }
}

/**
 * Send prescription redeemed notification
 */
export async function notifyPrescriptionRedeemed(
  prescriptionId: string,
  patientPhone?: string,
  patientEmail?: string
): Promise<void> {
  const smsMessage = `Your prescription has been redeemed. Prescription ID: ${prescriptionId}. Visit your dashboard to view details.`;
  const emailSubject = "Your Prescription Has Been Redeemed";
  const emailBody = generatePrescriptionRedeemedEmail(prescriptionId);

  if (patientPhone) {
    await sendSMS(patientPhone, smsMessage);
  }

  if (patientEmail) {
    await sendEmail(patientEmail, emailSubject, emailBody);
  }
}

/**
 * Generate email template for prescription issued
 */
function generatePrescriptionIssuedEmail(
  prescriptionId: string,
  redeemCode?: string
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Your Prescription Has Been Issued</h1>
          <p>Your prescription has been successfully issued and is ready for redemption.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Prescription ID:</strong> ${prescriptionId}</p>
            ${redeemCode ? `<p><strong>Redeem Code:</strong> ${redeemCode}</p>` : ""}
          </div>
          <p>Please visit your dashboard to view full prescription details.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate email template for prescription redeemed
 */
function generatePrescriptionRedeemedEmail(prescriptionId: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a;">Your Prescription Has Been Redeemed</h1>
          <p>Your prescription has been successfully redeemed at the pharmacy.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Prescription ID:</strong> ${prescriptionId}</p>
          </div>
          <p>Visit your dashboard to view the redemption details.</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;
}

// Start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runNotificationWorker().catch(console.error);
}

