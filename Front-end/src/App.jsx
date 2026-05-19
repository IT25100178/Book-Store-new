// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { CartProvider }  from './context/CartContext';
import '../src/assets/App.css';

import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import CustomCursor from './components/ui/CustomCursor';

// ── Auth (Member 1 – Athethan) ─────────────────────────────────────────────
import Login          from './components/auth/Login';
import Register       from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';

// ── Home (Member 1 – Athethan) ─────────────────────────────────────────────
import Home           from './components/home/Home';

// ── Books (Member 2 – Deepika) ─────────────────────────────────────────────
import BookListPage   from './components/books/BookListPage';

// ── Book Details (Member 3 – Yuvaniya) ────────────────────────────────────
import BookDetailsPage from './components/bookdetails/BookDetailsPage';

// ── Cart (Member 4 – Lojeni) ──────────────────────────────────────────────
import CartPage       from './components/cart/CartPage';

// ── Checkout (Member 5 – Vishnu) ──────────────────────────────────────────
import CheckoutPage      from './components/checkout/CheckoutPage';
import OrderConfirmation from './components/checkout/OrderConfirmation';

// ── Profile (Member 6 – Vishok) ───────────────────────────────────────────
import UserProfilePage from './components/profile/UserProfilePage';

// ── Admin (Member 7 – Vishahan) ───────────────────────────────────────────
import AdminDashboard from './components/admin/AdminDashboard';

// ── Contact & About (Members 8 & 9) ───────────────────────────────────────
import ContactUs from './components/contact/ContactUs';
import AboutUs from './components/about/AboutUs';

// ── Additional Pages ──────────────────────────────────────────────────────
import AuthorsDirectory from './components/pages/AuthorsDirectory';
import JournalPage from './components/pages/JournalPage';
import FAQPage from './components/pages/FAQPage';
import ReturnsPolicy from './components/pages/ReturnsPolicy';
import TermsOfService from './components/pages/TermsOfService';

// ── Guards ────────────────────────────────────────────────────────────────
import ProtectedRoute from './components/shared/ProtectedRoute';
import AdminRoute     from './components/shared/AdminRoute';
import PageLoader     from './components/shared/PageLoader';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <>
      <PageLoader />
      <div key={location.pathname} className="page-transition-wrapper">
        <Routes location={location}>
        {/* ── Public Routes ── */}
        <Route path="/"                  element={<Home />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/forgot-password"   element={<ForgotPassword />} />
        <Route path="/contact"           element={<ContactUs />} />
        <Route path="/about"             element={<AboutUs />} />
        
        {/* ── Additional Pages ── */}
        <Route path="/authors"           element={<AuthorsDirectory />} />
        <Route path="/journal"           element={<JournalPage />} />
        <Route path="/faq"               element={<FAQPage />} />
        <Route path="/returns"           element={<ReturnsPolicy />} />
        <Route path="/terms"             element={<TermsOfService />} />

        {/* ── Book Catalogue ── */}
        <Route path="/books"             element={<BookListPage />} />
        <Route path="/books/:id"         element={<BookDetailsPage />} />

        {/* ── Protected User Routes ── */}
        <Route path="/cart"              element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/checkout"          element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/profile"           element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />

        {/* ── Admin Routes ── */}
        <Route path="/admin"             element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* ── Fallback ── */}
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CustomCursor />
          <div className="App">
            <Navbar />
            <main className="main-content">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
