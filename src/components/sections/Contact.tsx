import React, { useState } from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Reveal } from '../ui/Reveal';
import { siteConfig } from '../../data/site';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialFormState: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    // Simulate form submission with original animation flow
    setTimeout(() => {
      setStatus('sent');

      setTimeout(() => {
        setStatus('idle');
        setFormData(initialFormState);
      }, 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="section-container">
        <SectionHeading eyebrow="Get In Touch" title="Contact Us" />

        <div className="contact-content">
          <Reveal direction="up" className="contact-info-card glass-card">
            <h3>Reach Out</h3>
            <div className="contact-details">
              <a href={`tel:${siteConfig.phones[0].tel}`} className="contact-item" id="contact-phone-1">
                <span className="contact-icon" aria-hidden="true">
                  📞
                </span>
                <span>{siteConfig.phones[0].display}</span>
              </a>

              <a href={`tel:${siteConfig.phones[1].tel}`} className="contact-item" id="contact-phone-2">
                <span className="contact-icon" aria-hidden="true">
                  📱
                </span>
                <span>{siteConfig.phones[1].display}</span>
              </a>

              <a href={`mailto:${siteConfig.email}`} className="contact-item" id="contact-email">
                <span className="contact-icon" aria-hidden="true">
                  ✉️
                </span>
                <span>{siteConfig.email}</span>
              </a>

              <a
                href={siteConfig.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item"
                id="contact-instagram"
              >
                <span className="contact-icon" aria-hidden="true">
                  📷
                </span>
                <span>{siteConfig.instagram.handle}</span>
              </a>
            </div>

            <div className="contact-venue-info">
              <p>
                <strong>Venue:</strong> {siteConfig.venueName}
              </p>
              <p>
                <strong>Date:</strong> {siteConfig.displayDate}
              </p>
              <p>
                <strong>Time:</strong> {siteConfig.time} Onwards
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay="0.2s" className="contact-form-card glass-card">
            <h3>Send a Message</h3>
            <form
              id="contact-form"
              className="contact-form"
              aria-label="Contact form"
              name="contact"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="contact" />
              <div hidden>
                <label>
                  Don't fill this out if you're human: <input name="bot-field" />
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-email-input">Email</label>
                  <input
                    type="email"
                    id="contact-email-input"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-phone">Phone</label>
                  <input
                    type="tel"
                    id="contact-phone"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">Select a topic</option>
                  <option value="tickets">Ticket Enquiry</option>
                  <option value="sponsorship">Sponsorship Partnership</option>
                  <option value="stall">Food / Stall Booking</option>
                  <option value="media">Media & Press</option>
                  <option value="general">General Enquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  placeholder="Tell us how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                id="contact-submit"
                disabled={status === 'sending'}
                style={
                  status === 'sent'
                    ? {
                        background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
                      }
                    : undefined
                }
              >
                {status === 'sending'
                  ? 'Sending...'
                  : status === 'sent'
                  ? 'Message Sent ✓'
                  : 'Send Message'}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
