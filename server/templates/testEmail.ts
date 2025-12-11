import mjml2html from 'mjml'

export function renderTestEmail(recipientName?: string): string {
  const name = recipientName || 'there'
  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-title>Chaos Ops Test E-Mail</mj-title>
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
      .button-primary {
        background: #fbbf24 !important;
        color: #fff !important;
        border: 2px solid #181818 !important;
        border-radius: 8px !important;
        box-shadow: 2px 4px 0 #181818 !important;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        display: inline-block !important;
        padding: 12px 24px !important;
      }
      .tape {
        background: repeating-linear-gradient(135deg, #fffbe7 0 6px, #fbbf24 6px 12px) !important;
        border-radius: 6px !important;
        border: 1.5px solid #eab308 !important;
        box-shadow: 0 1px 4px rgba(234, 179, 8, 0.3) !important;
        height: 16px !important;
        width: 45px !important;
        margin: 0 auto 10px auto !important;
        transform: rotate(-3deg) !important;
      }
      .feature-icon {
        width: 24px !important;
        height: 24px !important;
        vertical-align: middle !important;
        margin-right: 8px !important;
      }
      .logo-text {
        font-size: 32px !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
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
          Dein digitaler Begleiter für Events und Veranstaltungen
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Main Card -->
    <mj-section padding="20px">
      <mj-column css-class="card" padding="25px">
        <!-- Greeting with Hand Wave Icon -->
        <mj-text align="center" padding="0 0 15px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif">
          <svg class="feature-icon" style="width: 28px; height: 28px; margin-right: 8px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7 10 5-5 5 5"/>
            <path d="m7 15 5-5 5 5"/>
          </svg>
          <span style="font-size: 22px; font-weight: 700; font-family: 'Gloria Hallelujah', 'Caveat', 'Comic Neue', cursive, sans-serif;">
            Hallo ${name}!
          </span>
        </mj-text>
        
        <!-- Success Message with Check Icon -->
        <mj-text padding="8px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif" align="center">
          <svg class="feature-icon" style="width: 20px; height: 20px; margin-right: 6px; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          Dies ist eine <strong>Test-E-Mail</strong> von Chaos Ops! 
        </mj-text>
        
        <mj-text padding="8px 0" color="#181818" font-family="'Inter', 'Roboto', Arial, sans-serif" align="center">
          Wenn du diese Nachricht erhältst, funktioniert deine E-Mail-Konfiguration einwandfrei.
        </mj-text>

        <!-- Features Section -->
        <mj-text padding="20px 0 15px 0" font-size="18px" font-weight="700" css-class="handwritten" color="#181818" align="center">
          Was du mit Chaos Ops machen kannst:
        </mj-text>
        
        <!-- Feature List with Lucide Icons -->
        <mj-table padding="0 0 25px 0">
          <tr>
            <td style="padding: 8px 0; vertical-align: top; width: 40px;">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 16px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif; line-height: 1.5;">
              <strong>Veranstaltungen verwalten</strong><br/>
              <span style="color: #64748b; font-size: 14px;">Erstelle und organisiere Events mit detaillierten Tagesplänen</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 16px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif; line-height: 1.5;">
              <strong>Zeitpläne erstellen</strong><br/>
              <span style="color: #64748b; font-size: 14px;">Sessions, Workshops und Pausen übersichtlich planen</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 16px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif; line-height: 1.5;">
              <strong>Teams organisieren</strong><br/>
              <span style="color: #64748b; font-size: 14px;">Zusammenarbeit und Kommunikation vereinfachen</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 16px; color: #181818; font-family: 'Inter', 'Roboto', Arial, sans-serif; line-height: 1.5;">
              <strong>Live-Displays</strong><br/>
              <span style="color: #64748b; font-size: 14px;">Tagespläne in Echtzeit auf Displays und Projektoren anzeigen</span>
            </td>
          </tr>
        </mj-table>

        <!-- CTA Button with Rocket Icon -->
        <mj-text align="center" padding="10px 0 0 0">
          <a href="https://chaos-ops.de/" class="button-primary" style="display: inline-flex; align-items: center; gap: 8px;">
            <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
            </svg>
            Zur App
          </a>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer with Mail Icon -->
    <mj-section padding="20px 20px 30px 20px">
      <mj-column>
        <mj-divider border-color="#cbd5e1" border-width="1px" padding="15px 0" />
        
        <!-- Mail Icon -->
        <mj-text align="center" padding="10px 0">
          <svg style="width: 48px; height: 48px; opacity: 0.6;" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </mj-text>
        
        <mj-text align="center" color="#64748b" font-size="12px" padding="8px 0" font-family="'Inter', 'Roboto', Arial, sans-serif">
          Diese E-Mail wurde automatisch von Chaos Ops versendet.
        </mj-text>
        <mj-text align="center" color="#64748b" font-size="12px" padding="4px 0" font-family="'Inter', 'Roboto', Arial, sans-serif">
          © 2025 Lu2a Development | Chaos Ops
        </mj-text>
        <mj-text align="center" padding="10px 0 0 0">
          <a href="https://lu2adevelopment.de" style="color: #2563eb; text-decoration: none; font-weight: 600; font-family: 'Inter', 'Roboto', Arial, sans-serif;">
            lu2adevelopment.de
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
