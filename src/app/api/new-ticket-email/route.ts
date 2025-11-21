import { NextRequest } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const IT_EMAILS = ["is@resourcery.com", "ezekiela@resourcery.com"]; // ← CHANGE THESE

export async function POST(req: NextRequest) {
  const { ticket } = await req.json();

  await resend.emails.send({
    from: 'Resourcery IS <no-reply@resend.dev>',
    to: IS_EMAILS,
    subject: `NEW TICKET – ${ticket.priority} – ${ticket.title}`,
    html: `
      <h2>New Ticket</h2>
      <p><strong>From:</strong> ${ticket.user_name || ticket.user_email}</p>
      <p><strong>Priority:</strong> ${ticket.priority}</p>
      <p><strong>Title:</strong> ${ticket.title}</p>
      <p><strong>Description:</strong><br>${ticket.description.replace(/\n/g, '<br>')}</p>
      <a href="https://your-app-url.vercel.app/it/dashboard">Open Dashboard</a>
    `,
  });

  return Response.json({ success: true });
}
