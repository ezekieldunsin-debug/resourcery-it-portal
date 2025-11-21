import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { ticket } = await req.json()

  await resend.emails.send({
    from: 'IS Portal <no-reply@resend.dev>',
    to: ['is@resourcery.com.ng'],
    subject: `NEW TICKET - ${ticket.priority} - ${ticket.title}`,
    html: `<h2>New Ticket</h2><p><strong>From:</strong> ${ticket.user_name || ticket.user_email}</p><p><strong>Title:</strong> ${ticket.title}</p><p>${ticket.description}</p>`
  })

  return Response.json({ success: true })
}
