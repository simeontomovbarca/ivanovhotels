import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import HotelPage from './pages/HotelPage'
import BookingPage from './pages/BookingPage'
import BookingConfirmationPage from './pages/BookingConfirmationPage'
import LoginPage from './pages/LoginPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import AdminLayout from './components/AdminLayout'
import AdminHotelsPage from './pages/AdminHotelsPage'
import AdminRoomsPage from './pages/AdminRoomsPage'
import AdminBookingsPage from './pages/AdminBookingsPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/bookings" replace />} />
            <Route path="hotels" element={<AdminHotelsPage />} />
            <Route path="rooms" element={<AdminRoomsPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
          </Route>

          <Route path="*" element={
            <div className="app">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/hotels/:slug" element={<HotelPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
