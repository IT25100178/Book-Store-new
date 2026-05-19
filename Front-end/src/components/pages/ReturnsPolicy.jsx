import './Pages.css';

export default function ReturnsPolicy() {
  return (
    <div className="premium-page-container">
      <div className="page-glow"></div>
      <div className="page-content animate-slide-up">
        <h1 className="page-title gradient-text">Returns & Exchanges</h1>
        <p className="page-subtitle">Our commitment to your complete satisfaction.</p>
        
        <div className="legal-content">
          <h2>1. Return Window</h2>
          <p>
            Due to the rare and delicate nature of our inventory, returns must be initiated within 14 days of the delivery date. Items must be returned in the exact condition they were received, including all original certificates of authenticity and protective packaging.
          </p>

          <h2>2. Condition of Returned Items</h2>
          <p>
            All returns are subject to a rigorous inspection by our authentication team. Any signs of wear, reading, or improper handling will void the return policy. Shrink-wrapped items must remain unopened.
          </p>

          <h2>3. The Return Process</h2>
          <ul>
            <li>Contact our concierge service to initiate a return request.</li>
            <li>Once approved, you will receive a fully insured, prepaid return shipping label.</li>
            <li>Pack the item using the original luxury packaging materials.</li>
            <li>Drop off the package at any authorized DHL Express location.</li>
          </ul>

          <h2>4. Refunds</h2>
          <p>
            Upon successful inspection of the returned item, a full refund (minus original shipping costs) will be issued to your original method of payment within 5-7 business days. 
          </p>

          <h2>5. Damaged in Transit</h2>
          <p>
            If your order arrives damaged, please retain all packaging and contact us immediately (within 48 hours of delivery) so we can file an insurance claim and arrange an immediate replacement or refund.
          </p>
        </div>
      </div>
    </div>
  );
}
