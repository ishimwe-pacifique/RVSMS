import nodemailer from 'nodemailer'

// Use environment variables to configure SMTP. For Gmail use:
// SMTP_HOST=smtp.gmail.com
// SMTP_PORT=465
// SMTP_USER=<your-gmail-address>
// SMTP_PASS=<app-password>
// SMTP_FROM=Your Name <your-gmail-address>

const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const fromAddress = process.env.SMTP_FROM || 'no-reply@example.com'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  if (!smtpHost || !smtpPort) {
    throw new Error('SMTP configuration missing. Set SMTP_HOST and SMTP_PORT in environment.')
  }

  const opts: any = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for port 465 (SSL)
  }

  if (smtpUser && smtpPass) {
    opts.auth = { user: smtpUser, pass: smtpPass }
  }

  transporter = nodemailer.createTransport(opts)
  return transporter
}

export async function sendOtpEmail(email: string, otp: string, name = '') {
  const t = getTransporter()

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <div style="max-width:600px;margin:0 auto;padding:20px;border:1px solid #e6edf3;border-radius:8px;background:#ffffff;">
      <h1 style="margin:0 0 12px;font-size:20px;color:#064e3b">RVSMS — Login code</h1>
      <p style="margin:0 0 16px;color:#334155">Hi ${name || 'there'},</p>
      <p style="margin:0 0 8px;color:#475569">Use the code below to finish signing in. It is valid for 10 minutes.</p>
      <div style="margin:16px 0;padding:14px 18px;background:#ecfeff;border-radius:6px;display:inline-block;font-weight:700;font-size:22px;letter-spacing:4px;color:#0f766e">${otp}</div>
      <p style="margin:18px 0 0;color:#94a3b8;font-size:13px">If you didn't request this code, you can safely ignore this message.</p>
      <hr style="border:none;border-top:1px solid #eef2f7;margin:18px 0" />
      <p style="margin:0;font-size:12px;color:#94a3b8">Rwanda Veterinary Service Management System</p>
    </div>
  </div>
  `

  try {
    const info = await t.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Your RVSMS login code',
      html,
    })
    return info
  } catch (err) {
    console.error('sendOtpEmail error:', err)
    throw err
  }
}
