import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields
  if (!body.name || !body.email || !body.message || !body.service) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  // Get Resend API key from environment
  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey

  if (!resendApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Email service not configured'
    })
  }

  const resend = new Resend(resendApiKey)

  try {
    const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">طلب خدمة جديد</h1>
      </div>

      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">تفاصيل الطلب</h2>

          <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">الخدمة المطلوبة:</strong>
            <span style="margin-right: 10px;">${body.service}</span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">الاسم:</strong>
            <span style="margin-right: 10px;">${body.name}</span>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">البريد الإلكتروني:</strong>
            <span style="margin-right: 10px;">${body.email}</span>
          </div>

          ${body.phone ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">رقم الهاتف:</strong>
            <span style="margin-right: 10px;">${body.phone}</span>
          </div>
          ` : ''}

          <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">تفاصيل المشروع:</strong>
            <div style="margin-top: 10px; padding: 15px; background: #f8f9fa; border-radius: 5px; line-height: 1.6;">
              ${body.message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #666; margin: 0;">تم إرسال هذا الطلب من موقع sufyanfa.com</p>
            <p style="color: #666; margin: 5px 0 0 0;">التاريخ: ${new Date().toLocaleString('ar-SA')}</p>
          </div>
        </div>
      </div>
    </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'طلبات الخدمات <noreply@sufyanfa.com>',
      to: ['sfmu1998@gmail.com'],
      subject: `طلب خدمة جديد: ${body.service} - ${body.name}`,
      html: emailContent,
      replyTo: body.email
    })

    if (error) {
      console.error('Resend error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send email'
      })
    }

    return {
      success: true,
      messageId: data?.id
    }

  } catch (error) {
    console.error('Email sending error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send email'
    })
  }
})