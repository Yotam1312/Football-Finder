import nodemailer from 'nodemailer';

// Create the nodemailer transport using SMTP env vars.
// In development, set SMTP_HOST=smtp.ethereal.email and use a free Ethereal
// account (https://ethereal.email) to preview emails without actually sending them.
// In production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to a real provider.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// sendVerificationEmail — sends the verification link email to the user.
// The link points to the frontend /verify/:token page which calls the backend
// to confirm ownership of the email address and create the post.
export const sendVerificationEmail = async (
  toEmail: string,
  token: string,
  teamName: string
): Promise<void> => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;

  await transporter.sendMail({
    from: `"Football Finder" <${process.env.SMTP_USER || 'noreply@football-finder.com'}>`,
    to: toEmail,
    subject: `Confirm your post on ${teamName} FanBase`,
    text: [
      `Hi there!`,
      ``,
      `Someone (hopefully you) submitted a post to the ${teamName} FanBase on Football Finder.`,
      ``,
      `Click the link below to confirm your email and publish your post:`,
      `${verifyUrl}`,
      ``,
      `This link expires in 24 hours.`,
      ``,
      `If you did not submit this post, you can ignore this email.`,
    ].join('\n'),
  });
};
