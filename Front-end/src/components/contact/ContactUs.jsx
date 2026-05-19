import React, { useState } from 'react';
import { messages } from '../../services/api';
import './ContactUs.css';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await messages.create(formData.name, formData.email, formData.subject, formData.body);
    setLoading(false);
    if (res.ok) {
      setToast({ type: 'success', msg: 'Your message has been sent successfully! Our concierge team will reach out to you within 2 hours.' });
      setFormData({ name: '', email: '', subject: '', body: '' });
    } else {
      setToast({ type: 'error', msg: 'Failed to send message. Please verify your details or try again later.' });
    }
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="contact-page-container animate-slide-up" style={{ padding: '120px 20px 80px' }}>
      <div className="contact-hero">
        <h1 className="contact-title gradient-text" style={{ fontSize: '3.5rem', fontWeight: '300', letterSpacing: '2px' }}>Get in Touch</h1>
        <p className="contact-subtitle" style={{ fontSize: '1.15rem', color: 'rgba(240,230,211,0.65)', maxWidth: '600px', margin: '0 auto 4rem' }}>
          Have a question about a rare antiquarian volume, require private sourcing, or need bespoke order assistance? Our literary concierges are ready to assist you.
        </p>
      </div>

      <div className="contact-content-grid">
        {/* Contact Info */}
        <div className="contact-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="info-card" style={{
            background: 'linear-gradient(145deg, rgba(25, 25, 38, 0.8) 0%, rgba(15, 15, 24, 0.9) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '20px',
            padding: '2.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#D4AF37', fontSize: '1.25rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 Visit Our Library</h3>
            <p style={{ color: 'rgba(240,230,211,0.7)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              132/1 Thalaiyadi Lane,<br/>
              Jaffna, Sri Lanka
            </p>
          </div>

          <div className="info-card" style={{
            background: 'linear-gradient(145deg, rgba(25, 25, 38, 0.8) 0%, rgba(15, 15, 24, 0.9) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '20px',
            padding: '2.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#D4AF37', fontSize: '1.25rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📞 Direct Concierge</h3>
            <p style={{ color: 'rgba(240,230,211,0.7)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              <strong>Email:</strong> hello@luxurybooks.com<br/>
              <strong>Support:</strong> (+94) 742-624-977<br/>
              <strong>Response Time:</strong> Under 2 hours guaranteed.
            </p>
          </div>

          <div className="info-card" style={{
            background: 'linear-gradient(145deg, rgba(25, 25, 38, 0.8) 0%, rgba(15, 15, 24, 0.9) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            borderRadius: '20px',
            padding: '2.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ color: '#D4AF37', fontSize: '1.25rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>🕰️ Operating Hours</h3>
            <p style={{ color: 'rgba(240,230,211,0.7)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              <strong>Monday - Friday:</strong> 9:00 AM - 8:00 PM IST<br/>
              <strong>Saturday - Sunday:</strong> 10:00 AM - 6:00 PM IST
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-panel" style={{
          background: 'linear-gradient(145deg, rgba(20, 20, 31, 0.85) 0%, rgba(10, 10, 15, 0.95) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: '20px',
          padding: '3.5rem 3rem',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '500' }}>Send us a message</h2>
          <p style={{ color: 'rgba(240,230,211,0.5)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>Fill out the form below to register a request, we respond promptly.</p>
          
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group-row">
              <input type="text" placeholder="Your Name" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input type="email" placeholder="Your Email" required
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <input type="text" placeholder="Subject" required className="full-width"
              value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            <textarea placeholder="How can our concierge team assist you today?" required rows="6" className="full-width"
              value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} />
            
            <button type="submit" disabled={loading} className="submit-btn" style={{
              background: 'linear-gradient(135deg, #8B0000 0%, #B22222 100%)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#fff',
              padding: '1.2rem',
              borderRadius: '30px',
              fontSize: '1.05rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem'
            }}>
              {loading ? 'Sending Request...' : 'Send Message'}
            </button>
          </form>

          {toast && (
            <div className={`toast-message ${toast.type}`}>
              {toast.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
