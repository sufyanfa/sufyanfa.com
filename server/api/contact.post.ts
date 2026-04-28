import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || !body.email || !body.message || !body.service) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }

  const config = useRuntimeConfig()
  const resendApiKey = config.resendApiKey

  if (!resendApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Email service not configured'
    })
  }

  const resend = new Resend(resendApiKey)

  const escape = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const messageHtml = escape(body.message).replace(/\n/g, '<br>')

  const emailContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
  <body style="margin:0;padding:24px;background:#F4F1EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,sans-serif;color:#1A1A1A;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 16px rgba(59,90,59,0.08);">
      <div style="background:#F4F1EA;padding:24px 28px;border-bottom:1px solid #E5DFD0;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#3B5A3B;margin-bottom:6px;">طلب جديد</div>
        <div style="font-size:20px;font-weight:700;color:#1A1A1A;">${escape(body.service)}</div>
      </div>

      <div style="padding:28px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:10px 0;color:#857F75;width:120px;font-size:12px;">الاسم</td>
            <td style="padding:10px 0;color:#1A1A1A;font-weight:600;">${escape(body.name)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#857F75;font-size:12px;">البريد</td>
            <td style="padding:10px 0;"><a href="mailto:${escape(body.email)}" style="color:#3B5A3B;text-decoration:none;font-weight:600;" dir="ltr">${escape(body.email)}</a></td>
          </tr>
          ${body.phone ? `
          <tr>
            <td style="padding:10px 0;color:#857F75;font-size:12px;">الهاتف</td>
            <td style="padding:10px 0;color:#1A1A1A;font-weight:600;" dir="ltr">${escape(body.phone)}</td>
          </tr>
          ` : ''}
        </table>

        <div style="margin-top:20px;padding:18px 20px;background:#F4F1EA;border-radius:12px;">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#857F75;margin-bottom:10px;">تفاصيل المشروع</div>
          <div style="font-size:14px;line-height:1.7;color:#1A1A1A;">${messageHtml}</div>
        </div>
      </div>

      <div style="padding:18px 28px;background:#1A1A1A;color:#ffffff;font-size:11px;text-align:center;">
        sufyanfa.com · ${new Date().toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  </body>
</html>`

  try {
    const { data, error } = await resend.emails.send({
      from: 'sufyanfa.com <noreply@sufyanfa.com>',
      to: ['sfmu1998@gmail.com'],
      subject: `طلب جديد: ${body.service} — ${body.name}`,
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
