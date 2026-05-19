import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users as usersApi, books as booksApi } from '../../services/api';

export default function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  
  // Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookId, setNewBookId] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Fetch reviews and books
  useEffect(() => {
    if (!user?.id) return;
    usersApi.getReviews(user.id).then(({ ok, data }) => {
      if (ok && Array.isArray(data)) setReviews(data);
    });
    booksApi.list({ pageSize: 100 }).then(({ ok, data }) => {
      if (ok && data && Array.isArray(data.books)) setAllBooks(data.books);
    });
  }, [user]);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : '';

  const renderStars = (rating) => '★'.repeat(rating || 0) + '☆'.repeat(5 - (rating || 0));

  const handleDelete = async (id) => {
    const { ok } = await usersApi.deleteReview(user.id, id);
    if (ok) {
      setReviews(prev => prev.filter(r => r.id !== id));
      setConfirmId(null);
      showToast('Review deleted');
    } else {
      showToast('Failed to delete review');
    }
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || review.reviewText || '');
    setConfirmId(null);
  };

  const handleUpdate = async (id) => {
    const { ok } = await usersApi.updateReview(user.id, id, editRating, editComment);
    if (ok) {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, rating: editRating, comment: editComment } : r));
      setEditingId(null);
      showToast('Review updated');
    } else {
      showToast('Failed to update review');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newBookId) {
      showToast('Please select a book to review');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please write a review comment');
      return;
    }
    setIsSubmitting(true);
    const { ok, data } = await booksApi.addReview(newBookId, {
      userId: user.id,
      userName: user.name || user.email,
      rating: newRating,
      comment: newComment,
    });
    
    if (ok && data.success) {
      const createdReview = data.review;
      setReviews(prev => [createdReview, ...prev]);
      setNewBookId('');
      setNewRating(5);
      setNewComment('');
      setShowAddForm(false);
      showToast('Review submitted successfully!');
    } else {
      showToast(data?.message || 'Failed to submit review');
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="profile-section-title" style={{ margin: 0, padding: 0, border: 'none' }}>
          My Reviews ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </h2>
        <button 
          className="profile-btn-primary" 
          style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Close Form' : '✏️ Write a Review'}
        </button>
      </div>

      {/* --- Write a Review Form --- */}
      {showAddForm && (
        <div style={{
          background: 'var(--profile-sub-card-bg)',
          border: '1px solid var(--profile-card-border)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <h3 style={{ color: '#D4AF37', margin: '0 0 16px 0', fontSize: '1.1rem', fontFamily: "'Playfair Display', serif" }}>
            Share Your Reading Experience
          </h3>
          <form onSubmit={handleCreateReview}>
            <div style={{ marginBottom: '16px' }}>
              <label className="profile-label">Select Book</label>
              <select
                value={newBookId}
                onChange={(e) => setNewBookId(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'var(--profile-input-bg)',
                  color: 'var(--profile-input-text)',
                  border: '1px solid var(--profile-input-border)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              >
                <option value="" style={{ background: 'var(--profile-card-bg)' }}>-- Select a book --</option>
                {allBooks.map(book => (
                  <option key={book.id} value={book.id} style={{ background: 'var(--profile-card-bg)' }}>
                    {book.title} (by {book.author})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="profile-label" style={{ marginBottom: '4px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setNewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      color: star <= (hoverRating || newRating) ? '#D4AF37' : 'var(--text-muted)',
                      transition: 'color 0.2s',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label className="profile-label">Review Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What did you love or dislike about this masterpiece?..."
                required
                rows={4}
                style={{
                  width: '100%',
                  background: 'var(--profile-input-bg)',
                  color: 'var(--profile-input-text)',
                  border: '1px solid var(--profile-input-border)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="profile-btn-outline" 
                onClick={() => setShowAddForm(false)}
                style={{ padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="profile-btn-primary" 
                disabled={isSubmitting}
                style={{ padding: '8px 24px', fontSize: '0.85rem' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Reviews List --- */}
      {reviews.length === 0 ? (
        <div className="profile-empty-state">
          <span className="profile-empty-state-icon">⭐</span>
          <p>You haven't written any reviews yet</p>
        </div>
      ) : reviews.map((review) => {
        const isConfirming = confirmId === review.id;
        const isEditing = editingId === review.id;
        const book = allBooks.find(b => b.id === review.bookId);
        const bookTitle = book ? book.title : `Book ID: ${review.bookId}`;
        const bookAuthor = book ? `by ${book.author}` : '';
        const bookImage = book ? book.image : '📖';
        
        return (
          <div key={review.id} style={{
            background:'var(--profile-sub-card-bg)', border:'1px solid var(--profile-sub-card-border)',
            borderRadius:'16px', padding:'20px', marginBottom:'16px',
            transition: 'transform 0.2s',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'14px' }}>
              <div style={{
                width: '44px',
                height: '60px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--profile-sub-card-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0
              }}>
                {bookImage}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.98rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {bookTitle}
                </h4>
                {bookAuthor && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '2px' }}>
                    {bookAuthor}
                  </span>
                )}
              </div>
              <span style={{ color:'var(--text-muted)', fontSize:'0.78rem', alignSelf: 'flex-start' }}>{formatDate(review.date)}</span>
            </div>
            
            {isEditing ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating: </label>
                  <select 
                    value={editRating} 
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    style={{ background: 'var(--profile-input-bg)', color: '#D4AF37', border: '1px solid var(--profile-sub-card-border)', borderRadius: '4px', padding: '4px 8px' }}
                  >
                    {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <textarea 
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', background: 'var(--profile-input-bg)', color: 'var(--text-primary)', border: '1px solid var(--profile-sub-card-border)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}
                />
              </div>
            ) : (
              <>
                <div style={{ color:'#D4AF37', fontSize:'1rem', letterSpacing:'2px', marginBottom:'10px' }}>
                  {renderStars(review.rating)}
                </div>
                <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', fontStyle:'italic', lineHeight:1.6, marginBottom:'16px' }}>
                  "{review.comment || review.reviewText}"
                </p>
              </>
            )}

            <div style={{ display:'flex', justifyContent:'flex-end', gap: '10px' }}>
              {isEditing ? (
                <>
                  <button className="profile-btn-outline" style={{ padding:'6px 16px', fontSize:'0.82rem' }} onClick={() => setEditingId(null)}>Cancel</button>
                  <button className="profile-btn-primary" style={{ padding:'6px 16px', fontSize:'0.82rem' }} onClick={() => handleUpdate(review.id)}>Save Changes</button>
                </>
              ) : isConfirming ? (
                <div style={{ display:'flex', alignItems:'center', gap:'10px', fontSize:'0.85rem' }}>
                  <span>Sure?</span>
                  <button className="profile-btn-danger"  style={{ padding:'6px 16px', fontSize:'0.82rem' }} onClick={() => handleDelete(review.id)}>Yes</button>
                  <button className="profile-btn-outline" style={{ padding:'6px 16px', fontSize:'0.82rem' }} onClick={() => setConfirmId(null)}>No</button>
                </div>
              ) : (
                <>
                  <button className="profile-btn-outline" style={{ padding:'8px 16px', fontSize:'0.82rem' }} onClick={() => startEdit(review)}>✏️ Edit</button>
                  <button className="profile-btn-danger" style={{ padding:'8px 16px', fontSize:'0.82rem' }} onClick={() => setConfirmId(review.id)}>🗑️ Delete</button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {toast && (
        <div className="notification-toast animate-slide-in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
