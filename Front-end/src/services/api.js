/**
 * api.js – Central API service layer
 *
 * All calls to the Java backend go through this file.
 * Base URL: http://localhost:8080
 *
 * Members:
 *   M1 Athethan  → auth.*
 *   M2 Deepika   → books.list, books.categories
 *   M3 Yuvaniya  → books.getById, books.getReviews, books.addReview
 *   M4 Lojeni    → cart.*
 *   M5 Vishnu    → orders.*
 *   M6 Vishok    → users.*
 *   M7 Vishahan  → admin.*
 */

const BASE = 'http://localhost:8080/api';

// ── Helper ────────────────────────────────────────────────────────────────────

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(BASE + endpoint, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Auth (Member 1 – Athethan) ────────────────────────────────────────────────

export const auth = {
  register: (name, email, password, phone) =>
    request('POST', '/auth/register', { name, email, password, phone }),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  forgotPassword: (email, newPassword) =>
    request('POST', '/auth/forgot-password', { email, newPassword }),
};

// ── Books (Members 2 & 3 – Deepika & Yuvaniya) ────────────────────────────────

export const books = {
  /** List / search / filter / sort / paginate */
  list: ({ search = '', category = 'All', sortBy = '', page = 1, pageSize = 9 } = {}) =>
    request('GET', `/books?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&sortBy=${sortBy}&page=${page}&pageSize=${pageSize}`),

  categories: () =>
    request('GET', '/books/categories'),

  getById: (id, userId) =>
    request('GET', `/books/${id}${userId ? '?userId=' + userId : ''}`),

  getReviews: (bookId) =>
    request('GET', `/books/${bookId}/reviews`),

  getAllReviews: () =>
    request('GET', '/books/all/reviews'),

  addReview: (bookId, { userId, userName, rating, comment }) =>
    request('POST', `/books/${bookId}/reviews`, { userId, userName, rating, comment }),
};

// ── Cart (Member 4 – Lojeni) ──────────────────────────────────────────────────

export const cart = {
  get: (userId) =>
    request('GET', `/cart/${userId}`),

  add: (userId, bookId, quantity = 1) =>
    request('POST', '/cart/add', { userId, bookId, quantity }),

  update: (userId, bookId, quantity) =>
    request('PUT', '/cart/update', { userId, bookId, quantity }),

  remove: (userId, bookId) =>
    request('DELETE', '/cart/remove', { userId, bookId }),

  clear: (userId) =>
    request('DELETE', `/cart/${userId}/clear`),

  applyDiscount: (code) =>
    request('POST', '/cart/discount', { code }),
};

// ── Orders (Member 5 – Vishnu) ────────────────────────────────────────────────

export const orders = {
  place: ({ userId, items, subtotal, discountCode, discountAmount, paymentMethod, address, deliveryType }) =>
    request('POST', '/orders/place', {
      userId, items, subtotal, discountCode, discountAmount,
      paymentMethod, address, deliveryType,
    }),

  getByUser: (userId) =>
    request('GET', `/orders/${userId}`),

  /** Alias used by OrderHistory component */
  getHistory: (userId) =>
    request('GET', `/orders/${userId}`),

  getById: (orderId) =>
    request('GET', `/orders/detail/${orderId}`),
};

// ── Users / Profile (Member 6 – Vishok) ──────────────────────────────────────

export const users = {
  get: (userId) =>
    request('GET', `/users/${userId}`),

  update: (userId, fields) =>
    request('PUT', `/users/${userId}`, fields),

  changePassword: (userId, oldPassword, newPassword) =>
    request('POST', `/users/${userId}/change-password`, { oldPassword, newPassword }),

  getWishlist: (userId) =>
    request('GET', `/users/${userId}/wishlist`),

  addToWishlist: (userId, bookId) =>
    request('POST', `/users/${userId}/wishlist`, { bookId }),

  removeFromWishlist: (userId, bookId) =>
    request('DELETE', `/users/${userId}/wishlist/${bookId}`),

  getReviews: (userId) =>
    request('GET', `/users/${userId}/reviews`),

  updateReview: (userId, reviewId, rating, comment) =>
    request('PUT', `/users/${userId}/reviews/${reviewId}`, { rating, comment }),

  deleteReview: (userId, reviewId) =>
    request('DELETE', `/users/${userId}/reviews/${reviewId}`),
};

// ── Admin (Member 7 – Vishahan) ───────────────────────────────────────────────

export const admin = {
  // Books
  getAllBooks: () =>
    request('GET', '/books?pageSize=999'),

  addBook: (book) =>
    request('POST', '/books', book),

  updateBook: (id, fields) =>
    request('PUT', `/books/${id}`, fields),

  deleteBook: (id) =>
    request('DELETE', `/books/${id}`),

  // Users
  getAllUsers: () =>
    request('GET', '/users'),

  deleteUser: (id) =>
    request('DELETE', `/users/${id}`),

  // Orders
  getAllOrders: () =>
    request('GET', '/orders/all'),

  updateOrderStatus: (orderId, status) =>
    request('PUT', `/orders/${orderId}/status`, { status }),

  getSalesSummary: () =>
    request('GET', '/orders/summary'),

  // Reviews
  getAllReviews: () =>
    request('GET', '/admin/reviews'),

  approveReview: (reviewId) =>
    request('PUT', `/admin/reviews/${reviewId}/approve`),

  deleteReview: (reviewId) =>
    request('DELETE', `/admin/reviews/${reviewId}`),
};

// ── Messages / Contact (Member 8) ─────────────────────────────────────────────

export const messages = {
  create: (name, email, subject, body) => 
    request('POST', '/messages', { name, email, subject, body }),
  getAll: () => 
    request('GET', '/messages'),
  updateStatus: (id, status) => 
    request('PUT', `/messages/${id}`, { status }),
  delete: (id) => 
    request('DELETE', `/messages/${id}`),
};

// ── Authors / About (Member 9) ────────────────────────────────────────────────

export const authors = {
  create: (data) => 
    request('POST', '/authors', data),
  getAll: () => 
    request('GET', '/authors'),
  update: (id, fields) => 
    request('PUT', `/authors/${id}`, fields),
  delete: (id) => 
    request('DELETE', `/authors/${id}`),
};

export const faqs = {
  create: (data) => 
    request('POST', '/faqs', data),
  getAll: () => 
    request('GET', '/faqs'),
  update: (id, fields) => 
    request('PUT', `/faqs/${id}`, fields),
  delete: (id) => 
    request('DELETE', `/faqs/${id}`),
};

export const articles = {
  create: (data) => 
    request('POST', '/articles', data),
  getAll: () => 
    request('GET', '/articles'),
  getById: (id) => 
    request('GET', `/articles/${id}`),
  update: (id, fields) => 
    request('PUT', `/articles/${id}`, fields),
  delete: (id) => 
    request('DELETE', `/articles/${id}`),
};
