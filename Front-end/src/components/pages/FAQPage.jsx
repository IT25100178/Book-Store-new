import { useState, useEffect } from 'react';
import { faqs as faqsApi } from '../../services/api';
import './Pages.css';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [openIndex, setOpenIndex] = useState(null);
  const [dbFaqs, setDbFaqs] = useState([]);

  useEffect(() => {
    faqsApi.getAll().then(({ ok, data }) => {
      if (ok && Array.isArray(data)) setDbFaqs(data);
    });
  }, []);

  const categories = ['ALL', 'CURATION', 'SHIPPING', 'ACQUISITIONS'];

  const staticFaqs = [
    {
      q: "How are rare and first edition books authenticated?",
      a: "Every rare and first edition book is authenticated by our in-house team of literary experts and appraisers. We carefully inspect bindings, paper chemistry, ink patterns, and typography. A signed, registered Certificate of Authenticity is provided with every vintage or rare purchase to guarantee its provenance and value.",
      cat: "CURATION"
    },
    {
      q: "What packaging do you use for shipping high-value books?",
      a: "We use premium, climate-resistant archival packaging. Books are wrapped in acid-free tissue paper, sealed in moisture-barrier custom archival boxes, and cushioned securely inside heavy-duty outer shipping boxes to ensure they arrive in pristine condition regardless of global transit distance or weather conditions.",
      cat: "SHIPPING"
    },
    {
      q: "Do you ship internationally and is it fully insured?",
      a: "Yes, we provide fully insured global shipping via DHL Express or FedEx Priority. Every package is insured for its full purchase value, and requires a signature upon delivery. International delivery typically takes 3-7 business days depending on customs clearance processes.",
      cat: "SHIPPING"
    },
    {
      q: "Can I request a rare book that is not in your current catalog?",
      a: "Absolutely. Our specialized Acquisitions Concierge Service specializes in tracking down out-of-print, signed, rare, and historical editions through our global network of collectors and auction houses. Please fill out our contact form or contact our concierge team directly to initiate a search.",
      cat: "ACQUISITIONS"
    },
    {
      q: "What is your return policy for rare items?",
      a: "Due to the delicate nature and high value of rare and antiquarian books, returns are handled on a case-by-case basis through our concierge team. Generally, returns are accepted within 14 days of delivery if the book remains in the exact condition in which it was received.",
      cat: "ACQUISITIONS"
    },
    {
      q: "What forms of payment do you accept for high-value collector items?",
      a: "We accept all major credit cards, PayPal, Apple Pay, and direct bank wire transfers (highly recommended for high-value items). All online transactions are processed through fully encrypted, bank-grade secure checkout gateways.",
      cat: "ACQUISITIONS"
    },
    {
      q: "How should I store my rare books at home?",
      a: "Rare books should be stored away from direct sunlight in a temperature-controlled room (ideally 65-72°F / 18-22°C) with stable relative humidity (35-50%). Store them upright and tightly enough to support each other without causing friction when sliding them out.",
      cat: "CURATION"
    },
    {
      q: "Do you buy rare books or entire libraries from private collectors?",
      a: "Yes, we are always interested in acquiring individual high-quality rare volumes or entire collections. If you have books of exceptional value or historical importance that you wish to sell, please contact our curation team with detailed photos and documentation.",
      cat: "CURATION"
    }
  ];

  const displayFaqs = dbFaqs.length > 0 
    ? dbFaqs.map(f => ({ q: f.question, a: f.answer, cat: f.category }))
    : staticFaqs;

  const filteredFaqs = activeCategory === 'ALL' 
    ? displayFaqs 
    : displayFaqs.filter(faq => faq.cat === activeCategory);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div className="premium-page-container">
      <div className="page-glow"></div>
      <div className="page-content animate-slide-up" style={{ maxWidth: '800px', width: '100%' }}>
        <h1 className="page-title gradient-text">Frequently Asked Questions</h1>
        <p className="page-subtitle">Everything you need to know about our high-end literary curation, shipping, and concierge services.</p>
        
        {/* Category Filter */}
        <div className="faq-categories">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`faq-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setOpenIndex(null); // Reset open accordion
              }}
            >
              {cat === 'ALL' ? 'Show All' : cat}
            </button>
          ))}
        </div>

        <div className="faq-content">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <div className="faq-header" onClick={() => toggleFAQ(index)}>
                  <h3 className="faq-question">{faq.q}</h3>
                  <span className="faq-toggle-icon">+</span>
                </div>
                <div 
                  className="faq-answer-wrapper" 
                  style={{ maxHeight: isOpen ? '200px' : '0' }}
                >
                  <p className="faq-answer">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
