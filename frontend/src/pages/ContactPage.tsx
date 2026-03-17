import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ContactPage — two-column layout with contact info on the left and a form on the right.
// On successful form submission, the form is replaced with a success message.
export const ContactPage: React.FC = () => {
  // Form state — plain useState following the project pattern (no react-hook-form)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, email: formEmail, subject, message }),
      });

      if (res.ok) {
        // Replace the form with a success message
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to send message. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get in Touch</h1>
          <p className="text-gray-600">
            Have questions about Football Finder? Need help finding matches? We're here to help!
          </p>
        </div>

        {/* Two-column layout — stacks on mobile, side by side on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Contact Information card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>

              <div className="space-y-4">
                {/* Email row */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-sm">
                    @
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email Us</p>
                    <p className="text-sm text-green-600">support@footballfinder.com</p>
                    <p className="text-xs text-gray-400 mt-0.5">We respond within 24 hours</p>
                  </div>
                </div>

                {/* Instagram row */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 font-bold text-sm">
                    IG
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Instagram</p>
                    <p className="text-sm text-pink-600">@footballfinder</p>
                    <p className="text-xs text-gray-400 mt-0.5">Daily match updates & fan stories</p>
                  </div>
                </div>

                {/* TikTok row */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-700 font-bold text-sm">
                    TT
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">TikTok</p>
                    <p className="text-sm text-gray-700">@footballfinder</p>
                    <p className="text-xs text-gray-400 mt-0.5">Behind the scenes & travel tips</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Help card */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Help</h2>

              <div className="space-y-4">
                {/* FAQ item 1 */}
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Can't find matches in your city?
                  </p>
                  <p className="text-sm text-gray-600">
                    We cover all major European cities. Try searching with the English city name
                    (e.g. "Munich" not "München").
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-green-200" />

                {/* FAQ item 2 */}
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Ticket issues?
                  </p>
                  <p className="text-sm text-gray-600">
                    We link to official ticket sellers. For refunds or booking issues, contact
                    the ticket seller directly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — contact form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Send us a Message</h2>

            {submitted ? (
              // Success message replaces the form after a successful submission
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl mb-4">
                  ✓
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">Message sent!</p>
                <p className="text-sm text-gray-500">
                  We'll be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name + Email side by side on sm+ screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Subject — full width */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="What is this about?"
                  />
                </div>

                {/* Message textarea — full width */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                {/* Inline error */}
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 text-white py-3 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px]"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
