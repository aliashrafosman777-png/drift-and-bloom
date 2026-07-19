import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Email features will be disabled.')
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

/**
 * Get the verified "from" email address.
 * Falls back to Resend's free testing sender if FROM_EMAIL is not set
 * or if the domain is not verified in Resend.
 */
function getFromEmail(): string {
  return process.env.FROM_EMAIL || 'Drift & Bloom <onboarding@resend.dev>'
}

function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

/**
 * Send OTP verification code via Resend.
 * Branded for Drift & Bloom with olive/cream/sage palette.
 */
export async function sendOTPEmail(
  email: string,
  otpCode: string,
  isNewUser: boolean
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Always log OTP in development for easy testing
  if (process.env.NODE_ENV === 'development') {
    console.log('\n=========================================')
    console.log(`📧 OTP for ${email}: ${otpCode}`)
    console.log('=========================================\n')
  }

  if (!isResendConfigured()) {
    // In dev without a key, still allow the flow to proceed
    if (process.env.NODE_ENV === 'development') {
      return { success: true, messageId: 'dev-no-key' }
    }
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const greeting = isNewUser ? 'Welcome to Drift & Bloom! 🌿' : 'Welcome back! 🌱'
    const message = isNewUser
      ? 'To create your account, please verify your email with the code below.'
      : 'To sign in to your account, please use the verification code below.'

    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Drift & Bloom - Verification Code</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2c2c2c;
            background: #f5f0eb;
            padding: 20px;
          }
          
          .container { max-width: 500px; margin: 0 auto; }
          
          .email-card {
            background: #faf8f5;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(107, 114, 84, 0.15);
          }
          
          .header {
            background: linear-gradient(145deg, #6b7254 0%, #8a8e6e 100%);
            padding: 40px 30px;
            text-align: center;
            color: #faf8f5;
          }
          
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 6px;
            letter-spacing: 1px;
          }
          
          .header p {
            font-size: 14px;
            opacity: 0.9;
            font-style: italic;
          }
          
          .content { padding: 40px 30px; }
          
          .greeting {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .greeting h2 {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #3a3a3a;
          }
          
          .greeting p {
            font-size: 15px;
            color: #666;
            line-height: 1.5;
          }
          
          .code-section {
            background: #f0ede7;
            border-radius: 14px;
            padding: 30px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid rgba(107, 114, 84, 0.2);
          }
          
          .code-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7254;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 12px;
          }
          
          .code {
            font-size: 42px;
            font-weight: 700;
            color: #6b7254;
            letter-spacing: 10px;
            font-family: 'Inter', monospace;
            margin: 15px 0;
          }
          
          .code-hint {
            font-size: 13px;
            color: #888;
            margin-top: 8px;
          }
          
          .security-note {
            background: #fdf8f0;
            border: 1px solid rgba(181, 148, 96, 0.3);
            border-radius: 10px;
            padding: 18px;
            margin: 25px 0;
          }
          
          .security-note h4 {
            font-size: 13px;
            font-weight: 600;
            color: #a07c50;
            margin-bottom: 6px;
          }
          
          .security-note p {
            font-size: 13px;
            color: #7a6e5f;
            line-height: 1.4;
          }
          
          .footer {
            background: #3a3a3a;
            padding: 25px 30px;
            text-align: center;
            color: #bbb;
          }
          
          .footer p { font-size: 13px; margin-bottom: 6px; }
          .footer .brand { color: #a8b08c; font-weight: 600; }
          .footer .disclaimer { font-size: 11px; color: #777; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="header">
              <div class="logo">Drift & Bloom</div>
              <p>Rooted in care, wrapped in nature</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                <h2>${greeting}</h2>
                <p>${message}</p>
              </div>
              
              <div class="code-section">
                <div class="code-label">Your Verification Code</div>
                <div class="code">${otpCode}</div>
                <p class="code-hint">Enter this code to continue</p>
              </div>
              
              <div class="security-note">
                <h4>🔒 Security Information</h4>
                <p>This code will expire in <strong>10 minutes</strong>. Never share this code with anyone. If you didn't request this, please ignore this email.</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing <span class="brand">Drift & Bloom</span></p>
              <p>Where every package tells a story.</p>
              <div class="disclaimer">
                <p>This email was sent to ${email}. If you didn't request this code, please ignore it.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const client = getResendClient()
    if (!client) {
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `🌿 Drift & Bloom - Your Verification Code`,
      html: emailHTML,
    })

    if (error) {
      console.error('Resend API error:', error)
      return { success: false, error: (error as any).message || 'Email send failed' }
    }

    console.log('OTP email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Error sending OTP email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send a reply email to a contact message via Resend.
 * Branded for Drift & Bloom with olive/cream palette.
 */
export async function sendReplyEmail(
  recipientEmail: string,
  originalSubject: string,
  replyContent: string,
  customerName: string,
  adminName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isResendConfigured()) {
    console.warn('Resend not configured. Reply email skipped.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Drift & Bloom - Support Reply</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2c2c2c;
            background: #f5f0eb;
            padding: 20px;
          }
          
          .container { max-width: 500px; margin: 0 auto; }
          
          .email-card {
            background: #faf8f5;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(107, 114, 84, 0.15);
          }
          
          .header {
            background: linear-gradient(145deg, #6b7254 0%, #8a8e6e 100%);
            padding: 35px 30px;
            text-align: center;
            color: #faf8f5;
          }
          
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: 1px;
          }
          
          .header p { font-size: 13px; opacity: 0.9; }
          
          .content { padding: 35px 30px; }
          
          .greeting {
            margin-bottom: 25px;
          }
          
          .greeting h2 {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #3a3a3a;
          }
          
          .greeting p {
            font-size: 14px;
            color: #666;
          }
          
          .subject-badge {
            display: inline-block;
            background: #f0ede7;
            border: 1px solid rgba(107, 114, 84, 0.2);
            border-radius: 8px;
            padding: 6px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #6b7254;
            margin-bottom: 20px;
          }
          
          .reply-box {
            background: #f0ede7;
            border-radius: 14px;
            padding: 25px;
            margin: 20px 0;
            border: 1px solid rgba(107, 114, 84, 0.2);
          }
          
          .reply-label {
            font-size: 11px;
            font-weight: 600;
            color: #6b7254;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
          }
          
          .reply-content {
            font-size: 15px;
            color: #3a3a3a;
            line-height: 1.7;
            white-space: pre-wrap;
          }
          
          .from-note {
            font-size: 12px;
            color: #888;
            margin-top: 12px;
            font-style: italic;
          }
          
          .footer {
            background: #3a3a3a;
            padding: 22px 30px;
            text-align: center;
            color: #bbb;
          }
          
          .footer p { font-size: 12px; margin-bottom: 4px; }
          .footer .brand { color: #a8b08c; font-weight: 600; }
          .footer .disclaimer { font-size: 11px; color: #777; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="header">
              <div class="logo">Drift & Bloom</div>
              <p>Support Team</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                <h2>Hi ${customerName} 👋</h2>
                <p>Thank you for reaching out. Here's our response to your message:</p>
              </div>
              
              <div class="subject-badge">Re: ${originalSubject}</div>
              
              <div class="reply-box">
                <div class="reply-label">Our Reply</div>
                <div class="reply-content">${replyContent.replace(/\n/g, '<br>')}</div>
                <p class="from-note">— ${adminName}, Drift & Bloom Support</p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing <span class="brand">Drift & Bloom</span></p>
              <p>If you need further help, simply reply to this email.</p>
              <div class="disclaimer">
                <p>This email was sent to ${recipientEmail} in response to your contact request.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const client = getResendClient()
    if (!client) {
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await client.emails.send({
      from: getFromEmail(),
      to: recipientEmail,
      subject: `Re: ${originalSubject} — Drift & Bloom Support`,
      html: emailHTML,
    })

    if (error) {
      console.error('Resend reply error:', error)
      return { success: false, error: (error as any).message || 'Email send failed' }
    }

    console.log('Reply email sent successfully:', data?.id)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Error sending reply email:', error)
    return { success: false, error: error.message }
  }
}

// ─── Order Confirmation Email ───────────────────────────────────────────────

export interface OrderEmailItem {
  name: string
  price: number
  quantity: number
  plantOption?: string
  image?: string
}

export interface OrderEmailData {
  orderId: string
  fullName: string
  email: string
  items: OrderEmailItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: string
  shippingAddress?: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  notes?: string
  giftMessage?: string
  createdAt: Date | string
}

/** Escape HTML special characters to prevent XSS in email content. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Format a number as currency (EGP). */
function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
}

/**
 * Send order confirmation email via Resend.
 * Branded for Drift & Bloom — fully inline CSS for email client compatibility.
 */
export async function sendOrderConfirmationEmail(
  order: OrderEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!order.email) {
    console.warn('No email address on order, skipping confirmation email.')
    return { success: false, error: 'No email address' }
  }

  if (!isResendConfigured()) {
    console.warn('Resend not configured. Skipping order confirmation email.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://driftnblooms.com'
    const customerName = escapeHtml(order.fullName.split(' ')[0] || 'there')
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const shortOrderId = order.orderId.slice(-8).toUpperCase()

    // Build product rows
    const itemRows = order.items
      .map((item) => {
        const name = escapeHtml(item.name)
        const variant = item.plantOption ? `<p style="margin:0;font-size:12px;color:#888;margin-top:2px;">${escapeHtml(item.plantOption)}</p>` : ''
        const lineTotal = item.price * item.quantity
        const imgSrc = item.image || `${siteUrl}/assets/placeholder.png`

        return `
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #f0ede7;vertical-align:top;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="72" style="vertical-align:top;padding-right:14px;">
                    <img src="${imgSrc}" alt="${name}" width="72" height="72" style="border-radius:10px;object-fit:cover;display:block;border:1px solid #eee;" />
                  </td>
                  <td style="vertical-align:top;">
                    <p style="margin:0;font-weight:600;font-size:14px;color:#3a3a3a;">${name}</p>
                    ${variant}
                    <p style="margin:0;font-size:12px;color:#888;margin-top:4px;">Qty: ${item.quantity} × ${formatCurrency(item.price)}</p>
                  </td>
                  <td width="90" style="vertical-align:top;text-align:right;">
                    <p style="margin:0;font-weight:600;font-size:14px;color:#3a3a3a;">${formatCurrency(lineTotal)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      })
      .join('')

    // Build shipping address block
    const addr = order.shippingAddress
    let addressBlock = ''
    if (addr && (addr.street || addr.city)) {
      const parts = [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).map((s) => escapeHtml(s!))
      addressBlock = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;">
          <tr>
            <td style="background:#f8f6f2;border-radius:12px;padding:18px 20px;border:1px solid rgba(107,114,84,0.12);">
              <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#6b7254;text-transform:uppercase;letter-spacing:1.5px;">Shipping Address</p>
              <p style="margin:0;font-size:14px;color:#3a3a3a;line-height:1.5;">${parts.join('<br>')}</p>
            </td>
          </tr>
        </table>`
    }

    // Gift message block
    let giftBlock = ''
    if (order.giftMessage) {
      giftBlock = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:14px;">
          <tr>
            <td style="background:#fdf8f0;border-radius:12px;padding:16px 20px;border:1px solid rgba(181,148,96,0.2);">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#a07c50;text-transform:uppercase;letter-spacing:1.5px;">🎁 Gift Message</p>
              <p style="margin:0;font-size:14px;color:#5a4e40;font-style:italic;line-height:1.5;">"${escapeHtml(order.giftMessage)}"</p>
            </td>
          </tr>
        </table>`
    }

    const emailHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation — Drift &amp; Bloom</title>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.6;color:#2c2c2c;background:#f5f0eb;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f0eb;padding:20px 10px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#faf8f5;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);border:1px solid rgba(107,114,84,0.15);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(145deg,#6b7254 0%,#8a8e6e 100%);padding:36px 30px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#faf8f5;letter-spacing:1px;font-family:Georgia,'Times New Roman',serif;">Drift &amp; Bloom</h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(250,248,245,0.85);font-style:italic;">Rooted in care, wrapped in nature</p>
            </td>
          </tr>

          <!-- CONFIRMATION BADGE -->
          <tr>
            <td style="padding:32px 30px 0;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#e8f0dc;border-radius:50%;width:56px;height:56px;text-align:center;vertical-align:middle;font-size:28px;">
                    ✓
                  </td>
                </tr>
              </table>
              <h2 style="margin:18px 0 6px;font-size:24px;font-weight:700;color:#3a3a3a;font-family:Georgia,'Times New Roman',serif;">Order Confirmed!</h2>
              <p style="margin:0;font-size:15px;color:#666;">Hi ${customerName}, thank you for your order.</p>
            </td>
          </tr>

          <!-- ORDER META -->
          <tr>
            <td style="padding:24px 30px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0ede7;border-radius:12px;border:1px solid rgba(107,114,84,0.15);">
                <tr>
                  <td style="padding:14px 20px;border-right:1px solid rgba(107,114,84,0.12);text-align:center;width:50%;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#6b7254;text-transform:uppercase;letter-spacing:1.5px;">Order No.</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#3a3a3a;">#${shortOrderId}</p>
                  </td>
                  <td style="padding:14px 20px;text-align:center;width:50%;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#6b7254;text-transform:uppercase;letter-spacing:1.5px;">Order Date</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#3a3a3a;">${orderDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="padding:28px 30px 0;">
              <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#6b7254;text-transform:uppercase;letter-spacing:2px;">Your Items</p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- PRICING SUMMARY -->
          <tr>
            <td style="padding:24px 30px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8f6f2;border-radius:12px;padding:18px 20px;border:1px solid rgba(107,114,84,0.12);">
                <tr>
                  <td style="padding:4px 20px;font-size:14px;color:#666;">Subtotal</td>
                  <td style="padding:4px 20px;font-size:14px;color:#3a3a3a;text-align:right;">${formatCurrency(order.subtotal)}</td>
                </tr>
                ${order.discount > 0 ? `<tr>
                  <td style="padding:4px 20px;font-size:14px;color:#5a9a4a;">Discount</td>
                  <td style="padding:4px 20px;font-size:14px;color:#5a9a4a;text-align:right;">-${formatCurrency(order.discount)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:4px 20px;font-size:14px;color:#666;">Shipping</td>
                  <td style="padding:4px 20px;font-size:14px;color:#3a3a3a;text-align:right;">${order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</td>
                </tr>
                ${order.tax > 0 ? `<tr>
                  <td style="padding:4px 20px;font-size:14px;color:#666;">Tax</td>
                  <td style="padding:4px 20px;font-size:14px;color:#3a3a3a;text-align:right;">${formatCurrency(order.tax)}</td>
                </tr>` : ''}
                <tr>
                  <td colspan="2" style="padding:8px 20px 0;">
                    <hr style="border:none;border-top:1px solid rgba(107,114,84,0.15);margin:0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 20px 12px;font-size:16px;font-weight:700;color:#3a3a3a;">Total</td>
                  <td style="padding:10px 20px 12px;font-size:18px;font-weight:700;color:#6b7254;text-align:right;">${formatCurrency(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PAYMENT INFO -->
          <tr>
            <td style="padding:16px 30px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size:13px;color:#888;">Payment Method</td>
                  <td style="font-size:13px;color:#3a3a3a;text-align:right;font-weight:500;">${escapeHtml(order.paymentMethod)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING ADDRESS -->
          <tr>
            <td style="padding:0 30px;">
              ${addressBlock}
            </td>
          </tr>

          <!-- GIFT MESSAGE -->
          <tr>
            <td style="padding:0 30px;">
              ${giftBlock}
            </td>
          </tr>

          <!-- ACTION BUTTONS -->
          <tr>
            <td style="padding:28px 30px 0;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:0 4px;" width="50%">
                    <a href="${siteUrl}" style="display:block;background:#6b7254;color:#faf8f5;text-decoration:none;padding:13px 16px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;">Continue Shopping</a>
                  </td>
                  <td style="padding:0 4px;" width="50%">
                    <a href="${siteUrl}/support" style="display:block;background:#f0ede7;color:#6b7254;text-decoration:none;padding:13px 16px;border-radius:10px;font-size:13px;font-weight:600;text-align:center;border:1px solid rgba(107,114,84,0.2);">Contact Support</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:32px 30px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#3a3a3a;border-radius:0 0 20px 20px;padding:24px 30px;text-align:center;">
                <tr>
                  <td style="padding:24px 30px;">
                    <p style="margin:0 0 4px;font-size:14px;color:#bbb;">Thank you for choosing <span style="color:#a8b08c;font-weight:600;">Drift &amp; Bloom</span></p>
                    <p style="margin:0 0 14px;font-size:13px;color:#999;">Where every package tells a story.</p>
                    <p style="margin:0;font-size:11px;color:#777;">
                      <a href="${siteUrl}" style="color:#a8b08c;text-decoration:none;">driftnblooms.com</a> · <a href="mailto:support@driftnblooms.com" style="color:#a8b08c;text-decoration:none;">support@driftnblooms.com</a>
                    </p>
                    <p style="margin:12px 0 0;font-size:10px;color:#555;">© ${new Date().getFullYear()} Drift &amp; Bloom. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const client = getResendClient()
    if (!client) {
      return { success: false, error: 'Email service not configured' }
    }

    const { data, error } = await client.emails.send({
      from: getFromEmail(),
      to: order.email,
      subject: `🌿 Order Confirmed — #${shortOrderId} | Drift & Bloom`,
      html: emailHTML,
    })

    if (error) {
      console.error('Order confirmation email error:', error)
      return { success: false, error: (error as any).message || 'Email send failed' }
    }

    console.log('Order confirmation email sent:', data?.id, '→', order.email)
    return { success: true, messageId: data?.id }
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error.message }
  }
}
