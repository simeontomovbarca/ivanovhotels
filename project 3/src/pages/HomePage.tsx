import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Hotel } from '../types'
import './HomePage.css'

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHotels() {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching hotels:', error)
      } else {
        setHotels(data as Hotel[])
      }
      setLoading(false)
    }

    fetchHotels()
  }, [])

  if (loading) {
    return <div className="loading">Зареждане...</div>
  }

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Открийте Вашия Перфектен Престой</h1>
          <p className="hero-subtitle">
            Три уникални хотела, едно незабравимо преживяване
          </p>
          <a href="#hotels" className="hero-cta">
            Разгледайте Хотелите
          </a>
        </div>
      </section>

      <section id="hotels" className="hotels-section">
        <div className="container">
          <div className="section-header">
            <h2>Нашите Хотели</h2>
            <p>Изберете сред три луксозни семейни хотела, всеки с уникален характер и топло гостоприемство</p>
          </div>

          <div className="hotels-grid">
            {hotels.map((hotel) => (
              <Link to={`/hotels/${hotel.slug}`} key={hotel.id} className="hotel-card">
                <div className="hotel-image">
                  <img
                    src={hotel.image_url || 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                    alt={hotel.name}
                  />
                  <div className="hotel-overlay"></div>
                </div>
                <div className="hotel-info">
                  <h3>{hotel.name}</h3>
                  <p className="hotel-description">{hotel.description}</p>
                  <div className="hotel-amenities">
                    {(hotel.amenities as string[]).slice(0, 3).map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                  <div className="hotel-cta">
                    Разгледайте повече
                    <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🏨</div>
              <h3>36 Луксозни Стаи</h3>
              <p>Всеки хотел предлага 12 обзаведени стаи с модерни удобства</p>
            </div>
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <h3>Персонализирано Обслужване</h3>
              <p>Семейна атмосфера и внимание към всеки детайл</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📅</div>
              <h3>Лесна Резервация</h3>
              <p>Резервирайте онлайн със сигурно плащане</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
