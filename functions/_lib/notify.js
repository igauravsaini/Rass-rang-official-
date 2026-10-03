export async function sendConfirmationEmail(env, {
  email,
  name,
  ticketNo,
  passName,
  persons,
  spotName,
  spotAddress,
  spotTimings,
  spotContact,
}) {
  const apiKey = env?.RESEND_API_KEY || (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY : undefined);
  const fromEmail = env?.EMAIL_FROM || 'Raas~Rang 2026 <tickets@raasrang.com>';

  if (!apiKey) {
    console.warn('[Notify] RESEND_API_KEY not configured. Skipping confirmation email.');
    return { success: false, reason: 'NOT_CONFIGURED' };
  }

  try {
    const subject = `Your Raas~Rang 2026 Pre-Ticket Reservation: ${ticketNo}`;

    const textContent = `
Dear ${name},

Jai Mata Di! Your Pre-Ticket for Raas~Rang Garba Nights 2026 has been successfully reserved.

RESERVATION DETAILS:
---------------------------------------------
Ticket Number:   ${ticketNo}
Pass Type:       ${passName} (${persons} Person${persons > 1 ? 's' : ''})
Attendee Name:   ${name}
Status:          PRE_BOOKED (Collect & Pay at Desk)

COLLECTION SPOT DETAILS:
---------------------------------------------
Collection Spot: ${spotName}
Address:         ${spotAddress}
Timings:         ${spotTimings}
Contact:         ${spotContact}

IMPORTANT INSTRUCTIONS:
1. Please bring a valid government ID proof (Aadhaar / Voter ID / Driving License) to collect your physical wristband passes.
2. Complete your payment at the spot to receive your official entry pass.
3. Event Date: 17 October 2026 at Mahant Digvijaynath Park, Gorakhpur.

Need assistance? Visit https://raasranggkp.pages.dev/ or reply to this email.

Warm regards,
Raas~Rang Organizing Committee, Gorakhpur
`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:20px;background-color:#0a0412;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#fdf6e3;">
  <div style="max-width:560px;margin:0 auto;background:#1a0a2e;border:1.5px solid #F0B429;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.6);">
    <div style="background:linear-gradient(135deg,#8B0A3A,#5a0914);padding:24px 20px;text-align:center;border-bottom:2px solid #F0B429;">
      <h1 style="margin:0;font-size:24px;color:#FFD54F;letter-spacing:2px;text-transform:uppercase;">RAAS~RANG GARBA NIGHTS 2026</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#FFF3C4;">Mahant Digvijaynath Park, Gorakhpur</p>
    </div>

    <div style="padding:24px 20px;">
      <p style="font-size:16px;color:#fdf6e3;margin-top:0;">Dear <strong>${name}</strong>,</p>
      <p style="font-size:14px;color:#d4c5b1;line-height:1.5;">Jai Mata Di! Your Pre-Ticket has been successfully reserved for Gorakhpur's grandest Navratri celebration.</p>

      <div style="background:rgba(240,180,41,0.08);border:1px dashed #F0B429;border-radius:8px;padding:16px;text-align:center;margin:20px 0;">
        <span style="font-size:11px;color:#FFD54F;text-transform:uppercase;letter-spacing:1px;display:block;">PRE-TICKET RESERVATION NUMBER</span>
        <div style="font-size:26px;font-weight:bold;color:#FFD54F;letter-spacing:3px;margin:6px 0;">${ticketNo}</div>
        <span style="display:inline-block;background:#8B0A3A;color:#FFF3C4;font-size:11px;padding:3px 12px;border-radius:20px;font-weight:600;">STATUS: PRE_BOOKED</span>
      </div>

      <table style="width:100%;font-size:14px;border-collapse:collapse;margin-bottom:20px;">
        <tr>
          <td style="padding:8px 0;color:#a09585;width:40%;">Pass Type:</td>
          <td style="padding:8px 0;color:#fdf6e3;font-weight:600;">${passName} (${persons} Entry)</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#a09585;">Collection Spot:</td>
          <td style="padding:8px 0;color:#fdf6e3;font-weight:600;">${spotName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#a09585;">Address:</td>
          <td style="padding:8px 0;color:#fdf6e3;">${spotAddress}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#a09585;">Spot Timings:</td>
          <td style="padding:8px 0;color:#fdf6e3;">${spotTimings}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#a09585;">Contact Desk:</td>
          <td style="padding:8px 0;color:#fdf6e3;">${spotContact}</td>
        </tr>
      </table>

      <div style="background:rgba(139,10,58,0.2);border-left:3px solid #FF2D78;padding:12px;border-radius:4px;font-size:12px;color:#d4c5b1;line-height:1.5;">
        <strong style="color:#FFD54F;">Important Reminder:</strong> Please present this reservation number with a valid photo ID at the collection desk to complete payment and claim your physical entry wristbands.
      </div>
    </div>

    <div style="background:#0a0412;padding:14px;text-align:center;font-size:11px;color:#a09585;border-top:1px solid rgba(240,180,41,0.2);">
      Raas~Rang 2026 • 17 October 2026 • Gorakhpur
    </div>
  </div>
</body>
</html>
`.trim();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        text: textContent,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[Notify Resend Error]:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (error) {
    console.error('[Notify] Failed to send email via Resend API:', error?.message || error);
    return { success: false, error: error?.message };
  }
}
