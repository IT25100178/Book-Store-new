import './Pages.css';

export default function TermsOfService() {
  return (
    <div className="premium-page-container">
      <div className="page-glow"></div>
      <div className="page-content animate-slide-up">
        <h1 className="page-title gradient-text">Terms of Service</h1>
        <p className="page-subtitle">The guidelines and rules for using Luxury Books.</p>
        
        <div className="legal-content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Luxury Books website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2>2. Intellectual Property</h2>
          <p>
            All content published and made available on our site is the property of Luxury Books and the site's creators. This includes, but is not limited to images, text, logos, documents, downloadable files and anything that contributes to the composition of our site.
          </p>

          <h2>3. Authenticity Guarantee</h2>
          <p>
            Luxury Books guarantees the authenticity of every rare and first edition book sold. If an item is proven to be inauthentic by a mutually agreed upon independent appraiser, a full refund will be provided indefinitely.
          </p>

          <h2>4. Pricing and Availability</h2>
          <p>
            Given the rarity of our collection, all items are subject to prior sale. Prices are subject to change without notice. In the event of a pricing error, we reserve the right to cancel any orders placed for the incorrectly priced item.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            Luxury Books and our directors, officers, agents, employees, subsidiaries, and affiliates will not be liable for any actions, claims, losses, damages, liabilities and expenses including legal fees from your use of the site.
          </p>
        </div>
      </div>
    </div>
  );
}
