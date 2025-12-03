import mjml2html from 'mjml'

export function invitationEmail(
  email: string,
  organisationName: string,
  inviterName: string,
  invitationUrl: string,
  role: string
): string {
  const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-title>Einladung zu ${organisationName} - Chaos Ops</mj-title>
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
      .paper-background { background: #fffbe7 !important; }
      .card {
        background: #fff !important;
        border: 2px solid #181818 !important;
        border-radius: 16px 20px 18px 16px !important;
        box-shadow: 2px 4px 0 #e5e7eb, 0 2px 8px rgba(0,0,0,0.08) !important;
      }
      .button-primary {
        background: #10b981 !important;
        color: #fff !important;
        border: 2px solid #181818 !important;
        border-radius: 8px !important;
        box-shadow: 2px 4px 0 #181818 !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        display: inline-block !important;
        padding: 15px 30px !important;
        font-size: 18px !important;
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
      .logo-text {
        font-size: 32px !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1) !important;
      }
      .warning-box { background: #fef3c7 !important; border: 2px solid #d97706 !important; border-radius: 8px !important; padding: 16px !important; }
    </mj-style>
  </mj-head>
  <mj-body css-class="paper-background">
    <mj-section padding="20px 20px 0 20px">
      <mj-column>
        <mj-text align="center" padding="0"><div class="tape"></div></mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="20px 20px 10px 20px">
      <mj-column>
        <mj-text align="center" css-class="handwritten logo-text" padding="0 0 15px 0" color="#181818">Chaos Ops</mj-text>
        <mj-text align="center" color="#4a5568" font-size="14px" padding="8px 0 0 0">Einladung zur Organisation</mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="20px">
      <mj-column css-class="card" padding="30px">
        <mj-text align="center" padding="0 0 10px 0">
          <span style="font-size: 22px; font-weight: 700;" class="handwritten">Hallo!</span>
        </mj-text>
        <mj-text align="center">
          <strong>${inviterName}</strong> hat dich eingeladen, der Organisation <strong>"${organisationName}"</strong> als <strong>${role}</strong> beizutreten.
        </mj-text>
        <mj-text align="center" padding="10px 0 20px 0">
          Klicke auf den Button, um deine Einladung anzunehmen und dein Konto zu erstellen.
        </mj-text>

        <mj-text align="center" padding="10px 0 20px 0">
          <a href="${invitationUrl}" class="button-primary">Einladung annehmen</a>
        </mj-text>

        <mj-text padding="0 0 10px 0">
          <div class="warning-box">
            <strong>Hinweis:</strong> Dieser Einladungslink ist <strong>7 Tage</strong> gültig. Danach benötigst du eine neue Einladung.
          </div>
        </mj-text>

        <mj-text align="center" color="#64748b" font-size="13px" padding="20px 0 0 0">
          Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br/>
          <a href="${invitationUrl}" style="color: #2563eb; word-break: break-all;">${invitationUrl}</a>
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="20px 20px 30px 20px">
      <mj-column>
        <mj-divider border-color="#cbd5e1" border-width="1px" padding="15px 0" />
        <mj-text align="center" color="#64748b" font-size="12px" padding="8px 0">Diese E-Mail wurde automatisch vom Chaos Ops Team gesendet.</mj-text>
        <mj-text align="center" color="#64748b" font-size="12px" padding="4px 0">© 2025 Lu2a Development | Chaos Ops</mj-text>
        <mj-text align="center" padding="10px 0 0 0">
          <a href="https://lu2adevelopment.de" style="color: #2563eb; text-decoration: none; font-weight: 600;">lu2adevelopment.de</a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `

  const { html } = mjml2html(mjmlTemplate, { validationLevel: 'soft' })
  return html
}
