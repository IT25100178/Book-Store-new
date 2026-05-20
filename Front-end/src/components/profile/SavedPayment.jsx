// src/components/profile/SavedPayment.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cards as cardsApi } from '../../services/api';

export default function SavedPayment() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [brand, setBrand] = useState('Visa');

  // Editing state
  const [editingCardId, setEditingCardId] = useState(null);
  const [editExpiry, setEditExpiry] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadCards();
    }
  }, [user]);

  const loadCards = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await cardsApi.get(user.id);
      if (res.ok) {
        setCards(Array.isArray(res.data) ? res.data : []);
      } else {
        setError(res.data?.message || 'Failed to load payment cards.');
      }
    } catch (err) {
      setError('An error occurred loading saved cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!cardNumber || !expiryDate || !cardHolder) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await cardsApi.save(user.id, cardNumber, expiryDate);
      if (res.ok) {
        setSuccess('Card saved successfully!');
        setCardNumber('');
        setExpiryDate('');
        setCardHolder('');
        setBrand('Visa');
        loadCards();
      } else {
        setError(res.data?.message || 'Failed to save card.');
      }
    } catch (err) {
      setError('An error occurred while saving the card.');
    }
  };

  const handleStartEdit = (card) => {
    setEditingCardId(card.id);
    setEditExpiry(card.expiry || '');
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditExpiry('');
  };

  const handleUpdateExpiry = async (cardId) => {
    setError('');
    setSuccess('');
    if (!editExpiry) {
      setError('Expiry date is required.');
      return;
    }

    try {
      const res = await cardsApi.update(cardId, editExpiry);
      if (res.ok) {
        setSuccess('Expiry date updated successfully!');
        setEditingCardId(null);
        setEditExpiry('');
        loadCards();
      } else {
        setError(res.data?.message || 'Failed to update expiry date.');
      }
    } catch (err) {
      setError('An error occurred while updating the card.');
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this payment card?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await cardsApi.delete(cardId);
      if (res.ok) {
        setSuccess('Card deleted successfully!');
        loadCards();
      } else {
        setError(res.data?.message || 'Failed to delete card.');
      }
    } catch (err) {
      setError('An error occurred while deleting the card.');
    }
  };

  return (
    <div>
      <h2 className="profile-section-title">Saved Payment Methods</h2>

      {success && <div className="profile-success-msg">{success}</div>}
      {error && <div className="profile-error-msg">{error}</div>}

      {/* Saved cards list */}
      <div className="saved-cards-section" style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Your Saved Cards</h3>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading cards...</p>
        ) : cards.length === 0 ? (
          <div className="profile-empty-state" style={{ padding: '30px 0' }}>
            <span className="profile-empty-state-icon">💳</span>
            <p>No saved payment cards found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {cards.map((card) => {
              const isVisa = card.brand?.toLowerCase() === 'visa';
              const isMaster = card.brand?.toLowerCase() === 'mastercard';
              const cardBg = isVisa 
                ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                : isMaster
                  ? 'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)'
                  : 'linear-gradient(135deg, #111 0%, #333 100%)';
              
              const isEditing = editingCardId === card.id;

              return (
                <div key={card.id} style={{
                  background: cardBg,
                  borderRadius: '16px',
                  padding: '24px',
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '170px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                      {card.brand}
                    </div>
                    <span style={{ fontSize: '1.5rem' }}>💳</span>
                  </div>

                  <div style={{ fontSize: '1.25rem', letterSpacing: '3px', margin: '20px 0 10px', fontFamily: 'monospace' }}>
                    •••• •••• •••• {card.last4}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Card Holder</div>
                      <div style={{ fontWeight: '600' }}>{user?.name || 'VALUED CUSTOMER'}</div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>Expires</div>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input 
                            type="text" 
                            placeholder="MM/YY"
                            value={editExpiry}
                            onChange={(e) => setEditExpiry(e.target.value)}
                            style={{
                              width: '60px',
                              background: 'rgba(255,255,255,0.2)',
                              border: '1px solid #fff',
                              borderRadius: '4px',
                              color: '#fff',
                              textAlign: 'center',
                              padding: '2px',
                              fontSize: '0.8rem'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ fontWeight: '600' }}>{card.expiry}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions overlay/corner */}
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {isEditing ? (
                      <>
                        <button 
                          onClick={() => handleUpdateExpiry(card.id)}
                          style={{
                            background: '#2ecc71',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Save Expiry"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          style={{
                            background: '#e74c3c',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Cancel"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStartEdit(card)}
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Edit Expiry"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(card.id)}
                          style={{
                            background: 'rgba(231,76,60,0.4)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                          title="Delete Card"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add new card form */}
      <div style={{
        background: 'var(--profile-sub-card-bg)',
        border: '1px solid var(--profile-sub-card-border)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Add Online Payment Method</h3>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="profile-label">Card Holder Name</label>
              <input 
                className="profile-input" 
                type="text" 
                placeholder="Name on card"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
              />
            </div>
            <div>
              <label className="profile-label">Payment Type</label>
              <select 
                className="profile-input" 
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{ height: '48px' }}
              >
                <option value="Visa">Visa</option>
                <option value="MasterCard">MasterCard</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label className="profile-label">Card Number</label>
              <input 
                className="profile-input" 
                type="text" 
                maxLength="19"
                placeholder="16-digit card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="profile-label">Expiry Date</label>
              <input 
                className="profile-input" 
                type="text" 
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => {
                  let val = e.target.value;
                  if (val.length === 2 && !val.includes('/')) {
                    val += '/';
                  }
                  setExpiryDate(val);
                }}
                maxLength="5"
              />
            </div>
          </div>

          <button className="profile-btn-primary" type="submit" style={{ marginTop: '8px' }}>
            Save Card
          </button>
        </form>
      </div>
    </div>
  );
}
