import * as nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import type * as SMTPTransport from 'nodemailer/lib/smtp-transport'
import { logger } from './logger'

export type MailOptions = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

function getFromAddress(): string {
  const name = process.env.MAIL_FROM_NAME || 'KonfiDayPlaner'
  const email = process.env.MAIL_FROM_EMAIL || 'info@lu2adevelopment.de'
  return `${name} <${email}>`
}

let transporter: Transporter | null = null

export function getTransporter(): Transporter {
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
    logger.warn('Email functionality will be limited until SMTP is configured')
    logger.warn('Current SMTP config:', {
      host: host || 'NOT SET',
      port: port || 'NOT SET',
      user: user || 'NOT SET',
      pass: pass ? '***SET***' : 'NOT SET'
    })
  } else {
    logger.info('SMTP configuration found', {
      host,
      port,
      user: user.substring(0, 5) + '***'
    })
  }

  logger.info('Creating SMTP transporter', { 
    host, 
    port, 
    secure, 
    user: user ? '***' : undefined,
    ignoreTLS, 
    requireTLS,
    rejectUnauthorized
  })

  // Verify nodemailer is available
  if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
    throw new Error('nodemailer is not properly installed or imported')
  }

  try {
    transporter = nodemailer.createTransport({
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
    } as SMTPTransport.Options)
    
    logger.info('SMTP transporter created successfully')
    return transporter
  } catch (error: any) {
    logger.error('Failed to create SMTP transporter', { error: error.message })
    throw new Error(`Failed to initialize email service: ${error.message}`)
  }
}

export async function sendMail(opts: MailOptions) {
  if (!opts.to) {
    throw new Error('Email recipient (to) is required')
  }
  
  if (!opts.subject) {
    throw new Error('Email subject is required')
  }
  
  if (!opts.html && !opts.text) {
    throw new Error('Email must have either html or text content')
  }

  let tx: Transporter
  try {
    tx = getTransporter()
  } catch (error: any) {
    logger.error('Failed to get transporter', { error: error.message })
    throw new Error(`Email service unavailable: ${error.message}`)
  }
  
  try {
    // Test the connection first (but don't fail if it doesn't work)
    logger.info('Attempting SMTP connection verification...')
    try {
      await tx.verify()
      logger.info('SMTP connection verified successfully')
    } catch (verifyError: any) {
      logger.warn('SMTP verification failed, but will try to send anyway', {
        error: verifyError.message,
        code: verifyError.code
      })
    }
    
    const info = await tx.sendMail({
      from: opts.from || getFromAddress(),
      to: Array.isArray(opts.to) ? opts.to.join(',') : opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    })
    
    logger.info('Mail sent successfully', { 
      messageId: info.messageId, 
      to: Array.isArray(opts.to) ? opts.to.join(',') : opts.to,
      accepted: info.accepted,
      rejected: info.rejected
    })
    
    return info
  } catch (error: any) {
    logger.error('Failed to send mail', { 
      error: error.message, 
      code: error.code,
      command: error.command,
      to: opts.to,
      stack: error.stack
    })
    
    // Provide more helpful error messages
    let errorMessage = error.message
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check SMTP username and password.'
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to SMTP server. Check host and port.'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection timed out. Check network and SMTP server status.'
    }
    
    throw new Error(`Email delivery failed: ${errorMessage}`)
  }
}

// Test function for debugging
export async function testConnection() {
  try {
    logger.info('Testing SMTP connection...')
    const tx = getTransporter()
    
    logger.info('Verifying SMTP connection...')
    await tx.verify()
    
    logger.info('SMTP connection test successful')
    return { 
      success: true, 
      message: 'SMTP connection successful',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? '***configured***' : 'not set'
      }
    }
  } catch (error: any) {
    logger.error('SMTP connection test failed', {
      error: error.message,
      code: error.code,
      command: error.command
    })
    
    return { 
      success: false, 
      message: `SMTP connection failed: ${error.message}`,
      code: error.code,
      command: error.command,
      config: {
        host: process.env.SMTP_HOST || 'not set',
        port: process.env.SMTP_PORT || 'not set',
        secure: process.env.SMTP_SECURE || 'not set',
        user: process.env.SMTP_USER ? '***configured***' : 'not set'
      }
    }
  }
}
