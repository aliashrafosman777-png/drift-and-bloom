// Test Resend email delivery
import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'Drift & Bloom <noreply@driftnblooms.com>'
const TEST_TO = 'aliashrafosman777@gmail.com'

const resend = new Resend(RESEND_API_KEY)

async function testEmail() {
  console.log('Testing Resend email delivery...')
  console.log('API Key:', RESEND_API_KEY.slice(0, 10) + '...')
  console.log('From:', FROM_EMAIL)
  console.log('To:', TEST_TO)
  console.log()

  // Test 1: Try with custom domain
  console.log('── Test 1: Send from noreply@driftnblooms.com ──')
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TEST_TO,
      subject: 'Test Email - Custom Domain',
      html: '<p>This is a test from noreply@driftnblooms.com</p>',
    })
    if (error) {
      console.error('FAILED:', JSON.stringify(error, null, 2))
    } else {
      console.log('SUCCESS:', data)
    }
  } catch (err) {
    console.error('EXCEPTION:', err.message)
  }

  console.log()

  // Test 2: Try with Resend's default sender
  console.log('── Test 2: Send from onboarding@resend.dev ──')
  try {
    const { data, error } = await resend.emails.send({
      from: 'Drift & Bloom <onboarding@resend.dev>',
      to: TEST_TO,
      subject: 'Test Email - Resend Default Sender',
      html: '<p>This is a test from onboarding@resend.dev</p>',
    })
    if (error) {
      console.error('FAILED:', JSON.stringify(error, null, 2))
    } else {
      console.log('SUCCESS:', data)
    }
  } catch (err) {
    console.error('EXCEPTION:', err.message)
  }

  process.exit(0)
}

testEmail()
