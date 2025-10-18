import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Hotel, Room } from '../types'
import type { Database } from '../types/database'
import { differenceInDays, format } from 'date-fns'
import './BookingPage.css'

interface LocationState {
  room: Room
  hotel: Hotel
  checkIn: string
  checkOut: string
  guests: number
}

export default function BookingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState

  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!state || !state.room || !state.hotel) {
    navigate('/')
    return null
  }

  const { room, hotel, checkIn, checkOut, guests } = state
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn))
  const totalPrice = nights * room.price_per_night

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const bookingData: Database['public']['Tables']['bookings']['Insert'] = {
      room_id: room.id,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      check_in: checkIn,
      check_out: checkOut,
      total_price: totalPrice,
      status: 'pending'
    }

    const { data, error: bookingError } = await (supabase
      .from('bookings')
      .insert(bookingData as any)
      .select()
      .single() as any)

    if (bookingError) {
      console.error('Booking error:', bookingError)
      if (bookingError.message.includes('already booked')) {
        setError('Тази стая вече е резервирана за избраните дати. Моля, изберете други дати.')
      } else {
        setError('Възникна грешка при резервацията. Моля, опитайте отново.')
      }
      setLoading(false)
      return
    }

    if (data) {
      try {
        const emailApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-booking-email`;
        await fetch(emailApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: guestEmail,
            guestName: guestName,
            hotelName: hotel.name,
            roomType: room.room_type,
            checkIn: format(new Date(checkIn), 'dd.MM.yyyy'),
            checkOut: format(new Date(checkOut), 'dd.MM.yyyy'),
            totalPrice: totalPrice,
            bookingId: data.id,
          }),
        });
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    navigate('/booking-confirmation', {
      state: {
        booking: data,
        room,
        hotel,
        totalPrice
      }
    })
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-container">
          <div className="booking-summary">
            <h2>Резервация</h2>

            <div className="summary-section">
              <h3>{hotel.name}</h3>
              <p className="room-name">{room.room_number} - {room.room_type}</p>
            </div>

            <div className="summary-section">
              <div className="summary-row">
                <span>Настаняване:</span>
                <strong>{format(new Date(checkIn), 'dd.MM.yyyy')}</strong>
              </div>
              <div className="summary-row">
                <span>Напускане:</span>
                <strong>{format(new Date(checkOut), 'dd.MM.yyyy')}</strong>
              </div>
              <div className="summary-row">
                <span>Нощувки:</span>
                <strong>{nights}</strong>
              </div>
              <div className="summary-row">
                <span>Гости:</span>
                <strong>{guests}</strong>
              </div>
            </div>

            <div className="summary-section">
              <div className="summary-row">
                <span>Цена за нощувка:</span>
                <span>{room.price_per_night} лв</span>
              </div>
              <div className="summary-row total">
                <span>Общо:</span>
                <strong>{totalPrice} лв</strong>
              </div>
            </div>

            <div className="payment-info">
              <h4>Плащане</h4>
              <p>Плащането ще бъде обработено чрез Stripe при потвърждаване на резервацията.</p>
            </div>
          </div>

          <div className="booking-form-container">
            <h2>Данни за контакт</h2>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-field">
                <label htmlFor="name">Име и Фамилия *</label>
                <input
                  type="text"
                  id="name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  placeholder="Иван Иванов"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">Имейл *</label>
                <input
                  type="email"
                  id="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  placeholder="ivan@example.com"
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone">Телефон *</label>
                <input
                  type="tel"
                  id="phone"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  placeholder="+359 888 123 456"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Обработка...' : 'Потвърди Резервация'}
              </button>

              <p className="form-note">
                * Всички полета са задължителни. Ще получите потвърждение на посочения имейл.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
