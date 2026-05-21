// src/components/bookdetails/BookDetailsPage.jsx
// Redesigned Book Details Page with premium Black & Gold UI
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { admin as adminApi, books as booksApi, users as usersApi } from '../../services/api';
import BookImage from '../books/BookImage';
import BookCard from '../books/BookCard';
import './BookDetailsPage.css';

export default function BookDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editBookData, setEditBookData] = useState(null);
  const [actionMsg, setActionMsg] = useState('');
  const [cartMsg, setCartMsg] = useState('');

  // ── Related Books State ───────────────────────────────────────────────────
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // ── New Review Form State ──────────────────────────────────────────────────
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch Book & Reviews ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      const [bookRes, reviewRes] = await Promise.all([
        booksApi.getById(id, user?.id),
        booksApi.getReviews(id),
      ]);

      if (bookRes.ok) {
        setBook(bookRes.data);
      }
      if (reviewRes.ok) {
        const list = Array.isArray(reviewRes.data) ? reviewRes.data : [];
        setReviews(list.filter(r => r.approved !== false));
      }
      setLoading(false);
    }

    loadBook();
    setQuantity(1); // Reset quantity on page change
  }, [id, user?.id]);

  // ── Fetch Related Books ───────────────────────────────────────────────────
  useEffect(() => {
    async function loadRelated() {
      if (!book?.category) {
        setRelatedBooks([]);
        return;
      }
      setRelatedLoading(true);
      try {
        const res = await booksApi.list({ category: book.category, pageSize: 6 });
        if (res.ok && res.data && Array.isArray(res.data.books)) {
          // Filter out current book and take top 4
          const filtered = res.data.books.filter(b => b.id !== book.id).slice(0, 4);
          setRelatedBooks(filtered);
        } else {
          setRelatedBooks([]);
        }
      } catch (err) {
        console.error('Failed to load related books', err);
        setRelatedBooks([]);
      }
      setRelatedLoading(false);
    }
    loadRelated();
  }, [book?.category, book?.id]);

  // ── Fetch Wishlist ────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      if (!user?.id) {
        setWishlistIds([]);
        return;
      }
      setWishlistLoading(true);
      const res = await usersApi.getWishlist(user.id);
      if (!active) return;
      if (res.ok && Array.isArray(res.data)) {
        const ids = res.data.map(item => item.bookId || item.id || item.book?.id).filter(Boolean);
        setWishlistIds(ids);
      } else {
        setWishlistIds([]);
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

  // ── Wishlist Toggle (Supports Main Book & Related Books) ──────────────────
  const handleToggleWishlist = async (targetBook = book) => {
    if (!user) { navigate('/login'); return; }
    if (!targetBook) return;

    const isCurrentlySaved = wishlistIds.includes(targetBook.id);
    setWishlistLoading(true);
    const res = isCurrentlySaved
      ? await usersApi.removeFromWishlist(user.id, targetBook.id)
      : await usersApi.addToWishlist(user.id, targetBook.id);

    if (res.ok) {
      if (isCurrentlySaved) {
        setWishlistIds(prev => prev.filter(id => id !== targetBook.id));
        showActionMessage(`Removed "${targetBook.title}" from wishlist`);
      } else {
        setWishlistIds(prev => [...prev, targetBook.id]);
        showActionMessage(`Added "${targetBook.title}" to wishlist`);
      }
    } else {
      showActionMessage(res.data?.message || 'Unable to update wishlist');
    }
    setWishlistLoading(false);
  };

  // ── Cart Handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    const result = await addToCart(book.id, quantity);
    if (result.success) {
      setCartMsg('✓ Added to cart!');
    } else {
      setCartMsg(result.error || 'Failed to add');
    }
    setTimeout(() => setCartMsg(''), 3000);
  };

  const handleAddToCartForRelated = async (relatedBook) => {
    if (!user) { navigate('/login'); return; }
    const result = await addToCart(relatedBook.id, 1);
    if (result.success) {
      showActionMessage(`✓ Added "${relatedBook.title}" to cart!`);
    } else {
      showActionMessage(result.error || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    const result = await addToCart(book.id, quantity);
    if (result.success) {
      navigate('/checkout');
    } else {
      showActionMessage(result.error || 'Failed to initiate purchase');
    }
  };

  // ── Admin Actions ──────────────────────────────────────────────────────────
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

  // ── Submit Review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    const { ok, data } = await booksApi.addReview(id, {
      userId: user.id,
      userName: user.name || user.email,
      rating: reviewRating,
      comment: reviewComment,
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

  // ── Helper functions for rich specifications & content fallbacks ─────────
  const getHighlights = (targetBook) => {
    if (targetBook.highlights && Array.isArray(targetBook.highlights)) return targetBook.highlights;
    const cat = (targetBook.category || '').toLowerCase();
    if (cat.includes('fiction') || cat.includes('literature') || cat.includes('novel')) {
      return [
        "Enchanting narrative prose by a celebrated literary mastermind",
        "Deep character development with intense emotional resonance",
        "Archival quality printing with exquisite gilded leaf details",
        "A compelling masterpiece that lingers long after the final page"
      ];
    } else if (cat.includes('history') || cat.includes('biography') || cat.includes('non-fiction')) {
      return [
        "Meticulously researched historical facts and annotations",
        "Captivating chronological layout of historical milestones",
        "Premium leather-look bound design, perfect for home libraries",
        "Essential collector's edition for scholars and bibliophiles"
      ];
    } else {
      return [
        "Exclusive hand-numbered edition with signature gold-leaf emboss",
        "Elegantly arranged typesetting using historical typeface fonts",
        "Includes a premium ribbon marker and heavy cardstock slipcase",
        "Contains original essays, forward analyses, and author reflections"
      ];
    }
  };

  const getWhyLike = (targetBook) => {
    if (targetBook.whyLike) return targetBook.whyLike;
    return `Collectors and enthusiasts of fine literature will appreciate the profound storytelling and physical elegance of "${targetBook.title}". Crafted to showcase the author's vision, this premium volume bridges intellectual depth and design beauty, making it a stellar addition to any private collection.`;
  };

  const getAuthorBio = (targetBook) => {
    if (targetBook.authorBio) return targetBook.authorBio;
    return `${targetBook.author} is an esteemed writer widely recognized for their contributions to the ${targetBook.category} genre. With an elegant prose style and a keen eye for detail, they have captured the hearts of readers worldwide. First published in ${targetBook.year}, this work highlights the author's masterful ability to balance narrative power with beautiful structure.`;
  };

  const getISBN = (targetBook) => {
    if (targetBook.isbn) return targetBook.isbn;
    let hash = 0;
    const str = targetBook.id || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const part1 = Math.abs(hash) % 900 + 100;
    const part2 = Math.abs(hash * 3) % 90 + 10;
    const part3 = Math.abs(hash * 7) % 90000 + 10000;
    const check = Math.abs(hash) % 10;
    return `978-${part1}-${part2}-${part3}-${check}`;
  };

  const getPublisher = (targetBook) => {
    return targetBook.publisher || 'Elysian Editions & Press';
  };

  const getLanguage = (targetBook) => {
    return targetBook.language || 'English';
  };

  // ── Ratings Calculations ──────────────────────────────────────────────────
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (book?.rating ?? 0).toFixed(1);

  // ── Loading & Error States ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="book-details-loading-container">
        <div className="details-luxury-spinner">
          <div className="spinner-inner"></div>
          <div className="spinner-center">📖</div>
        </div>
        <p className="loading-text">Curating Details from our Archives…</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-details-not-found-container">
        <div className="error-icon">🔏</div>
        <h2>Volume Not Found</h2>
        <p>The requested book details could not be located in our private catalog.</p>
        <Link to="/books" className="back-catalog-btn">← Return to Catalogue</Link>
      </div>
    );
  }

  const discount = book.originalPrice > book.price
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100) : 0;

  const wishlisted = wishlistIds.includes(book.id);

  // ── Stock Indicator Helper ────────────────────────────────────────────────
  const renderStockIndicator = (stock) => {
    if (stock > 5) {
      return (
        <span className="stock-badge in-stock">
          <span className="pulse-dot green"></span>In Stock ({stock} available)
        </span>
      );
    } else if (stock > 0) {
      return (
        <span className="stock-badge low-stock">
          <span className="pulse-dot gold"></span>Low Stock (Only {stock} left)
        </span>
      );
    } else {
      return (
        <span className="stock-badge out-stock">
          <span className="pulse-dot red"></span>Out of Stock
        </span>
      );
    }
  };

  return (
    <div className="book-details-page-wrapper">
      {/* ── Breadcrumb ── */}
      <nav className="details-breadcrumb-nav">
        <Link to="/">Home</Link>
        <span className="separator">/</span>
        <Link to="/books">Catalogue</Link>
        <span className="separator">/</span>
        <span className="current-item">{book.title}</span>
      </nav>

      {/* ── Main Book Hero (Top Section) ── */}
      <section className="details-hero-section">
        {/* Left Side: Large cover image */}
        <div className="details-cover-container">
          <div className="details-cover-frame">
            <BookImage featuredImage={book.featuredImage} title={book.title} />
            {book.isNew && <span className="luxury-badge badge-new">New Release</span>}
            {book.isBestseller && <span className="luxury-badge badge-bestseller">Bestseller</span>}
            {discount > 0 && <span className="luxury-badge badge-discount">-{discount}% Off</span>}
            {book.isPdf && <span className="luxury-badge badge-pdf">Digital PDF</span>}
          </div>
        </div>

        {/* Right Side: Essential Book Info */}
        <div className="details-info-container">
          <span className="details-category-tag">{book.category}</span>
          <h1 className="details-book-title">{book.title}</h1>
          <p className="details-book-author">
            By <span className="author-highlight">{book.author}</span>
          </p>

          {/* Ratings Summary */}
          <div className="details-ratings-summary">
            <div className="rating-stars-row">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`star-icon ${i < Math.floor(avgRating) ? 'gold-filled' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="rating-avg-val">{avgRating}</span>
            <span className="rating-divider">•</span>
            <span className="rating-reviews-count">{reviews.length} Customer Review{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Price Container */}
          <div className="details-price-row">
            <span className="active-price">${Number(book.price).toFixed(2)}</span>
            {book.originalPrice > book.price && (
              <span className="original-strikethrough">${Number(book.originalPrice).toFixed(2)}</span>
            )}
          </div>

          {/* Stock availability */}
          <div className="details-stock-status">
            {renderStockIndicator(book.stock)}
          </div>

          {/* Interactive actions (Quantity, Add to Cart, Buy Now, Wishlist) */}
          <div className="details-purchase-controls">
            <div className="quantity-adjuster">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={book.stock === 0}>−</button>
              <span className="qty-number">{quantity}</span>
              <button className="qty-btn" onClick={() => setQuantity(q => Math.min(book.stock || 99, q + 1))} disabled={book.stock === 0}>+</button>
            </div>

            <div className="purchase-buttons-group">
              {book.isPdf && book.pdfUrl ? (
                <a
                  href={book.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-luxe-primary btn-read-pdf"
                  id="read-pdf-details-btn"
                >
                  📖 Read Digital PDF
                </a>
              ) : (
                <>
                  <button
                    className="btn-luxe-secondary btn-add-cart"
                    id="add-to-cart-details-btn"
                    onClick={handleAddToCart}
                    disabled={book.stock === 0}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    className="btn-luxe-primary btn-buy-now"
                    onClick={handleBuyNow}
                    disabled={book.stock === 0}
                  >
                    ✨ Buy Now
                  </button>
                </>
              )}
            </div>

            <button
              className={`btn-luxe-wishlist ${wishlisted ? 'wishlist-active' : ''}`}
              onClick={() => handleToggleWishlist(book)}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? '...' : wishlisted ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>

          {/* Notifications */}
          {cartMsg && <div className="cart-feedback-bubble">{cartMsg}</div>}
          {actionMsg && <div className="action-feedback-bubble">{actionMsg}</div>}

          {/* Admin Controls */}
          {user?.role === 'ADMIN' && (
            <div className="details-admin-controls-box">
              <span className="admin-label">Admin Controls:</span>
              <button className="admin-btn edit" onClick={handleOpenEdit}>✎ Edit Metadata</button>
              <button className="admin-btn delete" onClick={handleDeleteBook}>⊗ Delete Book</button>
            </div>
          )}
        </div>
      </section>

      {/* ── Detailed Book Explanation Section ── */}
      <section className="details-explanation-section">
        <h2 className="section-title-gold">Volume Specifications & About</h2>

        <div className="explanation-layout-grid">
          {/* Left card: Literary contents */}
          <div className="explanation-literary-card glass-panel">
            <div className="literary-subsection">
              <h3>About this book</h3>
              <p className="book-description-text">{book.description}</p>
            </div>

            <div className="literary-subsection">
              <h3>Key Highlights</h3>
              <ul className="highlights-list">
                {getHighlights(book).map((highlight, idx) => (
                  <li key={idx} className="highlight-item">
                    <span className="gold-bullet">✦</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="literary-subsection">
              <h3>Why Readers Love It</h3>
              <p className="why-readers-love-text">{getWhyLike(book)}</p>
            </div>
          </div>

          {/* Right card: Technical specifications & Author bio */}
          <div className="explanation-specs-card glass-panel">
            <div className="specs-subsection">
              <h3>Book Specifications</h3>
              <div className="specs-table-container">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td className="spec-label">Language</td>
                      <td className="spec-value">{getLanguage(book)}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Page Count</td>
                      <td className="spec-value">{book.pages || 'N/A'} pages</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Publisher</td>
                      <td className="spec-value">{getPublisher(book)}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Publication Year</td>
                      <td className="spec-value">{book.year || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Category</td>
                      <td className="spec-value">{book.category}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Format</td>
                      <td className="spec-value">{book.isPdf ? 'Digital (PDF)' : 'Premium Print (Hardcover)'}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">ISBN-13</td>
                      <td className="spec-value isbn-text">{getISBN(book)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="specs-subsection">
              <h3>About the Author</h3>
              <div className="author-card-mini">
                <div className="author-initial-avatar">
                  {book.author?.charAt(0).toUpperCase()}
                </div>
                <div className="author-details-mini">
                  <h4>{book.author}</h4>
                  <p className="author-bio-mini-text">{getAuthorBio(book)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews Section ── */}
      <section className="details-reviews-section">
        <h2 className="section-title-gold">Reader Appraisals</h2>

        <div className="reviews-layout-grid">
          {/* Left Side: Reviews list */}
          <div className="reviews-list-panel glass-panel">
            <h3>Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <div className="empty-reviews-state">
                <span className="empty-quote">“</span>
                <p>No appraisal records found. Be the first to share your thoughts on this volume.</p>
              </div>
            ) : (
              <div className="reviews-appraisals-list">
                {reviews.map((r, i) => (
                  <div key={r.id || i} className="review-card-item">
                    <div className="review-item-header">
                      <div className="reviewer-name-avatar">
                        {(r.userName || r.userId || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="reviewer-meta-text">
                        <strong className="reviewer-display-name">{r.userName || 'Anonymous'}</strong>
                        <div className="reviewer-rating-stars">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <span key={j} className={`star-mini-icon ${j < r.rating ? 'active' : 'inactive'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="review-submitted-date">{r.date || 'Verified Review'}</span>
                    </div>
                    <p className="review-comment-body">{r.comment}</p>
                    {r.adminReply && (
                      <div className="review-response-box">
                        <span className="reply-label">Curator response:</span> {r.adminReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Add review form */}
          <div className="reviews-form-panel glass-panel">
            {user ? (
              <form className="luxe-review-form" onSubmit={handleSubmitReview}>
                <h3>Submit an Appraisal</h3>
                <p className="form-subtitle">Share your reading experience with fellow collectors.</p>

                <div className="rating-select-container">
                  <span className="rating-select-label">Your Rating:</span>
                  <div className="rating-star-buttons">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        type="button"
                        key={n}
                        className={`star-select-btn ${n <= reviewRating ? 'active-gold' : 'inactive-star'}`}
                        onClick={() => setReviewRating(n)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field-textarea">
                  <label htmlFor="reviewComment">Review Comments</label>
                  <textarea
                    id="reviewComment"
                    placeholder="Enter your detailed feedback on prose, presentation, and bindings…"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    rows={5}
                  />
                </div>

                {reviewMsg && <p className="review-status-msg">{reviewMsg}</p>}

                <button type="submit" className="btn-luxe-primary btn-submit-review" disabled={submitting}>
                  {submitting ? 'Submitting Appraisal…' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="review-login-prompt">
                <span className="lock-icon">🔒</span>
                <h3>Write a Review</h3>
                <p>You must be authenticated to submit appraisals for this volume.</p>
                <Link to="/login" className="btn-luxe-primary prompt-login-btn">Log In to Review</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Related Books Section ── */}
      {relatedBooks.length > 0 && (
        <section className="details-related-books-section">
          <h2 className="section-title-gold">Related Masterpieces</h2>
          <div className="related-books-grid-container">
            {relatedLoading ? (
              <div className="related-loading-placeholder">
                <div className="spinner-small"></div>
                <p>Loading similar works...</p>
              </div>
            ) : (
              <div className="related-books-grid">
                {relatedBooks.map(item => (
                  <BookCard
                    key={item.id}
                    book={item}
                    onAddToCart={handleAddToCartForRelated}
                    inWishlist={wishlistIds.includes(item.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Admin Edit Modal (Maintained for Backend Admin Functionality) ── */}
      {editMode && (
        <div className="details-modal-overlay" onClick={() => setEditMode(false)}>
          <div className="details-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h3>Edit Book Details</h3>
              <button className="details-modal-close" onClick={() => setEditMode(false)}>✕</button>
            </div>

            <div className="details-modal-body">
              <div className="details-modal-grid">
                {[
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'author', label: 'Author', type: 'text' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'price', label: 'Price ($)', type: 'number' },
                  { key: 'originalPrice', label: 'Original Price ($)', type: 'number' },
                  { key: 'stock', label: 'Stock Count', type: 'number' },
                  { key: 'pages', label: 'Page Count', type: 'number' },
                  { key: 'year', label: 'Publication Year', type: 'number' },
                  { key: 'image', label: 'Emoji Icon (Fallback)', type: 'text' },
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
                          [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
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
              <button className="modal-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              <button className="modal-save-btn" onClick={handleSaveBookUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
