import express from 'express';
import { sendContactEmail } from '../services/email.service';

const router = express.Router();

// POST /api/contact
// Receives a contact form submission and emails it to the site owner.
// No authentication required — this is a public form.
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // All four fields are required — return 400 if any are missing
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendContactEmail(name, email, subject, message);

    res.json({ success: true });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
