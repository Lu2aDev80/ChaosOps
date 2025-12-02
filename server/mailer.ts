import nodemailer from 'nodemailer'
import { logger } from './logger'

export type MailOptions = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

function getFromAddress() {
  const name = process.env.MAIL_FROM_NAME || 'KonfiDayPlaner'
  const email = process.env.MAIL_FROM_EMAIL || 'info@lu2adevelopment.de'
  return `${name} <${email}>`
}

let transporter: nodemailer.Transporter | null = null

export function getTransporter() {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465
  const ignoreTLS = String(process.env.SMTP_IGNORE_TLS || '').toLowerCase() === 'true'
  const requireTLS = String(process.env.SMTP_REQUIRE_TLS || '').toLowerCase() === 'true'
  const rejectUnauthorized = String(process.env.SMTP_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false'

  if (!host || !user || !pass) {
    logger.warn('SMTP not fully configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS')
  }

  logger.info('Creating SMTP transporter for prepaid mail', { 
    host, 
    port, 
    secure, 
    user, 
    ignoreTLS, 
    requireTLS,
    rejectUnauthorized
  })

  transporter = nodemailer.createTransporter({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      ignoreTLS,
      requireTLS,
      rejectUnauthorized,
      // Cipher configuration for older servers
      ciphers: 'SSLv3'
    },
    // Connection timeout
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    // Enable debugging
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
  })
  return transporter
}

export async function sendMail(opts: MailOptions) {
  const tx = getTransporter()
  
  try {
    // Test the connection first
    logger.info('Testing SMTP connection...')
    await tx.verify()
    logger.info('SMTP connection verified successfully')
    
    const info = await tx.sendMail({
      from: opts.from || getFromAddress(),
      to: Array.isArray(opts.to) ? opts.to.join(',') : opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })
    logger.info('Mail sent successfully', { messageId: info.messageId, to: opts.to })
    return info
  } catch (error: any) {
    logger.error('Failed to send mail', { 
      error: error.message, 
      code: error.code,
      command: error.command,
      to: opts.to 
    })
    throw new Error(`Email delivery failed: ${error.message}`)
  }
}

// Add test function for debugging
export async function testConnection() {
  try {
    const tx = getTransporter()
    await tx.verify()
    return { success: true, message: 'SMTP connection successful' }
  } catch (error: any) {
    return { 
      success: false, 
      message: `SMTP connection failed: ${error.message}`,
      code: error.code,
      command: error.command
    }
  }
}
