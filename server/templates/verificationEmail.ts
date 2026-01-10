import mjml2html from 'mjml'

export function renderVerificationEmail(userName: string, organisationName: string, verificationLink: string): string {
  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-title>E-Mail-Adresse bestätigen - Chaos Ops</mj-title>
    <mj-font name="Gloria Hallelujah" href="https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap" />
    <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
    <mj-attributes>
      <mj-all font-family="'Inter', 'Roboto', Arial, sans-serif" />
      <mj-text color="#181818" font-size="16px" line-height="1.6" />
    </mj-attributes>
    <mj-style inline="inline">
      .handwritten {
        font-family: 'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif !important;
        color: #181818 !important;
      }
      .paper-background {
        background: #fffbe7 !important;
      }
      .card {
        background: #fff !important;
        border: 2px solid #181818 !important;
        border-radius: 16px 20px 18px 16px !important;
        box-shadow: 2px 4px 0 #e5e7eb, 0 2px 8px rgba(0,0,0,0.08) !important;
      }
      .button-verify {
        background: #10b981 !important;
        color: #fff !important;
        border: 2px solid #181818 !important;
        border-radius: 8px !important;
        box-shadow: 2px 4px 0 #181818 !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        display: inline-block !important;
        padding: 15px 30px !important;
        font-size: 18px !important;
      }
      .button-secondary {
        background: #64748b !important;
        color: #fff !important;
        border: 2px solid #181818 !important;
        border-radius: 6px !important;
        box-shadow: 1px 2px 0 #181818 !important;
        text-decoration: none !important;
        display: inline-block !important;
        padding: 8px 16px !important;
        font-size: 14px !important;
        font-weight: 600 !important;
      }
      .tape {
        background: repeating-linear-gradient(135deg, #fffbe7 0 6px, #10b981 6px 12px) !important;
        border-radius: 6px !important;
        border: 1.5px solid #059669 !important;
        box-shadow: 0 1px 4px rgba(5, 150, 105, 0.3) !important;
        height: 16px !important;
        width: 45px !important;
        margin: 0 auto 10px auto !important;
        transform: rotate(-3deg) !important;
      }
      .warning-box {
        background: #fef3c7 !important;
        border: 2px solid #d97706 !important;
        border-radius: 8px !important;
        padding: 16px !important;
        margin: 16px 0 !important;
      }
      .logo-text {
        font-size: 32px !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1) !important;
      }
    </mj-style>
  </mj-head>
  <mj-body css-class="paper-background">
    <!-- Decorative Tape -->
    <mj-section padding="20px 20px 0 20px">
      <mj-column>
        <mj-text align="center" padding="0">
          <div class="tape"></div>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Header with Text Logo -->
    <mj-section padding="20px 20px 10px 20px">
      <mj-column>
        <mj-text align="center" css-class="handwritten logo-text" padding="0 0 15px 0" color="#181818">
          Chaos Ops
        </mj-text>
        <mj-text align="center" color="#4a5568" font-size="14px" padding="8px 0 0 0" font-family="'Inter', 'Roboto', Arial, sans-serif">
          E-Mail-Adresse bestätigen
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Main Card -->
    <mj-section padding="20px">
      <mj-column css-class="card" padding="30px">
        <!-- Greeting with Mail Icon -->
        <mj-text align="center" padding="0 0 20px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif">
          <svg style="width: 48px; height: 48px; margin-bottom: 16px;" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <br/>
          <span style="font-size: 24px; font-weight: 700; font-family: 'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif;">
            Hallo ${userName}!
          </span>
        </mj-text>
        
        <!-- Welcome Message -->
        <mj-text padding="8px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif" align="center">
          Willkommen bei <strong>Chaos Ops</strong>! Du wurdest als Administrator für die Organisation <strong>"${organisationName}"</strong> registriert.
        </mj-text>
        
        <mj-text padding="8px 0 20px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif" align="center">
          Um dein Konto zu aktivieren, bestätige bitte deine E-Mail-Adresse:
        </mj-text>

        <!-- Verification Button -->
        <mj-text align="center" padding="20px 0">
          <a href="${verificationLink}" class="button-verify">
            <svg style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
            E-Mail-Adresse bestätigen
          </a>
        </mj-text>

        <!-- Warning Box -->
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
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
              Dieser Bestätigungslink ist <strong>24 Stunden gültig</strong>. Nach Ablauf musst du eine neue Bestätigungs-E-Mail anfordern.
            </p>
          </div>
        </mj-text>

        <!-- Features Preview -->
        <mj-text padding="20px 0 10px 0" font-size="16px" font-weight="700" color="#181818" align="center" font-family="'Inter', 'Roboto', Arial, sans-serif">
          Nach der Bestätigung kannst du:
        </mj-text>
        
        <mj-table padding="0 0 20px 0">
          <tr>
            <td style="padding: 6px 0; vertical-align: top; width: 40px;">
              <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11h-6"/>
              </svg>
            </td>
            <td style="padding: 6px 0 6px 12px; font-size: 15px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
              Benutzer zu deiner Organisation einladen
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; vertical-align: top;">
              <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </td>
            <td style="padding: 6px 0 6px 12px; font-size: 15px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
              Events und Tagespläne erstellen
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; vertical-align: top;">
              <svg style="width: 20px; height: 20px;" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </td>
            <td style="padding: 6px 0 6px 12px; font-size: 15px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
              Live-Displays für Veranstaltungen verwalten
            </td>
          </tr>
        </mj-table>

        <!-- Alternative Link -->
        <mj-text padding="20px 0 0 0" color="#64748b" font-size="13px" align="center" font-family="'Inter', 'Roboto', Arial, sans-serif">
          Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
          <a href="${verificationLink}" style="color: #2563eb; word-break: break-all; font-family: 'Roboto Mono', monospace;">
            ${verificationLink}
          </a>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section padding="20px 20px 30px 20px">
      <mj-column>
        <mj-divider border-color="#cbd5e1" border-width="1px" padding="15px 0" />
        <mj-text align="center" color="#64748b" font-size="12px" padding="8px 0" font-family="'Inter', 'Roboto', Arial, sans-serif">
          Diese E-Mail wurde automatisch von Chaos Ops versendet.
        </mj-text>
        <mj-text align="center" color="#64748b" font-size="12px" padding="4px 0" font-family="'Inter', 'Roboto', Arial, sans-serif">
          © 2026 Lu2a Development | Chaos Ops
        </mj-text>
        <mj-text align="center" padding="10px 0 0 0">
          <a href="https://chaos-ops.de" style="color: #2563eb; text-decoration: none; font-weight: 600; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
            chaos-ops.de
          </a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `

  const { html, errors } = mjml2html(mjmlTemplate, { validationLevel: 'soft' })
  if (errors.length > 0) {
    console.error('MJML errors:', errors)
  }
  return html
}