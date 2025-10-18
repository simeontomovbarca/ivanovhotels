export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hotels: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          address: string
          image_url: string | null
          amenities: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          address: string
          image_url?: string | null
          amenities?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          address?: string
          image_url?: string | null
          amenities?: Json
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          hotel_id: string
          room_number: string
          room_type: string
          capacity: number
          price_per_night: number
          description: string | null
          amenities: Json
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_number: string
          room_type?: string
          capacity?: number
          price_per_night: number
          description?: string | null
          amenities?: Json
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_number?: string
          room_type?: string
          capacity?: number
          price_per_night?: number
          description?: string | null
          amenities?: Json
          image_url?: string | null
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone: string
          check_in: string
          check_out: string
          total_price: number
          status: string
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone: string
          check_in: string
          check_out: string
          total_price: number
          status?: string
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          check_in?: string
          check_out?: string
          total_price?: number
          status?: string
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
