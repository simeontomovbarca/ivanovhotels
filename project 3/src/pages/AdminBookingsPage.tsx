import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { bg } from 'date-fns/locale';
import './AdminBookingsPage.css';

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_price: number;
  created_at: string;
  rooms: {
    room_number: string;
    room_type: string;
    hotels: {
      name: string;
    };
  };
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);

    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, room_type, hotels(name))')
      .order('check_in', { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }

    setLoading(false);
  }

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];

    if (filterStatus === 'upcoming') {
      return bookings.filter(b => b.check_in >= today);
    } else if (filterStatus === 'past') {
      return bookings.filter(b => b.check_out < today);
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return <div className="admin-loading">Зареждане...</div>;
  }

  return (
    <div className="admin-bookings-page">
      <h2>Резервации</h2>

      <div className="filter-tabs">
        <button
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          Всички ({bookings.length})
        </button>
        <button
          className={filterStatus === 'upcoming' ? 'active' : ''}
          onClick={() => setFilterStatus('upcoming')}
        >
          Предстоящи ({bookings.filter(b => b.check_in >= new Date().toISOString().split('T')[0]).length})
        </button>
        <button
          className={filterStatus === 'past' ? 'active' : ''}
          onClick={() => setFilterStatus('past')}
        >
          Минали ({bookings.filter(b => b.check_out < new Date().toISOString().split('T')[0]).length})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">Няма резервации</div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Хотел</th>
                <th>Стая</th>
                <th>Гост</th>
                <th>Контакти</th>
                <th>Настаняване</th>
                <th>Напускане</th>
                <th>Цена</th>
                <th>Дата на резервация</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.rooms.hotels.name}</td>
                  <td>{booking.rooms.room_number}</td>
                  <td>{booking.guest_name}</td>
                  <td>
                    <div className="contact-info">
                      <div>{booking.guest_email}</div>
                      <div>{booking.guest_phone}</div>
                    </div>
                  </td>
                  <td>{format(new Date(booking.check_in), 'd MMM yyyy', { locale: bg })}</td>
                  <td>{format(new Date(booking.check_out), 'd MMM yyyy', { locale: bg })}</td>
                  <td className="price">{booking.total_price} лв</td>
                  <td>{format(new Date(booking.created_at), 'd MMM yyyy, HH:mm', { locale: bg })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
