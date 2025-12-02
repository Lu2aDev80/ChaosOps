import { Router } from 'express'
import { sendMail, testConnection } from '../mailer'
import { renderTestEmail } from '../templates/testEmail'

const router = Router()

// Simple test route to verify SMTP config in environments
router.post('/test', async (req, res) => {
  const { to, name } = req.body ?? {}
  if (!to) return res.status(400).json({ error: 'Missing to' })
  try {
    const html = renderTestEmail(name)
    await sendMail({
      to,
      subject: 'KonfiDayPlaner: Test E-Mail 🎉',
      text: `Hallo ${name || 'there'}! Dies ist eine Test-E-Mail vom KonfiDayPlaner. Wenn du diese Nachricht erhältst, funktioniert deine E-Mail-Konfiguration einwandfrei.`,
      html,
    })
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to send email' })
  }
})

// Test SMTP connection without sending email
router.post('/test-connection', async (req, res) => {
  try {
    const result = await testConnection()
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

export default router
