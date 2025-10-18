import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { format } from 'date-fns'
import './BookingConfirmationPage.css'

export default function BookingConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  useEffect(() => {
    if (!state || !state.booking) {
      navigate('/')
    }
  }, [state, navigate])

  if (!state || !state.booking) {
    return null
  }

  const { booking, room, hotel, totalPrice } = state

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>
          <h1>Резервацията е Успешна!</h1>
          <p className="confirmation-message">
            Вашата резервация беше регистрирана успешно. Ще получите потвърждение на посочения имейл адрес.
          </p>

          <div className="booking-details">
            <h2>Детайли на резервацията</h2>

            <div className="detail-row">
              <span className="detail-label">Номер на резервация:</span>
              <span className="detail-value">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Хотел:</span>
              <span className="detail-value">{hotel.name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Стая:</span>
              <span className="detail-value">{room.room_number}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Настаняване:</span>
              <span className="detail-value">{format(new Date(booking.check_in), 'dd.MM.yyyy')}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Напускане:</span>
              <span className="detail-value">{format(new Date(booking.check_out), 'dd.MM.yyyy')}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Име на гост:</span>
              <span className="detail-value">{booking.guest_name}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Имейл:</span>
              <span className="detail-value">{booking.guest_email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">Телефон:</span>
              <span className="detail-value">{booking.guest_phone}</span>
            </div>

            <div className="detail-row total-row">
              <span className="detail-label">Обща сума:</span>
              <span className="detail-value">{totalPrice} лв</span>
            </div>
          </div>

          <div className="next-steps">
            <h3>Следващи стъпки</h3>
            <ul>
              <li>Ще получите имейл с потвърждение на резервацията</li>
              <li>Плащането ще бъде обработено чрез Stripe</li>
              <li>При въпроси, свържете се с нас на посочените контакти</li>
            </ul>
          </div>

          <div className="action-buttons">
            <Link to="/" className="btn-primary">
              Начална страница
            </Link>
            <Link to={`/hotels/${hotel.slug}`} className="btn-secondary">
              Обратно към {hotel.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
