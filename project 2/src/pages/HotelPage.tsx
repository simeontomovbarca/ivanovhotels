import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Hotel, Room } from '../types'
import SearchBox from '../components/SearchBox'
import './HotelPage.css'

interface AvailableRoom extends Room {
  isAvailable: boolean
}

export default function HotelPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<AvailableRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<{checkIn: string, checkOut: string, guests: number} | null>(null)

  useEffect(() => {
    async function fetchHotelData() {
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('*')
        .eq('slug', slug || '')
        .maybeSingle()

      if (hotelError || !hotelData) {
        console.error('Error fetching hotel:', hotelError)
        navigate('/')
        return
      }

      setHotel(hotelData as Hotel)

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('hotel_id', (hotelData as { id: string }).id)
        .order('room_type')

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError)
      } else {
        setRooms(roomsData.map(room => ({ ...room as Room, isAvailable: true })))
      }

      setLoading(false)
    }

    fetchHotelData()
  }, [slug, navigate])

  const handleSearch = async (checkIn: string, checkOut: string, guests: number) => {
    setSearchParams({ checkIn, checkOut, guests })

    if (!hotel) return

    const { data: bookingsData, error } = await supabase
      .from('bookings')
      .select('room_id')
      .gte('check_out', checkIn)
      .lte('check_in', checkOut)
      .in('status', ['pending', 'confirmed'])

    if (error) {
      console.error('Error checking availability:', error)
      return
    }

    const bookedRoomIds = new Set((bookingsData || []).map((b: { room_id: string }) => b.room_id))

    const { data: allRooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotel.id)
      .gte('capacity', guests)
      .order('price_per_night')

    if (allRooms) {
      const availableRooms = allRooms.map((room: { id: string }) => ({
        ...room as Room,
        isAvailable: !bookedRoomIds.has(room.id)
      }))
      setRooms(availableRooms)
    }
  }

  const handleBookRoom = (room: Room) => {
    if (!searchParams) {
      alert('Моля, първо изберете дати за вашия престой')
      return
    }
    navigate('/booking', {
      state: {
        room,
        hotel,
        ...searchParams
      }
    })
  }

  if (loading) {
    return <div className="loading">Зареждане...</div>
  }

  if (!hotel) {
    return <div className="loading">Хотелът не е намерен</div>
  }

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'standard': return 'Стандартна'
      case 'deluxe': return 'Делукс'
      case 'suite': return 'Апартамент'
      default: return type
    }
  }

  return (
    <div className="hotel-page">
      <section className="hotel-hero" style={{
        backgroundImage: `url(${hotel.image_url || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1920'})`
      }}>
        <div className="hotel-hero-overlay"></div>
        <div className="hotel-hero-content">
          <h1>{hotel.name}</h1>
          <p>{hotel.description}</p>
        </div>
      </section>

      <div className="container">
        <SearchBox hotelId={hotel.id} onSearch={handleSearch} />

        <section className="hotel-details">
          <div className="hotel-info-section">
            <h2>За Хотела</h2>
            <p className="address">📍 {hotel.address}</p>
            <div className="amenities-list">
              <h3>Удобства</h3>
              <ul>
                {(hotel.amenities as string[]).map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rooms-section">
          <h2>
            {searchParams
              ? `Налични Стаи (${rooms.filter(r => r.isAvailable).length} от ${rooms.length})`
              : 'Нашите Стаи'
            }
          </h2>

          {searchParams && rooms.filter(r => r.isAvailable).length === 0 && (
            <div className="no-rooms">
              <p>Няма налични стаи за избраните дати. Моля, изберете други дати.</p>
            </div>
          )}

          <div className="rooms-grid">
            {rooms
              .filter(room => !searchParams || room.isAvailable)
              .map((room) => (
              <div key={room.id} className={`room-card ${!room.isAvailable ? 'unavailable' : ''}`}>
                <div className="room-image">
                  <img
                    src={room.image_url || `https://images.pexels.com/photos/${room.room_type === 'suite' ? '1743229' : room.room_type === 'deluxe' ? '271618' : '271624'}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800`}
                    alt={room.room_number}
                  />
                  {!room.isAvailable && searchParams && (
                    <div className="unavailable-badge">Заета</div>
                  )}
                </div>
                <div className="room-info">
                  <div className="room-header">
                    <h3>{room.room_number}</h3>
                    <span className="room-type">{getRoomTypeLabel(room.room_type)}</span>
                  </div>
                  <p className="room-description">{room.description}</p>
                  <div className="room-amenities">
                    {(room.amenities as string[]).slice(0, 4).map((amenity, index) => (
                      <span key={index} className="amenity">{amenity}</span>
                    ))}
                  </div>
                  <div className="room-footer">
                    <div className="room-capacity">👥 До {room.capacity} гости</div>
                    <div className="room-price">
                      {room.price_per_night} лв<span>/нощувка</span>
                    </div>
                  </div>
                  {room.isAvailable && (
                    <button
                      className="book-btn"
                      onClick={() => handleBookRoom(room)}
                    >
                      Резервирай
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
