import { Router, Request, Response } from 'express'
import { sendMail, testConnection } from '../mailer'
import { renderTestEmail } from '../templates/testEmail'
import { logger } from '../logger'

const router = Router()

// Simple test route to verify SMTP config in environments
router.post('/test', async (req: Request, res: Response) => {
  const { to, name } = req.body ?? {}
  
  logger.info('Email test endpoint called', { to, name })
  
  if (!to) {
    logger.warn('Email test called without recipient')
    return res.status(400).json({ error: 'Missing "to" field in request body' })
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    logger.warn('Invalid email format', { to })
    return res.status(400).json({ error: 'Invalid email address format' })
  }
  
  try {
    logger.info('Rendering test email template')
    const html = renderTestEmail(name)
    
    logger.info('Attempting to send test email', { to, hasName: !!name })
    await sendMail({
      to,
      subject: 'KonfiDayPlaner: Test E-Mail 🎉',
      text: `Hallo ${name || 'there'}! Dies ist eine Test-E-Mail vom KonfiDayPlaner. Wenn du diese Nachricht erhältst, funktioniert deine E-Mail-Konfiguration einwandfrei.`,
      html,
    })
    
    logger.info('Test email sent successfully', { to })
    res.json({ 
      ok: true, 
      message: 'Email sent successfully',
      to 
    })
  } catch (e: any) {
    logger.error('Failed to send test email', { 
      error: e?.message, 
      code: e?.code,
      to,
      stack: process.env.NODE_ENV === 'development' ? e?.stack : undefined
    })
    
    // Provide detailed error message in development
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { 
          message: e?.message,
          code: e?.code,
          stack: e?.stack 
        }
      : { message: e?.message || 'Failed to send email' }
    
    res.status(500).json({ 
      error: e?.message || 'Failed to send email',
      details: errorDetails
    })
  }
})

// Test SMTP connection without sending email
router.post('/test-connection', async (req: Request, res: Response) => {
  logger.info('SMTP connection test endpoint called')
  
  try {
    const result = await testConnection()
    
    if (result.success) {
      logger.info('SMTP connection test successful')
      res.json(result)
    } else {
      logger.warn('SMTP connection test failed', result)
      res.status(500).json(result)
    }
  } catch (error: any) {
    logger.error('Error testing SMTP connection', { 
      error: error.message,
      stack: error.stack
    })
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Failed to test SMTP connection'
    })
  }
})

export default router
