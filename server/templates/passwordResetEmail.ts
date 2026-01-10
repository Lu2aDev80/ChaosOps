import mjml2html from 'mjml'

export function renderPasswordResetEmail(userName: string, resetLink: string): string {
  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-title>Passwort zurücksetzen - Chaos Ops</mj-title>
    <mj-font name="Gloria Hallelujah" href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap" />
    <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="'Inter', 'Roboto', Arial, sans-serif" />
      <mj-text color="#181818" font-size="16px" line-height="1.6" />
    </mj-attributes>
    <mj-style inline="inline">
      .handwritten { font-family: 'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif !important; color: #181818 !important; }
      .paper-background { background: #fffbe7 !important; }
      .card { background: #fff !important; border: 2px solid #181818 !important; border-radius: 16px 20px 18px 16px !important; box-shadow: 2px 4px 0 #e5e7eb, 0 2px 8px rgba(0,0,0,0.08) !important; }
      .button-reset { background: #2563eb !important; color: #fff !important; border: 2px solid #181818 !important; border-radius: 8px !important; box-shadow: 2px 4px 0 #181818 !important; text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important; font-weight: 700 !important; text-decoration: none !important; display: inline-block !important; padding: 15px 30px !important; font-size: 18px !important; }
      .warning-box { background: #fef3c7 !important; border: 2px solid #d97706 !important; border-radius: 8px !important; padding: 16px !important; margin: 16px 0 !important; }
      .logo-text { font-size: 32px !important; font-weight: 800 !important; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.1) !important; }
    </mj-style>
  </mj-head>
  <mj-body css-class="paper-background">
    <mj-section padding="20px 20px 10px 20px">
      <mj-column>
        <mj-text align="center" css-class="handwritten logo-text" padding="0 0 15px 0" color="#181818">Chaos Ops</mj-text>
        <mj-text align="center" color="#4a5568" font-size="14px" padding="8px 0 0 0" font-family="'Inter', 'Roboto', Arial, sans-serif">Passwort zurücksetzen</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="20px">
      <mj-column css-class="card" padding="30px">
        <mj-text align="center" padding="0 0 20px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif">
          <span style="font-size: 24px; font-weight: 700; font-family: 'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif;">Hallo ${userName}!</span>
        </mj-text>
        <mj-text padding="8px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif" align="center">
          Du hast eine Passwortzurücksetzung angefordert. Klicke auf den folgenden Button, um ein neues Passwort festzulegen:
        </mj-text>
        <mj-text align="center" padding="20px 0">
          <a href="${resetLink}" class="button-reset">Passwort zurücksetzen</a>
        </mj-text>
        <mj-text padding="20px 0 10px 0">
          <div class="warning-box">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <svg style="width: 20px; height: 20px; margin-right: 8px; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/>
                <path d="m12 17 .01 0"/>
              </svg>
              <span style="font-weight: 700; color: #92400e; font-family: 'Inter', 'Roboto', Arial, sans-serif;">Wichtiger Hinweis</span>
            </div>
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5; font-family: 'Inter', 'Roboto', Arial, sans-serif;">Dieser Link ist <strong>1 Stunde gültig</strong>. Danach musst du eine neue Zurücksetzung anfordern.</p>
          </div>
        </mj-text>
        <mj-text padding="20px 0 0 0" color="#64748b" font-size="13px" align="center" font-family="'Inter', 'Roboto', Arial, sans-serif">
          Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
          <a href="${resetLink}" style="color: #2563eb; word-break: break-all; font-family: 'Roboto Mono', monospace;">${resetLink}</a>
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="20px 20px 30px 20px">
      <mj-column>
        <mj-divider border-color="#cbd5e1" border-width="1px" padding="15px 0" />
        <mj-text align="center" color="#64748b" font-size="12px" padding="8px 0" font-family="'Inter', 'Roboto', Arial, sans-serif">Diese E-Mail wurde automatisch von Chaos Ops versendet.</mj-text>
        <mj-text align="center" color="#64748b" font-size="12px" padding="4px 0" font-family="'Inter', 'Roboto', Arial, sans-serif">© 2026 Lu2a Development | Chaos Ops</mj-text>
        <mj-text align="center" padding="10px 0 0 0"><a href="https://chaos-ops.de" style="color: #2563eb; text-decoration: none; font-weight: 600; font-family: 'Inter', 'Roboto', Arial, sans-serif;">chaos-ops.de</a></mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `
  const { html } = mjml2html(mjmlTemplate, { validationLevel: 'soft' })
  return html
}
