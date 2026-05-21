// src/components/checkout/CheckoutPage.jsx
// Member 5 – Vishnu
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { orders as ordersApi, users as usersApi, cards as cardsApi } from '../../services/api';
import './CheckoutPage.css';

const validateCardNumber = (number) => {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const validateExpiryDate = (expiry) => {
  if (!expiry.includes('/')) return false;
  const parts = expiry.split('/');
  if (parts.length !== 2) return false;
  const monthStr = parts[0].trim();
  const yearStr = parts[1].trim();
  
  if (!/^\d{2}$/.test(monthStr)) return false;
  const month = parseInt(monthStr, 10);
  if (month < 1 || month > 12) return false;
  
  if (!/^\d{2}$|^\d{4}$/.test(yearStr)) return false;
  return true;
};

const DELIVERY_OPTIONS = [
  { id: 'STANDARD', label: 'Standard Delivery',  time: '5–7 business days',  price: 4.99 },
  { id: 'EXPRESS',  label: 'Express Delivery',    time: '1–2 business days',  price: 9.99 },
  { id: 'FREE',     label: 'Free Delivery',       time: '7–10 business days', price: 0,    minOrder: 50 },
];

const PAYMENT_METHODS = [
  { id: 'COD',    label: 'Cash on Delivery',   icon: '💵', desc: 'Pay when your books arrive' },
  { id: 'ONLINE', label: 'Online Payment',      icon: '💳', desc: 'Credit / Debit card or bank transfer' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // ── Form state ────────────────────────────────────────────────────────────
  const [address,        setAddress]       = useState({
    fullName: user?.name || '',
    phone:    user?.phone || '',
    line1:    '',
    city:     '',
    state:    '',
    zip:      '',
    country:  'Sri Lanka',
  });
  const [deliveryOption,  setDeliveryOption]  = useState('STANDARD');
  const [paymentMethod,   setPaymentMethod]   = useState('COD');
  const [discountCode,    setDiscountCode]    = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMsg,     setDiscountMsg]     = useState('');
  const [loading,         setLoading]         = useState(false);
  const [errors,          setErrors]          = useState({});
  const [saveAddress,     setSaveAddress]     = useState(false);

  // Saved cards state
  const [savedCards,      setSavedCards]      = useState([]);
  const [selectedCardId,  setSelectedCardId]  = useState(null);
  const [showCardModal,   setShowCardModal]   = useState(false);
  const [editingCard,     setEditingCard]     = useState(null);
  const [cardFormData,    setCardFormData]    = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    cardNickname: '',
    isDefault: false,
  });

  // Credit Card state
  const [cardNumber,      setCardNumber]      = useState('');
  const [expiryDate,      setExpiryDate]      = useState('');
  const [cvv,             setCvv]             = useState('');
  const [cardHolderName,  setCardHolderName]  = useState('');
  const [cardNickname,    setCardNickname]    = useState('');
  const [saveCardCheckbox, setSaveCardCheckbox] = useState(false);

  const handleUseSavedAddress = () => {
    if (!user?.address) {
      setErrors({ general: 'No saved address found in your profile.' });
      return;
    }
    try {
      const parts = user.address.split(' - Phone: ');
      const phoneStr = parts[1] || user.phone || '';
      const addrParts = parts[0].split(', ');
      
      if (addrParts.length > 1) {
        setAddress({
          fullName: addrParts[0] || user.name || '',
          line1: addrParts[1] || '',
          city: addrParts[2] || '',
          state: addrParts[3] ? addrParts[3].split(' ')[0] : '',
          zip: addrParts[3] ? addrParts[3].split(' ')[1] : '',
          country: addrParts[4] || 'Sri Lanka',
          phone: phoneStr
        });
      } else {
        setAddress({
          fullName: user.name || '',
          line1: parts[0] || '',
          city: '',
          state: '',
          zip: '',
          country: 'Sri Lanka',
          phone: phoneStr
        });
      }
      setErrors({});
    } catch(e) {
      setErrors({ general: 'Could not parse saved address.' });
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadSavedCards();
    }
  }, [user?.id]);

  const loadSavedCards = async () => {
    try {
      const { ok, data } = await cardsApi.get(user.id);
      if (ok && Array.isArray(data)) {
        setSavedCards(data);
        if (!selectedCardId && data.length > 0) {
          setSelectedCardId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load saved cards', error);
    }
  };

  const openAddCardModal = () => {
    setEditingCard(null);
    setCardFormData({ cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '', cardNickname: '', isDefault: false });
    setShowCardModal(true);
  };

  const openEditCardModal = (card) => {
    setEditingCard(card);
    setCardFormData({
      cardNumber: '',
      cardHolderName: card.cardHolderName || '',
      expiryDate: card.expiry || '',
      cvv: '',
      cardNickname: card.cardNickname || '',
      isDefault: card.isDefault || false,
    });
    setShowCardModal(true);
  };

  const handleSaveCard = async () => {
    setErrors(prev => ({ ...prev, cardForm: '' }));
    const { cardNumber: num, expiryDate: exp, cvv: cvvValue, cardNickname: nick, cardHolderName: holder, isDefault } = cardFormData;

    if (!holder?.trim()) {
      setErrors(prev => ({ ...prev, cardForm: 'Card holder name is required.' }));
      return;
    }

    if (!exp?.trim() || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp.trim())) {
      setErrors(prev => ({ ...prev, cardForm: 'Expiry date is required and must be MM/YY.' }));
      return;
    }

    if (!editingCard) {
      if (!num?.trim()) {
        setErrors(prev => ({ ...prev, cardForm: 'Card number is required.' }));
        return;
      }
      const cleanNum = num.replace(/\D/g, '');
      if (!/^\d{16}$/.test(cleanNum)) {
        setErrors(prev => ({ ...prev, cardForm: 'Card number must be exactly 16 digits.' }));
        return;
      }
      if (!cvvValue || !/^\d{3}$/.test(cvvValue)) {
        setErrors(prev => ({ ...prev, cardForm: 'CVV must be exactly 3 digits.' }));
        return;
      }
    }

    try {
      setLoading(true);
      let result;
      if (editingCard) {
        const payload = { userId: user.id, cardHolderName: holder.trim(), expiryDate: exp.trim(), cardNickname: nick, isDefault };
        if (num?.trim()) {
          const cleanNum = num.replace(/\D/g, '');
          payload.cardNumber = cleanNum;
          payload.cvv = cvvValue;
        }
        result = await cardsApi.update(editingCard.id, payload);
      } else {
        result = await cardsApi.save(user.id, num.replace(/\D/g, ''), exp.trim(), holder.trim(), nick, isDefault, cvvValue);
      }

      if (result.ok) {
        await loadSavedCards();
        setShowCardModal(false);
        setCardFormData({ cardNumber: '', cardHolderName: '', expiryDate: '', cvv: '', cardNickname: '', isDefault: false });
      } else {
        setErrors(prev => ({ ...prev, cardForm: result.data?.message || 'Failed to save card.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, cardForm: 'Unable to save card. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this saved card?')) return;
    try {
      setLoading(true);
      const result = await cardsApi.delete(cardId, { userId: user.id });
      if (result.ok) {
        await loadSavedCards();
        if (selectedCardId === cardId) {
          setSelectedCardId(null);
        }
      } else {
        setErrors(prev => ({ ...prev, general: result.data?.message || 'Unable to delete card.' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Unable to delete card. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedCard = () => {
    setSelectedCardId(null);
    setCardHolderName('');
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setSaveCardCheckbox(false);
    setCardNickname('');
    setErrors(prev => ({ ...prev, cardNumber: '', expiryDate: '', cvv: '' }));
  };

  // ── Calculations ──────────────────────────────────────────────────────────

  const discount     = (cartTotal * discountPercent) / 100;
  const afterDisc    = cartTotal - discount;
  const tax          = afterDisc * 0.08;
  const chosenDel    = DELIVERY_OPTIONS.find(d => d.id === deliveryOption);
  const deliveryFee  = deliveryOption === 'FREE' ? (afterDisc >= 50 ? 0 : 4.99) : (chosenDel?.price || 0);
  const grandTotal   = afterDisc + tax + deliveryFee;

  // ── Validate ──────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!address.fullName.trim()) e.fullName = 'Full name is required';
    if (!address.phone.trim())    e.phone    = 'Phone is required';
    if (!address.line1.trim())    e.line1    = 'Address is required';
    if (!address.city.trim())     e.city     = 'City is required';

    if (paymentMethod === 'ONLINE') {
      if (!selectedCardId) {
        const cleanCard = cardNumber.replace(/\s+/g, '');
        if (!cardHolderName.trim()) {
          e.cardHolderName = 'Card holder name is required';
        }
        if (!cleanCard) {
          e.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(cleanCard)) {
          e.cardNumber = 'Card number must be 16 digits';
        } else {
          // Luhn Check
          let sum = 0;
          let shouldDouble = false;
          for (let i = cleanCard.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanCard.charAt(i), 10);
            if (shouldDouble) {
              if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
          }
          if (sum % 10 !== 0) {
            e.cardNumber = 'Invalid card number (fails Luhn check)';
          }
        }

        if (!expiryDate) {
          e.expiryDate = 'Expiry date is required';
        } else if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expiryDate)) {
          e.expiryDate = 'Expiry must contain "/" and match MM/YY or MM/YYYY';
        }

        if (!cvv) {
          e.cvv = 'CVV is required';
        } else if (!/^\d{3}$/.test(cvv)) {
          e.cvv = 'CVV must be strictly a 3-digit integer';
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build items string ────────────────────────────────────────────────────

  const buildItemsString = () =>
    cartItems.map(i => `${i.bookId}:${i.quantity}`).join(',');

  const buildAddressString = () =>
    `${address.fullName}, ${address.line1}, ${address.city}, ${address.state} ${address.zip}, ${address.country} - Phone: ${address.phone}`;

  // ── Place Order ───────────────────────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        userId:         user.id,
        items:          buildItemsString(),
        subtotal:       cartTotal,
        discountCode,
        discountAmount: discount,
        paymentMethod,
        address:        buildAddressString(),
        deliveryType:   deliveryOption,
      };

      // Handle payment method
      if (paymentMethod === 'ONLINE') {
        if (selectedCardId) {
          payload.selectedCardId = selectedCardId;
        } else {
          payload.cardNumber = cardNumber;
          payload.expiryDate = expiryDate;
          payload.cvv = cvv;
          payload.cardHolderName = cardHolderName;
          if (saveCardCheckbox) {
            payload.saveCard = true;
            payload.cardNickname = cardNickname;
          }
        }
      }

      const { ok, data } = await ordersApi.place(payload);

      if (ok && data.success) {
        if (saveAddress) {
          await usersApi.update(user.id, { address: buildAddressString(), phone: address.phone });
        }
        await clearCart();
        navigate(`/order-confirmation/${data.orderId}`);
      } else {
        setErrors({ general: data.message || 'Order failed. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Cannot connect to server.' });
    }
    setLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <span>🛒</span>
          <h2>No items to checkout</h2>
          <button onClick={() => navigate('/books')} className="back-to-books-btn">
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">

        {/* ── Left Column ─────────────────────────────────────────────────── */}
        <div className="checkout-left">

          {/* Shipping Address */}
          <section className="checkout-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>📍 Shipping Address</h2>
              <button onClick={handleUseSavedAddress} className="use-saved-btn" type="button">
                Use Saved Address
              </button>
            </div>
            <div className="form-grid">
              {[
                { key: 'fullName', label: 'Full Name',   type: 'text',  placeholder: 'Athethan Vishok' },
                { key: 'phone',    label: 'Phone Number',type: 'tel',   placeholder: '+94 77 123 4567' },
                { key: 'line1',    label: 'Address',     type: 'text',  placeholder: '132/1 Thalaiyadi Lane', full: true },
                { key: 'city',     label: 'City',        type: 'text',  placeholder: 'Jaffna' },
                { key: 'state',    label: 'Province',    type: 'text',  placeholder: 'Northern Province' },
                { key: 'zip',      label: 'ZIP Code',    type: 'text',  placeholder: '40000' },
              ].map(({ key, label, type, placeholder, full }) => (
                <div key={key} className={`form-field ${full ? 'full-width' : ''}`}>
                  <label htmlFor={key}>{label}</label>
                  <input
                    id={key}
                    type={type}
                    placeholder={placeholder}
                    value={address[key]}
                    onChange={(e) => setAddress(prev => ({ ...prev, [key]: e.target.value }))}
                    className={errors[key] ? 'field-error' : ''}
                  />
                  {errors[key] && <span className="error-msg">{errors[key]}</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label className="save-address-label">
                <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} />
                Save this address to my profile for next time
              </label>
            </div>
          </section>

          {/* Delivery Options */}
          <section className="checkout-section">
            <h2>🚚 Delivery Options</h2>
            <div className="delivery-options">
              {DELIVERY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`delivery-option ${deliveryOption === opt.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value={opt.id}
                    checked={deliveryOption === opt.id}
                    onChange={() => setDeliveryOption(opt.id)}
                  />
                  <div className="delivery-info">
                    <strong>{opt.label}</strong>
                    <span>{opt.time}</span>
                    {opt.minOrder && <span className="min-order">Min. order ${opt.minOrder}</span>}
                  </div>
                  <div className="delivery-price">
                    {opt.price === 0 ? <span className="free-tag">FREE</span> : `$${opt.price.toFixed(2)}`}
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Payment Method */}
          <section className="checkout-section">
            <h2>💳 Payment Method</h2>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  className={`payment-option ${paymentMethod === pm.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={() => {
                      setPaymentMethod(pm.id);
                      setErrors(prev => ({ ...prev, cardNumber: '', expiryDate: '', cvv: '', payment: '' }));
                    }}
                  />
                  <span className="payment-icon">{pm.icon}</span>
                  <div className="payment-info">
                    <strong>{pm.label}</strong>
                    <span>{pm.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {paymentMethod === 'ONLINE' && (
              <div className="credit-card-form animate-slide-down">
                <h3>Payment Cards</h3>

                {savedCards.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#d4af37' }}>Saved payment cards</div>
                      <button
                        type="button"
                        onClick={clearSelectedCard}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(212,175,55,0.4)',
                          color: '#d4af37',
                          borderRadius: '8px',
                          padding: '0.5rem 0.85rem',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        Use new card
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                      {savedCards.map((card) => (
                        <label
                          key={card.id}
                          className={`saved-card-item ${selectedCardId === card.id ? 'selected' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: '16px',
                            border: selectedCardId === card.id ? '2px solid #d4af37' : '1px solid rgba(212,175,55,0.25)',
                            background: selectedCardId === card.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                            <input
                              type="radio"
                              name="savedCard"
                              checked={selectedCardId === card.id}
                              onChange={() => {
                                setSelectedCardId(card.id);
                                setCardNumber('');
                                setExpiryDate('');
                                setCvv('');
                                setCardHolderName('');
                                setErrors(prev => ({ ...prev, cardNumber: '', expiryDate: '', cvv: '', cardHolderName: '' }));
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: '700', color: '#f5e8c4' }}>
                                {card.brand || 'Card'} • **** **** **** {card.last4}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: 'rgba(240,230,211,0.7)' }}>
                                {card.cardHolderName || 'Cardholder'} • Expires {card.expiry}
                                {card.cardNickname ? ` • ${card.cardNickname}` : ''}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCardModal(card);
                              }}
                              style={{
                                background: '#d4af37',
                                color: '#1a0f0a',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 0.8rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.id);
                              }}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                color: '#f0e6d3',
                                border: '1px solid rgba(212,175,55,0.2)',
                                borderRadius: '8px',
                                padding: '0.5rem 0.8rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCardId ? (
                  <div style={{ padding: '1rem', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(255,255,255,0.03)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#d4af37' }}>Using saved card for this checkout</p>
                    <p style={{ margin: '0.75rem 0 0', color: 'rgba(240,230,211,0.8)' }}>
                      Your selected card will be used and you will not need to enter card details again.
                    </p>
                    <button
                      type="button"
                      onClick={clearSelectedCard}
                      style={{
                        marginTop: '1rem',
                        background: 'transparent',
                        border: '1px solid rgba(212,175,55,0.3)',
                        color: '#d4af37',
                        borderRadius: '10px',
                        padding: '0.65rem 0.85rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                      }}
                    >
                      Use a different card
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="form-field full-width">
                      <label htmlFor="cardHolderName">Card Holder Name</label>
                      <input
                        id="cardHolderName"
                        type="text"
                        placeholder="Hemali Perera"
                        value={cardHolderName}
                        onChange={(e) => {
                          setCardHolderName(e.target.value);
                          setErrors(prev => ({ ...prev, cardHolderName: '' }));
                        }}
                        className={errors.cardHolderName ? 'field-error' : ''}
                      />
                      {errors.cardHolderName && <span className="error-msg">{errors.cardHolderName}</span>}
                    </div>
                    <div className="form-field full-width">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        id="cardNumber"
                        type="text"
                        placeholder="4111 1111 1111 1111"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                          setCardNumber(formatted);
                          setErrors(prev => ({ ...prev, cardNumber: '' }));
                        }}
                        className={errors.cardNumber ? 'field-error' : ''}
                      />
                      {errors.cardNumber && <span className="error-msg">{errors.cardNumber}</span>}
                    </div>
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                          id="expiryDate"
                          type="text"
                          placeholder="MM/YY"
                          maxLength="5"
                          value={expiryDate}
                          onChange={(e) => {
                            setExpiryDate(e.target.value);
                            setErrors(prev => ({ ...prev, expiryDate: '' }));
                          }}
                          className={errors.expiryDate ? 'field-error' : ''}
                        />
                        {errors.expiryDate && <span className="error-msg">{errors.expiryDate}</span>}
                      </div>
                      <div className="form-field">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          maxLength="3"
                          value={cvv}
                          onChange={(e) => {
                            setCvv(e.target.value.replace(/\D/g, ''));
                            setErrors(prev => ({ ...prev, cvv: '' }));
                          }}
                          className={errors.cvv ? 'field-error' : ''}
                        />
                        {errors.cvv && <span className="error-msg">{errors.cvv}</span>}
                      </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: '#d4af37' }}>
                        <input
                          type="checkbox"
                          checked={saveCardCheckbox}
                          onChange={(e) => setSaveCardCheckbox(e.target.checked)}
                        />
                        Save this card for future payments
                      </label>
                    </div>
                    {saveCardCheckbox && (
                      <div className="form-field full-width" style={{ marginTop: '1rem' }}>
                        <label htmlFor="cardNickname">Card Nickname (Optional)</label>
                        <input
                          id="cardNickname"
                          type="text"
                          placeholder="e.g. Luxury Visa"
                          value={cardNickname}
                          onChange={(e) => setCardNickname(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

        </div>

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <aside className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-items">
            {cartItems.map((item) => (
              <div key={item.bookId} className="summary-item">
                <span className="summary-emoji">{item.book?.image || '📖'}</span>
                <div className="summary-item-info">
                  <span className="summary-item-title">{item.book?.title}</span>
                  <span className="summary-item-qty">×{item.quantity}</span>
                </div>
                <span className="summary-item-price">
                  ${(item.book?.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="summary-rows">
            <div className="s-row"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="s-row green"><span>Discount</span><span>−${discount.toFixed(2)}</span></div>}
            <div className="s-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="s-row"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span></div>
            <div className="s-row total-row"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
          </div>

          {errors.general && <p className="general-error">{errors.general}</p>}

          <button
            id="place-order-btn"
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Placing Order…' : `Place Order · $${grandTotal.toFixed(2)}`}
          </button>

          <p className="secure-note">🔒 Your payment information is secure</p>
        </aside>
      </div>

      {showCardModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#101010',
            border: '1px solid rgba(212,175,55,0.35)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 24px 72px rgba(0,0,0,0.55)',
            color: '#f0e6d3',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editingCard ? 'Edit Saved Card' : 'Add New Card'}</h3>
                <p style={{ margin: '0.5rem 0 0', color: 'rgba(240,230,211,0.7)' }}>
                  {editingCard ? 'Update saved card details securely.' : 'Enter card details to save for future payments.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#d4af37',
                  fontSize: '1.8rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>

            {errors.cardForm && <p style={{ color: '#f87171', marginBottom: '1rem' }}>{errors.cardForm}</p>}

            <div className="form-field full-width">
              <label htmlFor="modal-cardHolderName">Card Holder Name</label>
              <input
                id="modal-cardHolderName"
                type="text"
                placeholder="Hemali Perera"
                value={cardFormData.cardHolderName}
                onChange={(e) => setCardFormData(prev => ({ ...prev, cardHolderName: e.target.value }))}
              />
            </div>

            <div className="form-field full-width">
              <label htmlFor="modal-cardNumber">Card Number</label>
              <input
                id="modal-cardNumber"
                type="text"
                placeholder={editingCard ? 'Leave blank to keep existing card' : '4111 1111 1111 1111'}
                maxLength="19"
                value={cardFormData.cardNumber}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                  setCardFormData(prev => ({ ...prev, cardNumber: formatted }));
                }}
              />
            </div>

            <div className="form-grid" style={{ gap: '1rem' }}>
              <div className="form-field">
                <label htmlFor="modal-expiryDate">Expiry Date</label>
                <input
                  id="modal-expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  value={cardFormData.expiryDate}
                  onChange={(e) => setCardFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="modal-cvv">CVV</label>
                <input
                  id="modal-cvv"
                  type="password"
                  placeholder="123"
                  maxLength="3"
                  value={cardFormData.cvv}
                  onChange={(e) => setCardFormData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                />
              </div>
            </div>

            <div className="form-field full-width">
              <label htmlFor="modal-cardNickname">Card Nickname</label>
              <input
                id="modal-cardNickname"
                type="text"
                placeholder="Optional alias (e.g. Luxury Visa)"
                value={cardFormData.cardNickname}
                onChange={(e) => setCardFormData(prev => ({ ...prev, cardNickname: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowCardModal(false)}
                style={{
                  border: '1px solid rgba(212,175,55,0.35)',
                  background: 'transparent',
                  color: '#d4af37',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCard}
                disabled={loading}
                style={{
                  border: 'none',
                  background: '#d4af37',
                  color: '#101010',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                }}
              >
                {loading ? 'Saving…' : 'Save Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
