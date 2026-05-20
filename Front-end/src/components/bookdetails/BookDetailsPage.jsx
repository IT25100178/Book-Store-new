// src/components/bookdetails/BookDetailsPage.jsx
// Member 7 – Vishahan
// Fetches a single book and its reviews from the Java backend
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { admin as adminApi, books as booksApi, users as usersApi } from '../../services/api';
import './BookDetailsPage.css';

export default function BookDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [book,           setBook]           = useState(null);
  const [reviews,        setReviews]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeTab,      setActiveTab]      = useState('description');
  const [quantity,       setQuantity]       = useState(1);
  const [wishlisted,     setWishlisted]     = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [editMode,       setEditMode]       = useState(false);
  const [editBookData,   setEditBookData]   = useState(null);
  const [actionMsg,      setActionMsg]      = useState('');


  // ── New review form ───────────────────────────────────────────────────────
  const [reviewRating,  setReviewRating]  = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMsg,     setReviewMsg]     = useState('');
  const [submitting,    setSubmitting]    = useState(false);

  const [cartMsg, setCartMsg] = useState('');




  // ── Fetch book + reviews ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      const [bookRes, reviewRes] = await Promise.all([
        booksApi.getById(id, user?.id),
        booksApi.getReviews(id),
      ]);

      if (bookRes.ok) setBook(bookRes.data);
      if (reviewRes.ok) {
        const list = Array.isArray(reviewRes.data) ? reviewRes.data : [];
        setReviews(list.filter(r => r.approved !== false));
      }
      setLoading(false);
    }

    loadBook();
  }, [id, user?.id]);

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      if (!user?.id || !book?.id) {
        setWishlisted(false);
        return;
      }
      setWishlistLoading(true);
      const res = await usersApi.getWishlist(user.id);
      if (!active) return;
      if (res.ok && Array.isArray(res.data)) {
        setWishlisted(res.data.some((item) =>
          item.bookId === book.id || item.id === book.id || item.book?.id === book.id
        ));
      } else {
        setWishlisted(false);
      }
      setWishlistLoading(false);
    }

    loadWishlist();
    return () => { active = false; };
  }, [user?.id, book?.id]);

  const refreshBook = async () => {
    setLoading(true);
    const bookRes = await booksApi.getById(id, user?.id);
    if (bookRes.ok) setBook(bookRes.data);
    setLoading(false);
  };

  const showActionMessage = (message) => {
    setActionMsg(message);
    setTimeout(() => setActionMsg(''), 3500);
  };

  const handleToggleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (!book) return;

    setWishlistLoading(true);
    const res = wishlisted
      ? await usersApi.removeFromWishlist(user.id, book.id)
      : await usersApi.addToWishlist(user.id, book.id);

    if (res.ok) {
      setWishlisted(!wishlisted);
      showActionMessage(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
    } else {
      showActionMessage(res.data?.message || 'Unable to update wishlist');
    }
    setWishlistLoading(false);
  };

  const handleOpenEdit = () => {
    if (!book) return;
    setEditBookData({ ...book });
    setEditMode(true);
  };

  const handleSaveBookUpdate = async () => {
    if (!editBookData) return;
    setLoading(true);
    const fields = {
      title: editBookData.title,
      author: editBookData.author,
      price: editBookData.price,
      originalPrice: editBookData.originalPrice,
      category: editBookData.category,
      description: editBookData.description,
      stock: editBookData.stock,
      pages: editBookData.pages,
      year: editBookData.year,
      image: editBookData.image,
      isNew: editBookData.isNew,
      isBestseller: editBookData.isBestseller,
      isPdf: editBookData.isPdf,
      pdfUrl: editBookData.pdfUrl,
    };
    const res = await adminApi.updateBook(book.id, fields);
    if (res.ok) {
      showActionMessage('Book updated successfully');
      setEditMode(false);
      await refreshBook();
    } else {
      showActionMessage(res.data?.message || 'Save failed');
    }
    setLoading(false);
  };

  const handleDeleteBook = async () => {
    if (!book) return;
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    const res = await adminApi.deleteBook(book.id);
    if (res.ok) {
      showActionMessage('Book deleted successfully');
      navigate('/books');
    } else {
      showActionMessage(res.data?.message || 'Delete failed');
    }
  };


  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    const result = await addToCart(book.id, quantity);
    setCartMsg(result.success ? '✓ Added to cart!' : (result.error || 'Failed'));
    setTimeout(() => setCartMsg(''), 3000);
  };


  // ── Submit review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    const { ok, data } = await booksApi.addReview(id, {
      userId:   user.id,
      userName: user.name || user.email,
      rating:   reviewRating,
      comment:  reviewComment,
    });
    if (ok) {
      setReviewMsg('Review submitted for moderation! It will appear once approved.');
      setReviewComment('');
      setReviewRating(5);
      // Refresh reviews
      const res = await booksApi.getReviews(id);
      if (res.ok) {
        const list = Array.isArray(res.data) ? res.data : [];
        setReviews(list.filter(r => r.approved !== false));
      }
    } else {
      setReviewMsg(data?.message || 'Submission failed');
    }
    setSubmitting(false);
    setTimeout(() => setReviewMsg(''), 4000);
  };

  // ── Average rating ────────────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (book?.rating ?? 0).toFixed(1);

  if (loading) {
    return (
      <div className="book-details-loading">
        <div className="details-spinner">📖</div>
        <p>Loading book details…</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-not-found">
        <h2>Book not found</h2>
        <Link to="/books">← Back to Catalogue</Link>
      </div>
    );
  }

  const discount = book.originalPrice > book.price
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;

  return (
    <div className="book-details-page">

      {/* ── Back Link ──────────────────────────────────────────────────────── */}
      <div className="details-breadcrumb">
        <Link to="/">Home</Link> ›
        <Link to="/books">Books</Link> ›
        <span>{book.title}</span>
      </div>

      {/* ── Main Section ────────────────────────────────────────────────────── */}
      <div className="details-hero">

        {/* Left – Book Cover */}
        <div className="details-cover">
          <div className="details-cover-inner">
            <div className="details-emoji">{book.image || '📖'}</div>
          </div>
          {book.isNew        && <span className="det-badge new">New</span>}
          {book.isBestseller && <span className="det-badge best">Bestseller</span>}
          {discount > 0      && <span className="det-badge disc">-{discount}%</span>}
          {book.isPdf        && <span className="det-badge pdf" style={{ background: 'rgba(212,175,55,0.2)', color: '#FFD700', border: '1px solid rgba(212,175,55,0.4)' }}>PDF Format</span>}
        </div>

        {/* Right – Info */}
        <div className="details-info">
          <span className="details-category">{book.category}</span>
          <h1 className="details-title">{book.title}</h1>
          <p className="details-author">by <strong>{book.author}</strong></p>

          {/* Rating */}
          <div className="details-rating">
            <div className="det-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.floor(avgRating) ? 'star filled' : 'star'}>★</span>
              ))}
            </div>
            <span className="det-avg">{avgRating}</span>
            <span className="det-rev-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>

          {/* Price */}
          <div className="details-price">
            <span className="det-price">${Number(book.price).toFixed(2)}</span>
            {book.originalPrice > book.price && (
              <span className="det-orig">${Number(book.originalPrice).toFixed(2)}</span>
            )}
          </div>

          {/* Meta */}
          <div className="details-meta-grid">
            {[
              { label: 'Pages',    value: book.pages },
              { label: 'Year',     value: book.year  },
              { label: 'Category', value: book.category },
              { label: 'Stock',    value: book.stock > 0 ? `${book.stock} available` : 'Out of stock' },
            ].map(({ label, value }) => (
              <div key={label} className="det-meta-item">
                <span className="det-meta-label">{label}</span>
                <span className="det-meta-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="details-actions">
            <div className="det-qty">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(book.stock || 99, q + 1))}>+</button>
            </div>
            {book.isPdf && book.pdfUrl ? (
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="read-pdf-details-btn"
                className="det-read-pdf"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #D4AF37)',
                  color: '#000',
                  textDecoration: 'none',
                  padding: '0.8rem 1.75rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                📖 Read PDF
              </a>
            ) : (
              <button
                id="add-to-cart-details-btn"
                className="det-add-cart"
                onClick={handleAddToCart}
                disabled={book.stock === 0}
              >
                {book.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
              </button>
            )}

            <button
              className={`det-wishlist-btn ${wishlisted ? 'saved' : ''}`}
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? 'Saving…' : wishlisted ? '♥ Saved' : '♡ Save to Wishlist'}
            </button>

            <Link to="/cart" className="det-view-cart">View Cart</Link>
          </div>

          {actionMsg && (
            <p className="det-action-msg">{actionMsg}</p>
          )}

          {user?.role === 'ADMIN' && (
            <div className="det-admin-actions">
              <button className="det-admin-btn edit" onClick={handleOpenEdit}>
                ✎ Edit Book
              </button>
              <button className="det-admin-btn delete" onClick={handleDeleteBook}>
                ⊗ Delete Book
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="details-tabs">
        {['description','author','reviews'].map(tab => (
          <button
            key={tab}
            className={`det-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'reviews' && ` (${reviews.length})`}
          </button>
        ))}
      </div>

      <div className="details-tab-content">

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="det-description">
            <p>{book.description}</p>
          </div>
        )}

        {/* Author Tab */}
        {activeTab === 'author' && (
          <div className="det-author-section">
            <div className="det-author-avatar">{book.author?.charAt(0)}</div>
            <div>
              <h3>{book.author}</h3>
              <p className="det-author-bio">
                {book.author} is a renowned author whose work "{book.title}" has captured readers worldwide.
                Published in {book.year}, this {book.category} classic continues to inspire generations.
              </p>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="det-reviews-section">

            {/* Existing reviews */}
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((r, i) => (
                  <div key={r.id || i} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-avatar">{(r.userName || r.userId || 'U').charAt(0).toUpperCase()}</div>
                      <div>
                        <strong className="reviewer-name">{r.userName || 'Anonymous'}</strong>
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <span key={j} className={j < r.rating ? 'star filled' : 'star'}>★</span>
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{r.date}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                    {r.adminReply && (
                      <div className="review-admin-reply">
                        <span>Admin reply:</span> {r.adminReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add review form */}
            {user && (
              <form className="add-review-form" onSubmit={handleSubmitReview}>
                <h4>Write a Review</h4>
                <div className="star-select">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n}
                      className={n <= reviewRating ? 'star-btn filled' : 'star-btn'}
                      onClick={() => setReviewRating(n)}>★</button>
                  ))}
                </div>
                <textarea
                  placeholder="Share your thoughts about this book…"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={4}
                />
                {reviewMsg && <p className="review-msg">{reviewMsg}</p>}
                <button type="submit" className="submit-review-btn" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {editMode && (
        <div className="details-modal-overlay" onClick={() => setEditMode(false)}>
          <div className="details-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h3>Edit Book Details</h3>
              <button className="details-modal-close" onClick={() => setEditMode(false)}>
                ✕
              </button>
            </div>

            <div className="details-modal-body">
              <div className="details-modal-grid">
                {[
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'author', label: 'Author', type: 'text' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'price', label: 'Price', type: 'number' },
                  { key: 'originalPrice', label: 'Original Price', type: 'number' },
                  { key: 'stock', label: 'Stock', type: 'number' },
                  { key: 'pages', label: 'Pages', type: 'number' },
                  { key: 'year', label: 'Year', type: 'number' },
                  { key: 'image', label: 'Emoji Icon', type: 'text' },
                  { key: 'pdfUrl', label: 'PDF URL', type: 'text' },
                ].map((field) => (
                  <label key={field.key} className="details-modal-field">
                    <span>{field.label}</span>
                    <input
                      type={field.type}
                      value={editBookData[field.key] ?? ''}
                      onChange={(e) =>
                        setEditBookData((prev) => ({
                          ...prev,
                          [field.key]: field.type === 'number' ? e.target.value : e.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
                <div className="details-modal-field details-modal-switches">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!editBookData.isNew}
                      onChange={(e) =>
                        setEditBookData((prev) => ({ ...prev, isNew: e.target.checked }))
                      }
                    />
                    New Release
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!editBookData.isBestseller}
                      onChange={(e) =>
                        setEditBookData((prev) => ({ ...prev, isBestseller: e.target.checked }))
                      }
                    />
                    Bestseller
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!editBookData.isPdf}
                      onChange={(e) =>
                        setEditBookData((prev) => ({ ...prev, isPdf: e.target.checked }))
                      }
                    />
                    PDF Book
                  </label>
                </div>
              </div>
            </div>

            <div className="details-modal-footer">
              <button className="modal-cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
              <button className="modal-save-btn" onClick={handleSaveBookUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
