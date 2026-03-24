import nodemailer from 'nodemailer';

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendAdminNotification(requesterEmail: string, requestId: string) {
  const notifyEmail = process.env.NOTIFY_ADMIN_EMAIL;
  if (!notifyEmail) {
    throw new Error('NOTIFY_ADMIN_EMAIL is missing.');
  }

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: notifyEmail,
    subject: `New credential request from ${requesterEmail}`,
    html: `
      <p>A new credential request was submitted.</p>
      <p><strong>Email:</strong> ${requesterEmail}</p>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><a href="${baseUrl}/admin">Open admin panel</a></p>
    `,
  });
}

export async function sendCredentialsEmail(to: string, username: string, password: string) {
  const transporter = getTransporter();
  const appUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: 'Your access credentials',
    html: `
      <p>Your access has been approved.</p>
      <p><strong>App URL:</strong> <a href="${appUrl}">${appUrl}</a></p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>For security, do not share these credentials.</p>
    `,
  });
}
