// src/components/admin/AdminDashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  admin as adminApi,
  books as booksApi,
  authors as authorsApi,
  faqs as faqsApi,
  articles as articlesApi,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import logoImg from "../../assets/Luxury books logo.png";
import "./AdminDashboard.css";

const SECTIONS = [
  { id: 'dashboard',  label: 'Dashboard',   icon: '◈' },
  { id: 'books',      label: 'Books',        icon: '▣' },
  { id: 'authors',    label: 'Authors',      icon: '✍' },
  { id: 'faqs',       label: 'FAQs',         icon: '❓' },
  { id: 'articles',   label: 'Journal',      icon: '📰' },
  { id: 'users',      label: 'Users',        icon: '◎' },
  { id: 'orders',     label: 'Orders',       icon: '◷' },
  { id: 'reviews',    label: 'Reviews',      icon: '★' },
  { id: 'categories', label: 'Categories',   icon: '⊞' },
  { id: 'reports',    label: 'Analytics',    icon: '▲' },
];

const STATUS_COLORS = {
  PENDING: { bg: "rgba(212,175,55,0.15)", color: "#D4AF37", hex: "#D4AF37" },
  CONFIRMED: { bg: "rgba(96,165,250,0.15)", color: "#60a5fa", hex: "#60a5fa" },
  SHIPPED: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa", hex: "#a78bfa" },
  DELIVERED: { bg: "rgba(52,211,153,0.15)", color: "#34d399", hex: "#34d399" },
  CANCELLED: { bg: "rgba(248,113,113,0.15)", color: "#f87171", hex: "#f87171" },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [summary, setSummary] = useState(null);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookForm, setBookForm] = useState(null);
  const [authorForm, setAuthorForm] = useState(null);
  const [faqForm, setFaqForm] = useState(null);
  const [articleForm, setArticleForm] = useState(null);
  const [toast, setToast] = useState("");

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");

  // Sorting & Filtering State
  const [orderSort, setOrderSort] = useState("newest"); // newest, oldest, amount-high, amount-low

  useEffect(() => {
    loadSection(activeSection);
  }, [activeSection]);

  const loadSection = async (section) => {
    setLoading(true);
    setGlobalSearch(""); // Reset search on tab change
    try {
      switch (section) {
        case "dashboard": {
          const [sum, bk] = await Promise.all([
            adminApi.getSalesSummary(),
            booksApi.list({ pageSize: 999 }),
          ]);
          setSummary(sum.data);
          setBooks(bk.data.books || []);
          break;
        }
        case "books": {
          const { data } = await booksApi.list({ pageSize: 999 });
          setBooks(data.books || []);
          break;
        }
        case "authors": {
          const { data } = await authorsApi.getAll();
          setAuthors(Array.isArray(data) ? data : []);
          break;
        }
        case "faqs": {
          const { data } = await faqsApi.getAll();
          setFaqs(Array.isArray(data) ? data : []);
          break;
        }
        case "articles": {
          const { data } = await articlesApi.getAll();
          setArticles(Array.isArray(data) ? data : []);
          break;
        }
        case "users": {
          const { data } = await adminApi.getAllUsers();
          setUsers(Array.isArray(data) ? data : []);
          break;
        }
        case "orders": {
          const { data } = await adminApi.getAllOrders();
          setOrders(Array.isArray(data) ? data : []);
          break;
        }
        case "reviews": {
          const [{ data: revs }, { data: bks }] = await Promise.all([
            adminApi.getAllReviews(),
            booksApi.list({ pageSize: 999 }),
          ]);
          setReviews(Array.isArray(revs) ? revs : []);
          setBooks(bks.books || []);
          break;
        }
        case "reports":
        case "categories": {
          const [sum, bk, ord] = await Promise.all([
            adminApi.getSalesSummary(),
            booksApi.list({ pageSize: 999 }),
            adminApi.getAllOrders(),
          ]);
          setSummary(sum.data);
          setBooks(bk.data.books || []);
          setOrders(Array.isArray(ord.data) ? ord.data : []);
          break;
        }
        default:
          break;
      }
    } catch (_) {}
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(""), 3000);
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Permanently delete this book?")) return;
    const { ok, data } = await adminApi.deleteBook(id);
    if (ok) {
      showToast(data.message || "Book deleted");
      loadSection("books");
    } else showToast("Failed to delete", "error");
  };

  const handleApproveReview = async (reviewId) => {
    try {
      const { ok, data } = await adminApi.approveReview(reviewId);
      if (ok) {
        showToast("Review approved successfully!");
        loadSection("reviews");
      } else {
        showToast(data?.message || "Failed to approve review");
      }
    } catch (_) {
      showToast("Error approving review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const { ok, data } = await adminApi.deleteReview(reviewId);
      if (ok) {
        showToast("Review deleted successfully!");
        loadSection("reviews");
      } else {
        showToast(data?.message || "Failed to delete review");
      }
    } catch (_) {
      showToast("Error deleting review");
    }
  };

  const handleReplyReview = async (reviewId, replyText) => {
    if (!replyText || !replyText.trim()) return;
    try {
      const { ok, data } = await adminApi.replyToReview(reviewId, user.id, replyText);
      if (ok) {
        showToast("Reply submitted successfully!");
        loadSection("reviews");
      } else {
        showToast(data?.message || "Failed to submit reply", "error");
      }
    } catch (_) {
      showToast("Error submitting reply", "error");
    }
  };

  const handleComplainReview = async (reviewId) => {
    const reason = window.prompt("Enter reason for flagging this review:", "Violent/Inappropriate");
    if (reason === null) return;
    try {
      const { ok, data } = await adminApi.complainReview(reviewId, user.id, reason || "Violent/Inappropriate");
      if (ok) {
        showToast("Review flagged successfully!");
        loadSection("reviews");
      } else {
        showToast(data?.message || "Failed to flag review", "error");
      }
    } catch (_) {
      showToast("Error flagging review", "error");
    }
  };

  const handleBlockUser = async (targetUserId, block) => {
    const actionStr = block ? "block" : "unblock";
    if (!window.confirm(`Are you sure you want to ${actionStr} this user?`)) return;
    try {
      const { ok, data } = await adminApi.blockUser(targetUserId, user.id, block);
      if (ok) {
        showToast(`User ${actionStr}ed successfully!`);
        loadSection("users");
      } else {
        showToast(data?.message || `Failed to ${actionStr} user`, "error");
      }
    } catch (_) {
      showToast(`Error performing user moderation`, "error");
    }
  };

  const handleSaveBook = async (formData) => {
    setLoading(true);
    const res =
      bookForm.mode === "edit"
        ? await adminApi.updateBook(bookForm.data.id, formData)
        : await adminApi.addBook(formData);
    if (res.ok) {
      showToast(res.data.message || "Saved successfully");
      setBookForm(null);
      loadSection("books");
    } else showToast("Save failed", "error");
    setLoading(false);
  };

  const handleDeleteAuthor = async (id) => {
    if (!window.confirm("Permanently delete this author?")) return;
    const { ok, data } = await authorsApi.delete(id);
    if (ok) {
      showToast(data.message || "Author deleted");
      loadSection("authors");
    } else showToast("Failed to delete", "error");
  };

  const handleSaveAuthor = async (formData) => {
    setLoading(true);
    const res =
      authorForm.mode === "edit"
        ? await authorsApi.update(authorForm.data.id, formData)
        : await authorsApi.create(formData);
    if (res.ok) {
      showToast(res.data.message || "Saved successfully");
      setAuthorForm(null);
      loadSection("authors");
    } else showToast("Save failed", "error");
    setLoading(false);
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Permanently delete this FAQ?")) return;
    const { ok, data } = await faqsApi.delete(id);
    if (ok) {
      showToast(data.message || "FAQ deleted");
      loadSection("faqs");
    } else showToast("Failed to delete", "error");
  };

  const handleSaveFaq = async (formData) => {
    setLoading(true);
    const res =
      faqForm.mode === "edit"
        ? await faqsApi.update(faqForm.data.id, formData)
        : await faqsApi.create(formData);
    if (res.ok) {
      showToast(res.data.message || "Saved successfully");
      setFaqForm(null);
      loadSection("faqs");
    } else showToast("Save failed", "error");
    setLoading(false);
  };

  const handleSaveArticle = async (form) => {
    setLoading(true);
    const res =
      form.mode === "edit"
        ? await articlesApi.update(form.id, form.data)
        : await articlesApi.create(form.data);
    if (res.ok) {
      showToast(res.data.message || "Article saved successfully");
      setArticleForm(null);
      loadSection("articles");
    } else showToast("Save failed", "error");
    setLoading(false);
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    setLoading(true);
    const { ok, data } = await articlesApi.delete(id);
    if (ok) {
      showToast(data.message || "Article deleted successfully");
      loadSection("articles");
    } else showToast("Failed to delete", "error");
    setLoading(false);
  };

  const handleOrderStatus = async (orderId, status) => {
    await adminApi.updateOrderStatus(orderId, status);
    loadSection("orders");
    showToast(`Order updated to ${status}`);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    const { ok, data } = await adminApi.deleteUser(id);
    if (ok) {
      showToast(data.message || "User deleted");
      loadSection("users");
    }
  };


  // ── DATA FILTERING LOGIC ──────────────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(globalSearch.toLowerCase()),
    );
  }, [books, globalSearch]);

  const filteredAuthors = useMemo(() => {
    return authors.filter(
      (a) =>
        a.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        a.role?.toLowerCase().includes(globalSearch.toLowerCase()),
    );
  }, [authors, globalSearch]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter(
      (f) =>
        f.question?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        f.category?.toLowerCase().includes(globalSearch.toLowerCase()),
    );
  }, [faqs, globalSearch]);

  const filteredArticles = useMemo(() => {
    return articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        a.tag?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(globalSearch.toLowerCase()),
    );
  }, [articles, globalSearch]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(globalSearch.toLowerCase()),
    );
  }, [users, globalSearch]);


  const sortedAndFilteredOrders = useMemo(() => {
    let result = orders.filter(
      (o) =>
        o.id?.toString().includes(globalSearch) ||
        o.userId?.toString().includes(globalSearch),
    );
    result.sort((a, b) => {
      if (orderSort === "newest")
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (orderSort === "oldest")
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (orderSort === "amount-high")
        return (b.totalPrice || 0) - (a.totalPrice || 0);
      if (orderSort === "amount-low")
        return (a.totalPrice || 0) - (b.totalPrice || 0);
      return 0;
    });
    return result;
  }, [orders, globalSearch, orderSort]);

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  const renderDashboard = () => {
    const stats = [
      {
        label: "Total Revenue",
        value: `$${Number(summary?.totalRevenue || 0).toFixed(2)}`,
        icon: "💰",
        color: "#D4AF37",
        change: "+12%",
      },
      {
        label: "Total Orders",
        value: summary?.totalOrders ?? "—",
        icon: "📦",
        color: "#60a5fa",
        change: "+8%",
      },
      {
        label: "Total Books",
        value: books.length,
        icon: "📚",
        color: "#a78bfa",
        change: `${books.length} titles`,
      },
      {
        label: "Pending Orders",
        value: summary?.pendingOrders ?? "—",
        icon: "⏳",
        color: "#f59e0b",
        change: "Needs action",
      },
      {
        label: "Confirmed",
        value: summary?.confirmed ?? "—",
        icon: "✅",
        color: "#34d399",
        change: "Processing",
      },
      {
        label: "Delivered",
        value: summary?.delivered ?? "—",
        icon: "🚚",
        color: "#10b981",
        change: "Completed",
      },
    ];
    return (
      <div className="section-body">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Dashboard Overview</h2>
            <p className="section-subtitle">Welcome back, Luxury Admin 👋</p>
          </div>
          <div className="header-date">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((s) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ "--accent": s.color }}
            >
              <div className="stat-card-top">
                <div className="stat-icon-wrap">{s.icon}</div>
                <span className="stat-change">{s.change}</span>
              </div>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
              <div className="stat-bar">
                <div className="stat-bar-fill" />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-bottom">
          <div className="quick-card">
            <h3 className="quick-title">📚 Top Categories</h3>
            <div className="cat-chips">
              {[...new Set(books.map((b) => b.category))]
                .slice(0, 8)
                .map((c) => (
                  <span key={c} className="cat-chip">
                    {c}
                  </span>
                ))}
            </div>
          </div>
          <div className="quick-card">
            <h3 className="quick-title">⚡ Quick Actions</h3>
            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => setActiveSection("books")}
              >
                + Add Book
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveSection("orders")}
              >
                View Orders
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveSection("users")}
              >
                Manage Users
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveSection("reports")}
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── BOOKS ──────────────────────────────────────────────────────────────────
  const renderBooks = () => (
    <div className="section-body">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Manage Books</h2>
          <p className="section-subtitle">{books.length} titles in catalogue</p>
        </div>
        <button
          className="primary-btn"
          onClick={() =>
            setBookForm({
              mode: "add",
              data: {
                title: "",
                author: "",
                price: "",
                originalPrice: "",
                category: "",
                description: "",
                stock: "",
                pages: "",
                year: "",
                image: "📖",
                isNew: false,
                isBestseller: false,
              },
            })
          }
        >
          <span>＋</span> Add Book
        </button>
      </div>

      {bookForm && (
        <BookFormModal
          form={bookForm}
          onSave={handleSaveBook}
          onClose={() => setBookForm(null)}
        />
      )}

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((b) => (
              <tr key={b.id} className="table-row">
                <td>
                  <div className="book-cell">
                    <span className="book-emoji">{b.image}</span>
                    <span className="book-title-text">{b.title}</span>
                  </div>
                </td>
                <td className="text-muted">{b.author}</td>
                <td>
                  <span className="tag tag-category">{b.category}</span>
                </td>
                <td className="text-gold">${Number(b.price).toFixed(2)}</td>
                <td>
                  <span
                    className={`tag ${Number(b.stock) < 5 ? "tag-danger" : "tag-success"}`}
                  >
                    {b.stock} {Number(b.stock) < 5 ? "⚠" : ""}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="icon-btn edit"
                      onClick={() => setBookForm({ mode: "edit", data: b })}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteBook(b.id)}
                      title="Delete"
                    >
                      ⊗
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBooks.length === 0 && (
          <div className="empty-state">No books found</div>
        )}
      </div>
    </div>
  );

  // ── USERS ──────────────────────────────────────────────────────────────────
  const renderUsers = () => (
    <div className="section-body">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Manage Users</h2>
          <p className="section-subtitle">{users.length} registered accounts</p>
        </div>
      </div>
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="table-row">
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-sm">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span>
                      {u.name}
                      {u.isBlocked && (
                        <span 
                          style={{
                            marginLeft: '8px', 
                            background: 'rgba(239, 68, 68, 0.2)', 
                            color: '#f87171', 
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}
                        >
                          BLOCKED
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span
                    className={`tag ${u.role === "ADMIN" ? "tag-admin" : "tag-user"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="text-muted mono">{u.joinDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {u.role !== "ADMIN" && (
                      <>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete"
                        >
                          ⊗
                        </button>
                        <button
                          onClick={() => handleBlockUser(u.id, !u.isBlocked)}
                          style={{
                            background: u.isBlocked ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: u.isBlocked ? '#34d399' : '#f87171',
                            border: u.isBlocked ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="empty-state">No users found</div>
        )}
      </div>
    </div>
  );

  // ── ORDERS ─────────────────────────────────────────────────────────────────
  const renderOrders = () => (
    <div className="section-body">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Manage Orders</h2>
          <p className="section-subtitle">{orders.length} total orders</p>
        </div>
        <div className="filters-row">
          <select
            className="filter-select"
            value={orderSort}
            onChange={(e) => setOrderSort(e.target.value)}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="amount-high">Sort: Amount (High to Low)</option>
            <option value="amount-low">Sort: Amount (Low to High)</option>
          </select>
        </div>
      </div>
      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredOrders.map((o) => {
              const sc = STATUS_COLORS[o.status] || {};
              return (
                <tr key={o.id} className="table-row">
                  <td
                    className="mono text-gold"
                    style={{ fontSize: "0.78rem" }}
                  >
                    {o.id}
                  </td>
                  <td
                    className="mono text-muted"
                    style={{ fontSize: "0.78rem" }}
                  >
                    {o.userId}
                  </td>
                  <td className="text-gold">
                    ${Number(o.totalPrice || 0).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className="status-pill"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td
                    className="text-muted mono"
                    style={{ fontSize: "0.78rem" }}
                  >
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                    >
                      {[
                        "PENDING",
                        "CONFIRMED",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedAndFilteredOrders.length === 0 && (
          <div className="empty-state">No orders found</div>
        )}
      </div>
    </div>
  );

  // ── REPORTS / ANALYTICS ──────────────────────────────────────────────────
  const renderReports = () => {
    const avgOrder = summary?.totalOrders
      ? (summary.totalRevenue / summary.totalOrders).toFixed(2)
      : "0.00";
    const deliveryRate = summary?.totalOrders
      ? ((summary.delivered / summary.totalOrders) * 100).toFixed(0)
      : 0;

    // Calculate SVG Donut Chart Math for Orders
    const totalCircumference = 2 * Math.PI * 40; // r=40
    let offset = 0;
    const donutSegments = [
      {
        key: "Pending",
        count: summary?.pendingOrders || 0,
        color: STATUS_COLORS.PENDING.hex,
      },
      {
        key: "Confirmed",
        count: summary?.confirmed || 0,
        color: STATUS_COLORS.CONFIRMED.hex,
      },
      {
        key: "Delivered",
        count: summary?.delivered || 0,
        color: STATUS_COLORS.DELIVERED.hex,
      },
      {
        key: "Cancelled",
        count: summary?.cancelled || 0,
        color: STATUS_COLORS.CANCELLED.hex,
      },
    ].map((segment) => {
      const percentage = summary?.totalOrders
        ? segment.count / summary.totalOrders
        : 0;
      const strokeDasharray = `${percentage * totalCircumference} ${totalCircumference}`;
      const strokeDashoffset = -offset;
      offset += percentage * totalCircumference;
      return { ...segment, strokeDasharray, strokeDashoffset, percentage };
    });

    // Mock Line Graph for Revenue Trend (Using actual revenue as max peak for realism)
    const rev = summary?.totalRevenue || 1000;
    const points = `0,90 40,80 80,50 120,60 160,30 200,${100 - Math.min((rev / 5000) * 100, 100)}`;
    const areaPoints = `${points} 200,100 0,100`;

    return (
      <div className="section-body">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Analytics & Reports</h2>
            <p className="section-subtitle">
              Real-time business insights & metrics
            </p>
          </div>
        </div>
        <div className="reports-grid">
          <div className="report-card">
            <div className="report-icon">💰</div>
            <h3>Total Revenue</h3>
            <p className="report-big">
              ${Number(summary?.totalRevenue || 0).toFixed(2)}
            </p>
            <div className="report-rows">
              <div className="report-row">
                <span>Total Orders</span>
                <strong>{summary?.totalOrders ?? 0}</strong>
              </div>
              <div className="report-row">
                <span>Avg Order Value</span>
                <strong>${avgOrder}</strong>
              </div>
            </div>
          </div>
          <div className="report-card">
            <div className="report-icon">📦</div>
            <h3>Fulfillment</h3>
            <p className="report-big">{deliveryRate}%</p>
            <p
              style={{
                color: "rgba(240,230,211,0.5)",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Overall delivery rate
            </p>
            <div className="report-rows">
              <div className="report-row">
                <span>🕐 Pending</span>
                <strong style={{ color: "#D4AF37" }}>
                  {summary?.pendingOrders ?? 0}
                </strong>
              </div>
              <div className="report-row">
                <span>✅ Confirmed</span>
                <strong style={{ color: "#60a5fa" }}>
                  {summary?.confirmed ?? 0}
                </strong>
              </div>
              <div className="report-row">
                <span>🚚 Delivered</span>
                <strong style={{ color: "#34d399" }}>
                  {summary?.delivered ?? 0}
                </strong>
              </div>
            </div>
          </div>
          <div className="report-card">
            <div className="report-icon">📚</div>
            <h3>Catalogue</h3>
            <p className="report-big">{books.length}</p>
            <p
              style={{
                color: "rgba(240,230,211,0.5)",
                fontSize: "0.8rem",
                marginBottom: "1rem",
              }}
            >
              Total unique titles
            </p>
            <div className="report-rows">
              <div className="report-row">
                <span>Categories</span>
                <strong>
                  {[...new Set(books.map((b) => b.category))].length}
                </strong>
              </div>
              <div className="report-row">
                <span>Low Stock (&lt;5)</span>
                <strong style={{ color: "#f87171" }}>
                  {books.filter((b) => Number(b.stock) < 5).length}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Real World SVG Graphs */}
        <div className="chart-container">
          {/* Revenue Trend Line Graph */}
          <div className="svg-graph-box">
            <h3 className="svg-graph-title">Revenue Trend (Last 6 Months)</h3>
            <svg
              viewBox="0 0 200 100"
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line
                x1="0"
                y1="20"
                x2="200"
                y2="20"
                stroke="rgba(212,175,55,0.1)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="50"
                x2="200"
                y2="50"
                stroke="rgba(212,175,55,0.1)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="80"
                x2="200"
                y2="80"
                stroke="rgba(212,175,55,0.1)"
                strokeWidth="1"
              />

              <polygon points={areaPoints} fill="url(#lineGrad)" />
              <polyline
                points={points}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Order Status Donut Chart */}
          <div className="svg-graph-box">
            <h3 className="svg-graph-title">Order Distribution</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                width: "100%",
              }}
            >
              <svg
                viewBox="0 0 100 100"
                style={{
                  width: "120px",
                  height: "120px",
                  transform: "rotate(-90deg)",
                }}
              >
                {donutSegments.map(
                  (seg) =>
                    seg.count > 0 && (
                      <circle
                        key={seg.key}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="16"
                        strokeDasharray={seg.strokeDasharray}
                        strokeDashoffset={seg.strokeDashoffset}
                      />
                    ),
                )}
              </svg>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {donutSegments.map((seg) => (
                  <div
                    key={seg.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: seg.color,
                      }}
                    ></span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {seg.key} ({Math.round(seg.percentage * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── CATEGORIES ─────────────────────────────────────────────────────────────
  const renderCategories = () => {
    const cats = [...new Set(books.map((b) => b.category))];
    const catCounts = cats.map((c) => ({
      name: c,
      count: books.filter((b) => b.category === c).length,
    }));
    return (
      <div className="section-body">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Category Management</h2>
            <p className="section-subtitle">{cats.length} active categories</p>
          </div>
        </div>
        <p className="hint-text">
          💡 Categories are derived from the book catalogue. Add a book with a
          new category to create it automatically.
        </p>
        <div className="cat-grid">
          {catCounts.map((c) => (
            <div key={c.name} className="cat-card">
              <span className="cat-card-name">{c.name}</span>
              <span className="cat-card-count">{c.count} books</span>
              <div className="cat-card-bar">
                <div
                  style={{
                    width: `${Math.min((c.count / books.length) * 100 * 3, 100)}%`,
                    background: "linear-gradient(90deg,#8B0000,#D4AF37)",
                    borderRadius: "4px",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── AUTHORS ────────────────────────────────────────────────────────────────
  const renderAuthors = () => (
    <div className="section-body animate-slide-up">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Manage Authors</h2>
          <p className="section-subtitle">
            {authors.length} authors in directory
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() =>
            setAuthorForm({
              mode: "add",
              data: {
                name: "",
                role: "",
                bio: "",
                imageUrl: "",
                timeline: "",
                quote: "",
                masterpiece: "",
              },
            })
          }
        >
          <span>＋</span> Add Author
        </button>
      </div>

      {authorForm && (
        <AuthorFormModal
          form={authorForm}
          onSave={handleSaveAuthor}
          onClose={() => setAuthorForm(null)}
        />
      )}

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Role/Genre</th>
              <th>Timeline</th>
              <th>Masterpiece</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuthors.map((a) => (
              <tr key={a.id} className="table-row">
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "1.5px solid #D4AF37",
                        background: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <img
                        src={
                          a.imageUrl ||
                          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100"
                        }
                        alt={a.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <span style={{ fontWeight: "600", color: "#f0e6d3" }}>
                      {a.name}
                    </span>
                  </div>
                </td>
                <td className="text-muted">{a.role}</td>
                <td className="text-muted mono" style={{ fontSize: "0.85rem" }}>
                  {a.timeline || "—"}
                </td>
                <td
                  className="text-gold"
                  style={{ fontSize: "0.9rem", fontWeight: "500" }}
                >
                  {a.masterpiece || "—"}
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="icon-btn edit"
                      onClick={() => setAuthorForm({ mode: "edit", data: a })}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteAuthor(a.id)}
                      title="Delete"
                    >
                      ⊗
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAuthors.length === 0 && (
          <div className="empty-state">No authors found</div>
        )}
      </div>
    </div>
  );

  // ── FAQS ───────────────────────────────────────────────────────────────────
  const renderFaqs = () => (
    <div className="section-body animate-slide-up">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Manage FAQs</h2>
          <p className="section-subtitle">{faqs.length} FAQs in catalog</p>
        </div>
        <button
          className="primary-btn"
          onClick={() =>
            setFaqForm({
              mode: "add",
              data: { question: "", answer: "", category: "CURATION" },
            })
          }
        >
          <span>＋</span> Add FAQ
        </button>
      </div>

      {faqForm && (
        <FaqFormModal
          form={faqForm}
          onSave={handleSaveFaq}
          onClose={() => setFaqForm(null)}
        />
      )}

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Question</th>
              <th style={{ width: "40%" }}>Answer</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaqs.map((f) => (
              <tr key={f.id} className="table-row">
                <td
                  style={{
                    fontWeight: "600",
                    color: "#f0e6d3",
                    whiteSpace: "normal",
                    verticalAlign: "top",
                    padding: "1rem",
                  }}
                >
                  {f.question}
                </td>
                <td
                  className="text-muted"
                  style={{
                    whiteSpace: "normal",
                    fontSize: "0.875rem",
                    verticalAlign: "top",
                    padding: "1rem",
                    lineHeight: "1.4",
                  }}
                >
                  {f.answer}
                </td>
                <td style={{ verticalAlign: "top", padding: "1rem" }}>
                  <span
                    className="cat-chip"
                    style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    {f.category}
                  </span>
                </td>
                <td style={{ verticalAlign: "top", padding: "1rem" }}>
                  <div className="action-btns">
                    <button
                      className="icon-btn edit"
                      onClick={() => setFaqForm({ mode: "edit", data: f })}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteFaq(f.id)}
                      title="Delete"
                    >
                      ⊗
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFaqs.length === 0 && (
          <div className="empty-state">No FAQs found</div>
        )}
      </div>
    </div>
  );

  const renderArticles = () => (
    <div className="section-body animate-slide-up">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Journal Articles</h2>
          <p className="section-subtitle">
            {articles.length} published articles
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() =>
            setArticleForm({
              mode: "add",
              data: {
                title: "",
                tag: "CURATION",
                readTime: "6 min read",
                excerpt: "",
                imageUrl: "",
                content: "",
              },
            })
          }
        >
          <span>＋</span> Write Article
        </button>
      </div>

      {articleForm && (
        <ArticleFormModal
          form={articleForm}
          onSave={handleSaveArticle}
          onClose={() => setArticleForm(null)}
        />
      )}

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Article Info</th>
              <th style={{ width: "45%" }}>Excerpt</th>
              <th>Tag</th>
              <th>Read Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((a) => (
              <tr key={a.id} className="table-row">
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "45px",
                        height: "45px",
                        borderRadius: "8px",
                        backgroundImage: `url(${a.imageUrl || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=150"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontWeight: "600",
                          color: "#f0e6d3",
                          fontSize: "0.875rem",
                        }}
                      >
                        {a.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#D4AF37",
                          marginTop: "2px",
                        }}
                      >
                        {a.date}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  className="text-muted"
                  style={{
                    whiteSpace: "normal",
                    fontSize: "0.825rem",
                    lineHeight: "1.4",
                  }}
                >
                  {a.excerpt}
                </td>
                <td>
                  <span
                    className="cat-chip"
                    style={{ fontSize: "0.725rem", letterSpacing: "0.05em" }}
                  >
                    {a.tag}
                  </span>
                </td>
                <td style={{ fontSize: "0.8rem", color: "#f0e6d3" }}>
                  {a.readTime}
                </td>
                <td>
                  <div className="action-btns">
                    <button
                      className="icon-btn edit"
                      onClick={() =>
                        setArticleForm({ mode: "edit", id: a.id, data: a })
                      }
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteArticle(a.id)}
                      title="Delete"
                    >
                      ⊗
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredArticles.length === 0 && (
          <div className="empty-state">No articles found</div>
        )}
      </div>
    </div>
  );

  const bookMap = useMemo(() => {
    const map = {};
    books.forEach((b) => {
      map[b.id] = b.title;
    });
    return map;
  }, [books]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const bTitle = bookMap[r.bookId] || "";
      return (
        r.userName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        r.comment?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        bTitle.toLowerCase().includes(globalSearch.toLowerCase())
      );
    });
  }, [reviews, globalSearch, bookMap]);

  const renderReviews = () => (
    <div className="section-container animate-fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">Book Reviews</h2>
          <p className="section-desc">
            Approve or remove user reviews submitted on the platform
          </p>
        </div>
      </div>

      <div className="table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Book</th>
              <th style={{ width: "20%" }}>User</th>
              <th style={{ width: "15%" }}>Rating</th>
              <th style={{ width: "25%" }}>Comment</th>
              <th style={{ width: "15%" }}>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((r) => (
              <tr key={r.id} className="table-row">
                <td>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#f0e6d3",
                      fontSize: "0.875rem",
                    }}
                  >
                    {bookMap[r.bookId] || r.bookId}
                  </span>
                </td>
                <td>
                  <span style={{ color: "#f0e6d3", fontSize: "0.875rem" }}>
                    {r.userName || r.userId}
                  </span>
                </td>
                <td>
                  <div
                    style={{
                      color: "#D4AF37",
                      fontSize: "0.875rem",
                      letterSpacing: "2px",
                    }}
                  >
                    {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                  </div>
                </td>
                <td
                  className="text-muted"
                  style={{
                    whiteSpace: "normal",
                    fontSize: "0.825rem",
                    lineHeight: "1.4",
                  }}
                >
                  <div>{r.comment}</div>
                  {r.isFlagged && (
                    <div style={{
                      marginTop: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ff6b6b',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      display: 'inline-block',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      ⚠️ Flagged: {r.moderationReason}
                    </div>
                  )}
                  {r.adminReply ? (
                    <div style={{
                      marginTop: '6px',
                      paddingLeft: '12px',
                      borderLeft: '2px solid #D4AF37',
                      color: '#D4AF37',
                      fontStyle: 'italic',
                      fontSize: '0.8rem'
                    }}>
                      ↳ Admin Reply: {r.adminReply}
                    </div>
                  ) : (
                    r.approved && (
                      <div style={{ marginTop: '8px' }}>
                        <button
                          onClick={() => {
                            const reply = window.prompt("Enter admin reply text:");
                            if (reply) handleReplyReview(r.id, reply);
                          }}
                          style={{
                            background: 'rgba(212,175,55,0.15)',
                            color: '#D4AF37',
                            border: '1px solid rgba(212,175,55,0.3)',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Reply
                        </button>
                      </div>
                    )
                  )}
                </td>
                <td>
                  {r.approved ? (
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: "rgba(52,211,153,0.15)",
                        color: "#34d399",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                      }}
                    >
                      Approved
                    </span>
                  ) : (
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: "rgba(212,175,55,0.15)",
                        color: "#D4AF37",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                      }}
                    >
                      Pending
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-btns" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {!r.approved && (
                      <button
                        className="icon-btn edit"
                        onClick={() => handleApproveReview(r.id)}
                        title="Approve"
                        style={{ fontSize: "1rem", color: "#34d399" }}
                      >
                        ✓
                      </button>
                    )}
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDeleteReview(r.id)}
                      title="Delete"
                    >
                      ⊗
                    </button>
                    {!r.isFlagged && (
                      <button
                        onClick={() => handleComplainReview(r.id)}
                        title="Flag/Complain"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Flag
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredReviews.length === 0 && (
          <div className="empty-state">No reviews found</div>
        )}
      </div>
    </div>
  );


  const sectionMap = {
    dashboard: renderDashboard,
    books:      renderBooks,
    authors:    renderAuthors,
    faqs:       renderFaqs,
    articles:   renderArticles,
    users:      renderUsers,
    orders:     renderOrders,
    reviews:    renderReviews,
    reports:    renderReports,
    categories: renderCategories,
  };

  return (
    <div
      className={`admin-layout ${sidebarOpen ? "" : "sidebar-collapsed"} ${isDarkMode ? "theme-dark" : "theme-light"}`}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-top">
          <div
            className="admin-logo"
            style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
          >
            <img
              src={logoImg}
              alt="Logo"
              style={{ height: "36px", width: "auto", objectFit: "contain" }}
            />
            <div className="logo-text">
              <p className="logo-title">Luxury Books</p>
              <p className="logo-sub">Admin Panel</p>
            </div>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            title="Toggle sidebar"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div className="sidebar-admin-badge">
          <div className="admin-av">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="admin-info">
            <p className="admin-name">{user?.name || "Admin"}</p>
            <p className="admin-role">Super Admin</p>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-group">
            <span className="nav-group-title">Analytics</span>
            {SECTIONS.filter((s) =>
              ["dashboard", "reports"].includes(s.id),
            ).map((s) => (
              <button
                key={s.id}
                className={`nav-item ${activeSection === s.id ? "active" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="nav-icon">{s.icon}</span>
                <span className="nav-label">{s.label}</span>
                {activeSection === s.id && <span className="nav-indicator" />}
              </button>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Inventory</span>
            {SECTIONS.filter((s) => ["books", "categories"].includes(s.id)).map(
              (s) => (
                <button
                  key={s.id}
                  className={`nav-item ${activeSection === s.id ? "active" : ""}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <span className="nav-icon">{s.icon}</span>
                  <span className="nav-label">{s.label}</span>
                  {activeSection === s.id && <span className="nav-indicator" />}
                </button>
              ),
            )}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Directory</span>
            {SECTIONS.filter((s) =>
              ["authors", "faqs", "articles"].includes(s.id),
            ).map((s) => (
              <button
                key={s.id}
                className={`nav-item ${activeSection === s.id ? "active" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="nav-icon">{s.icon}</span>
                <span className="nav-label">{s.label}</span>
                {activeSection === s.id && <span className="nav-indicator" />}
              </button>
            ))}
          </div>

          <div className="nav-group">
            <span className="nav-group-title">Operations</span>
            {SECTIONS.filter((s) =>
              ["users", "orders", "reviews"].includes(s.id),
            ).map((s) => (
              <button
                key={s.id}
                className={`nav-item ${activeSection === s.id ? "active" : ""}`}
                onClick={() => setActiveSection(s.id)}
              >
                <span className="nav-icon">{s.icon}</span>
                <span className="nav-label">{s.label}</span>
                {activeSection === s.id && <span className="nav-indicator" />}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button
            className="footer-btn view-site"
            onClick={() => navigate("/")}
          >
            <span>🌐</span>
            <span>View Site</span>
          </button>
          <button
            className="footer-btn logout"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <span>⎋</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-section">
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <span>🔍</span>
              <input
                placeholder="Search anything…"
                className="topbar-search-input"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>

            <button
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            <div className="topbar-user">
              <div className="topbar-av">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {loading ? (
            <div className="loading-screen">
              <div className="loading-spinner" />
              <p>Loading data…</p>
            </div>
          ) : (
            (sectionMap[activeSection] || (() => <p>Coming soon…</p>))()
          )}
        </div>
      </main>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`admin-toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}
        >
          <span>{toast.type === "error" ? "⚠" : "✓"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// ── Book Form Modal ────────────────────────────────────────────────────────────
function BookFormModal({ form, onSave, onClose }) {
  const [data, setData] = useState({ ...form.data });

  const fields = [
    { key: "title", label: "Title", type: "text", span: 2 },
    { key: "author", label: "Author", type: "text", span: 2 },
    { key: "price", label: "Price ($)", type: "number", span: 1 },
    { key: "originalPrice", label: "Original Price", type: "number", span: 1 },
    { key: "category", label: "Category", type: "text", span: 1 },
    { key: "stock", label: "Stock", type: "number", span: 1 },
    { key: "pages", label: "Pages", type: "number", span: 1 },
    { key: "year", label: "Year", type: "number", span: 1 },
    { key: "image", label: "Emoji Icon", type: "text", span: 1 },
    { key: "description", label: "Description", type: "text", span: 3 },
  ];

  if (data.isPdf) {
    fields.push({
      key: "pdfUrl",
      label: "PDF URL / Path",
      type: "text",
      span: 3,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{form.mode === "add" ? "＋ Add New Book" : "✎ Edit Book"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            {fields.map((f) => (
              <div
                key={f.key}
                className="modal-field"
                style={{ gridColumn: `span ${f.span}` }}
              >
                <label className="modal-label">{f.label}</label>
                <input
                  className="modal-input"
                  type={f.type}
                  value={data[f.key] || ""}
                  onChange={(e) =>
                    setData((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  placeholder={f.label}
                />
              </div>
            ))}
            <div className="modal-field modal-checks">
              <label className="modal-check-label">
                <input
                  type="checkbox"
                  checked={!!data.isNew}
                  onChange={(e) =>
                    setData((p) => ({ ...p, isNew: e.target.checked }))
                  }
                />
                New Release
              </label>
              <label className="modal-check-label">
                <input
                  type="checkbox"
                  checked={!!data.isBestseller}
                  onChange={(e) =>
                    setData((p) => ({ ...p, isBestseller: e.target.checked }))
                  }
                />
                Bestseller
              </label>
              <label className="modal-check-label">
                <input
                  type="checkbox"
                  checked={!!data.isPdf}
                  onChange={(e) =>
                    setData((p) => ({ ...p, isPdf: e.target.checked }))
                  }
                />
                PDF Book
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-save-btn" onClick={() => onSave(data)}>
            {form.mode === "add" ? "＋ Add Book" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Author Form Modal ──────────────────────────────────────────────────────────
function AuthorFormModal({ form, onSave, onClose }) {
  const [data, setData] = useState({ ...form.data });

  const fields = [
    { key: "name", label: "Author Name", type: "text", span: 2 },
    { key: "role", label: "Genre / Role", type: "text", span: 2 },
    { key: "timeline", label: "Life Timeline", type: "text", span: 2 },
    { key: "masterpiece", label: "Masterpiece", type: "text", span: 2 },
    { key: "imageUrl", label: "Portrait Image URL", type: "text", span: 4 },
    { key: "quote", label: "Inspirational Quote", type: "textarea", span: 4 },
    { key: "bio", label: "Full Biography", type: "textarea", span: 4 },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{form.mode === "add" ? "＋ Add New Author" : "✎ Edit Author"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div
            className="modal-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
            }}
          >
            {fields.map((f) => (
              <div
                key={f.key}
                className="modal-field"
                style={{ gridColumn: `span ${f.span}` }}
              >
                <label className="modal-label">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    className="modal-input"
                    rows={f.key === "bio" ? 5 : 2}
                    value={data[f.key] || ""}
                    onChange={(e) =>
                      setData((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder={f.label}
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      borderRadius: "6px",
                      padding: "0.5rem",
                      color: "#f0e6d3",
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <input
                    className="modal-input"
                    type={f.type}
                    value={data[f.key] || ""}
                    onChange={(e) =>
                      setData((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    placeholder={f.label}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-save-btn" onClick={() => onSave(data)}>
            {form.mode === "add" ? "＋ Add Author" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FAQ Form Modal ─────────────────────────────────────────────────────────────
function FaqFormModal({ form, onSave, onClose }) {
  const [data, setData] = useState({ ...form.data });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{form.mode === "add" ? "＋ Add New FAQ" : "✎ Edit FAQ"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="modal-field">
              <label className="modal-label">Question</label>
              <input
                className="modal-input"
                type="text"
                value={data.question || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, question: e.target.value }))
                }
                placeholder="Question text"
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Category</label>
              <select
                value={data.category || "CURATION"}
                onChange={(e) =>
                  setData((p) => ({ ...p, category: e.target.value }))
                }
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#f0e6d3",
                  outline: "none",
                }}
              >
                <option value="CURATION">Curation</option>
                <option value="SHIPPING">Shipping</option>
                <option value="ACQUISITIONS">Acquisitions</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Answer</label>
              <textarea
                className="modal-input"
                rows={5}
                value={data.answer || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, answer: e.target.value }))
                }
                placeholder="Answer text"
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#f0e6d3",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-save-btn" onClick={() => onSave(data)}>
            {form.mode === "add" ? "＋ Add FAQ" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleFormModal({ form, onSave, onClose }) {
  const [data, setData] = useState(form.data);

  return (
    <div className="admin-modal-overlay">
      <div
        className="admin-modal-card gold-glow-border animate-scale-up"
        style={{ maxWidth: "650px" }}
      >
        <div className="modal-header">
          <h3>
            {form.mode === "add"
              ? "Publish Journal Article"
              : "Edit Journal Article"}
          </h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div
          className="modal-scroll-body"
          style={{ maxHeight: "70vh", overflowY: "auto", padding: "1.5rem" }}
        >
          <div
            className="modal-form-grid"
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div className="modal-field">
              <label className="modal-label">Article Title *</label>
              <input
                className="modal-input"
                type="text"
                value={data.title || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. The Art of Identifying True First Editions"
                style={{ width: "100%" }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="modal-field">
                <label className="modal-label">Tag (Category)</label>
                <select
                  className="modal-input"
                  value={data.tag || "CURATION"}
                  onChange={(e) =>
                    setData((p) => ({ ...p, tag: e.target.value }))
                  }
                  style={{ width: "100%" }}
                >
                  <option value="CURATION">CURATION</option>
                  <option value="CONSERVATION">CONSERVATION</option>
                  <option value="CRAFTSMANSHIP">CRAFTSMANSHIP</option>
                  <option value="COLLECTING">COLLECTING</option>
                  <option value="HISTORY">HISTORY</option>
                  <option value="LIFESTYLE">LIFESTYLE</option>
                </select>
              </div>

              <div className="modal-field">
                <label className="modal-label">Read Time</label>
                <input
                  className="modal-input"
                  type="text"
                  value={data.readTime || "6 min read"}
                  onChange={(e) =>
                    setData((p) => ({ ...p, readTime: e.target.value }))
                  }
                  placeholder="e.g. 6 min read"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Image URL</label>
              <input
                className="modal-input"
                type="text"
                value={data.imageUrl || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, imageUrl: e.target.value }))
                }
                placeholder="https://images.unsplash.com/..."
                style={{ width: "100%" }}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Excerpt / Short Summary *</label>
              <input
                className="modal-input"
                type="text"
                value={data.excerpt || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, excerpt: e.target.value }))
                }
                placeholder="A brief summary showing up on catalog list..."
                style={{ width: "100%" }}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Article Body Content *</label>
              <textarea
                className="modal-input"
                rows={10}
                value={data.content || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Write full article body paragraphs here..."
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                  borderRadius: "6px",
                  padding: "0.5rem",
                  color: "#f0e6d3",
                  outline: "none",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="modal-save-btn"
            onClick={() => onSave({ ...form, data })}
          >
            {form.mode === "add" ? "＋ Publish" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

