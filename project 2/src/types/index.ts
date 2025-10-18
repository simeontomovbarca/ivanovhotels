export interface Hotel {
  id: string
  name: string
  slug: string
  description: string
  address: string
  image_url: string | null
  amenities: string[]
  created_at: string
}

export interface Room {
  id: string
  hotel_id: string
  room_number: string
  room_type: string
  capacity: number
  price_per_night: number
  description: string | null
  amenities: string[]
  image_url: string | null
  created_at: string
}

export interface Booking {
  id: string
  room_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  stripe_payment_id: string | null
  created_at: string
}

export interface SearchParams {
  hotelId?: string
  checkIn: string
  checkOut: string
  guests: number
}
