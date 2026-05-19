// src/components/checkout/OrderConfirmation.jsx
// Member 5 – Vishnu
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orders as ordersApi } from '../../services/api';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.getById(orderId).then(res => {
      if (res.ok) setOrder(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  const handleDownloadPDF = () => {
    window.print();
  };

  const statusSteps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = order ? statusSteps.indexOf(order.status || 'PENDING') : 0;

  if (loading) return <div className="confirmation-page"><div className="loading-spinner"></div><p>Generating Receipt...</p></div>;

  return (
    <div className="confirmation-page">
      <div className="confirmation-card print-section">
        <div className="no-print">
          <div className="checkmark-circle">✓</div>
          <h1>Order Confirmed!</h1>
          <p className="confirm-subtitle">
            Thank you for your purchase. Your luxury literature is being prepared.
          </p>
        </div>

        {/* ── Receipt Header for Print ── */}
        <div className="print-only receipt-header">
           <h2 style={{ fontSize: '2rem', color: '#000', margin: '0 0 0.5rem 0' }}>LUXURY BOOKS</h2>
           <p style={{ color: '#555', margin: 0 }}>Official Order Receipt</p>
           <hr style={{ borderTop: '1px solid #ccc', margin: '1.5rem 0' }} />
        </div>

        <div className="order-id-box">
          <span className="order-label">Order ID</span>
          <span className="order-id">{orderId}</span>
        </div>

        {/* ── Order Tracking Timeline ── */}
        <div className="tracking-timeline no-print">
           <h3 style={{ textAlign: 'center', color: '#D4AF37', marginBottom: '1.5rem' }}>Live Tracking Status</h3>
           <div className="timeline-bar-wrapper">
              <div className="timeline-line"></div>
              <div className="timeline-steps">
                {statusSteps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  return (
                    <div key={step} className={`timeline-step ${isActive ? 'active' : ''}`}>
                      <div className="step-dot">{isActive ? '✓' : ''}</div>
                      <span className="step-label">{step}</span>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* ── Receipt Details ── */}
        <div className="receipt-details">
           <h3 className="no-print">Order Summary</h3>
           <div className="receipt-totals">
              <div className="r-row"><span>Status:</span> <strong>{order?.status || 'PENDING'}</strong></div>
              <div className="r-row"><span>Payment Method:</span> <strong>{order?.paymentMethod || 'COD'}</strong></div>
              <div className="r-row"><span>Delivery Type:</span> <strong>{order?.deliveryType || 'STANDARD'}</strong></div>
              <div className="r-row"><span>Shipping Address:</span> <span style={{textAlign:'right', maxWidth:'220px'}}>{order?.address}</span></div>
              <div className="r-row total"><span>Total Paid:</span> <strong style={{ color: '#D4AF37' }}>${Number(order?.totalPrice || 0).toFixed(2)}</strong></div>
           </div>
        </div>

        <div className="confirmation-actions no-print">
          <button onClick={handleDownloadPDF} className="track-btn" style={{ background: 'linear-gradient(135deg, #D4AF37, #AA8C2C)', color: '#000', width: '100%' }}>
            📥 Download PDF Receipt
          </button>
          <Link to="/profile" className="track-btn">View Order History</Link>
          <Link to="/books"   className="shop-more-btn">Continue Shopping</Link>
        </div>

        {/* ── Print Footer ── */}
        <div className="print-only receipt-footer" style={{ marginTop: '3rem', textAlign: 'center', color: '#555', fontSize: '0.9rem' }}>
           <hr style={{ borderTop: '1px solid #ccc', margin: '0 0 1.5rem 0' }} />
           <p>Thank you for shopping with Luxury Books.</p>
           <p>contact@luxurybooks.com | +1 (800) 555-RARE</p>
        </div>
      </div>
    </div>
  );
}
