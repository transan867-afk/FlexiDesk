import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BookingProvider } from './context/BookingContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { CafesPage } from './pages/CafesPage';
import { CafeDetailPage } from './pages/CafeDetailPage';
import { BookingPage } from './pages/BookingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { AccountBookingsPage } from './pages/AccountBookingsPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PartnerDashboardPage } from './pages/PartnerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Layout controller: hides public navbar & footer on POS and Admin screens for full-screen focus
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/partner/dashboard') || location.pathname.startsWith('/admin/dashboard');

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF2F4] text-[#2E1A12] font-sans pb-16 md:pb-0">
      {!isDashboard && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isDashboard && <Footer />}
      {!isDashboard && <MobileBottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <BookingProvider>
              <ScrollToTop />
              <AppLayout>
                <Routes>
                  {/* Public Customer Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cafes" element={<CafesPage />} />
                  <Route path="/cafes/:id" element={<CafeDetailPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/booking/success/:id" element={<BookingSuccessPage />} />
                  <Route path="/account/bookings" element={<AccountBookingsPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Dashboards for Partner & Admin */}
                  <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AppLayout>
            </BookingProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
