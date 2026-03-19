import nodemailer from 'nodemailer';

// In development (no SMTP_USER set), we auto-create an Ethereal test account.
// Ethereal catches all emails — nothing is actually sent to real inboxes.
// After sending, we log a preview URL to the console so you can see the email.
//
// In production, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to a real provider.

let transporterPromise: Promise<nodemailer.Transporter>;

const getTransporter = (): Promise<nodemailer.Transporter> => {
  if (!transporterPromise) {
    if (process.env.SMTP_USER) {
      // Production: use real SMTP credentials from env
      transporterPromise = Promise.resolve(
        nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
      );
    } else {
      // Development: auto-create a free Ethereal test account
      transporterPromise = nodemailer.createTestAccount().then((account) => {
        console.log('📧 Ethereal test account created: ', account.user);
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
      });
    }
  }
  return transporterPromise;
};

// The hybrid email-verification flow (and its email-sending function) was
// retired in Phase 5. Contact email is the only active send path.

// sendContactEmail — forwards a contact form submission to the site owner.
// fromEmail is set as replyTo so the site owner can reply directly to the sender.
// CONTACT_EMAIL env var controls who receives it — falls back to SMTP_USER if not set.
export const sendContactEmail = async (
  fromName: string,
  fromEmail: string,
  subject: string,
  message: string
): Promise<void> => {
  const transporter = await getTransporter();

  await transporter.sendMail({
    from: `"Football Finder" <${process.env.SMTP_USER || 'noreply@footballfinder.com'}>`,
    to: process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'support@footballfinder.com',
    replyTo: fromEmail,
    subject: `[Football Finder Contact] ${subject}`,
    text: [
      `From: ${fromName} <${fromEmail}>`,
      ``,
      message,
    ].join('\n'),
  });
};
