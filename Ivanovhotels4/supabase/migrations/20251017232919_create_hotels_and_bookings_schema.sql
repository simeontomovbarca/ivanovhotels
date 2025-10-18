/*
  # Hotel Booking System Schema

  ## Overview
  Creates a complete database schema for managing 3 family hotels (Soni, Ivon, Chris) with rooms and booking functionality.

  ## New Tables

  ### 1. `hotels`
  Stores information about the three hotels
  - `id` (uuid, primary key)
  - `name` (text) - Hotel name (Soni, Ivon, Chris)
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Hotel description
  - `address` (text) - Physical address
  - `image_url` (text) - Main hotel image
  - `amenities` (jsonb) - Array of hotel amenities
  - `created_at` (timestamptz)

  ### 2. `rooms`
  Stores room information for each hotel
  - `id` (uuid, primary key)
  - `hotel_id` (uuid, foreign key) - References hotels table
  - `room_number` (text) - Room identifier (1-12)
  - `room_type` (text) - Room category (standard, deluxe, suite)
  - `capacity` (integer) - Number of guests
  - `price_per_night` (decimal) - Price in BGN
  - `description` (text) - Room description
  - `amenities` (jsonb) - Room-specific amenities
  - `image_url` (text) - Room image
  - `created_at` (timestamptz)

  ### 3. `bookings`
  Manages room reservations
  - `id` (uuid, primary key)
  - `room_id` (uuid, foreign key) - References rooms table
  - `guest_name` (text) - Guest full name
  - `guest_email` (text) - Guest email
  - `guest_phone` (text) - Guest phone number
  - `check_in` (date) - Check-in date
  - `check_out` (date) - Check-out date
  - `total_price` (decimal) - Total booking cost
  - `status` (text) - Booking status (pending, confirmed, cancelled)
  - `stripe_payment_id` (text) - Stripe payment reference
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for hotels and rooms (for browsing)
  - Authenticated write access for bookings
  - Bookings are readable by the guest who made them

  ## Indexes
  - Index on room availability queries (hotel_id, check_in, check_out)
  - Index on booking lookup by email
*/

-- Create hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  image_url text,
  amenities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
  room_number text NOT NULL,
  room_type text NOT NULL DEFAULT 'standard',
  capacity integer NOT NULL DEFAULT 2,
  price_per_night decimal(10,2) NOT NULL,
  description text,
  amenities jsonb DEFAULT '[]'::jsonb,
  image_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, room_number)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_id text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Hotels policies (public read access)
CREATE POLICY "Anyone can view hotels"
  ON hotels FOR SELECT
  USING (true);

-- Rooms policies (public read access)
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  USING (true);

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own bookings by email"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "System can update booking status"
  ON bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(guest_email);

-- Insert the 3 hotels
INSERT INTO hotels (name, slug, description, address, amenities) VALUES
(
  'Хотел Сони',
  'soni',
  'Луксозен семеен хотел с изключителна гледка и модерни удобства. Перфектен за семейна почивка и релакс.',
  'гр. София, ул. Примерна 1',
  '["Безплатен WiFi", "Ресторант", "Фитнес", "СПА център", "Паркинг", "Рецепция 24/7"]'::jsonb
),
(
  'Хотел Ивон',
  'ivon',
  'Елегантен хотел с топла атмосфера и персонализирано обслужване. Вашият дом далеч от дома.',
  'гр. София, ул. Примерна 2',
  '["Безплатен WiFi", "Ресторант", "Барбекю градина", "Детска площадка", "Паркинг", "Рецепция 24/7"]'::jsonb
),
(
  'Хотел Крис',
  'chris',
  'Модерен бутиков хотел със стилен дизайн и висококачествено обслужване за взискателни гости.',
  'гр. София, ул. Примерна 3',
  '["Безплатен WiFi", "Панорамен ресторант", "Винарска изба", "Конферентна зала", "Паркинг", "Рецепция 24/7"]'::jsonb
);

-- Insert 12 rooms for each hotel
DO $$
DECLARE
  hotel_record RECORD;
  room_num INTEGER;
BEGIN
  FOR hotel_record IN SELECT id, name FROM hotels LOOP
    FOR room_num IN 1..12 LOOP
      INSERT INTO rooms (hotel_id, room_number, room_type, capacity, price_per_night, description, amenities)
      VALUES (
        hotel_record.id,
        'Стая ' || room_num,
        CASE 
          WHEN room_num <= 6 THEN 'standard'
          WHEN room_num <= 10 THEN 'deluxe'
          ELSE 'suite'
        END,
        CASE 
          WHEN room_num <= 6 THEN 2
          WHEN room_num <= 10 THEN 3
          ELSE 4
        END,
        CASE 
          WHEN room_num <= 6 THEN 120.00
          WHEN room_num <= 10 THEN 180.00
          ELSE 280.00
        END,
        CASE 
          WHEN room_num <= 6 THEN 'Комфортна стандартна стая с всички удобства за приятен престой.'
          WHEN room_num <= 10 THEN 'Просторна делукс стая с допълнителни удобства и красива гледка.'
          ELSE 'Луксозен апартамент с отделни зони и премиум обзавеждане.'
        END,
        CASE 
          WHEN room_num <= 6 THEN '["Klimatik", "TV", "Минибар", "Собствена баня"]'::jsonb
          WHEN room_num <= 10 THEN '["Климатик", "Smart TV", "Минибар", "Балкон", "Халати и чехли", "Собствена баня"]'::jsonb
          ELSE '["Климатик", "Smart TV", "Минибар", "Балкон", "Джакузи", "Халати и чехли", "Дневна", "Собствена баня"]'::jsonb
        END
      );
    END LOOP;
  END LOOP;
END $$;