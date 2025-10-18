import { useState } from 'react'
import { format } from 'date-fns'
import './SearchBox.css'

interface SearchBoxProps {
  hotelId?: string
  onSearch: (checkIn: string, checkOut: string, guests: number) => void
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')

  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [guests, setGuests] = useState(2)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(checkIn, checkOut, guests)
  }

  return (
    <div className="search-box">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="check-in">Настаняване</label>
          <input
            type="date"
            id="check-in"
            value={checkIn}
            min={today}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="check-out">Напускане</label>
          <input
            type="date"
            id="check-out"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="guests">Гости</label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          >
            <option value="1">1 гост</option>
            <option value="2">2 гости</option>
            <option value="3">3 гости</option>
            <option value="4">4 гости</option>
          </select>
        </div>

        <button type="submit" className="search-btn">
          Търси Стаи
        </button>
      </form>
    </div>
  )
}
