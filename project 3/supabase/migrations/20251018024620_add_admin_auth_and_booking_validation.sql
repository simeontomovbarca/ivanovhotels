/*
  # Add Admin Authentication and Booking Validation

  1. Changes
    - Update RLS policies to check for admin role via JWT
    - Add function to check for booking overlaps
    - Add trigger to validate bookings on insert/update

  2. Security
    - Admin users can manage all data (those with app_metadata.role = 'admin')
    - Regular users cannot access admin functionality
    - Booking overlaps are prevented at database level

  3. Notes
    - Admin users need to have app_metadata.role = 'admin'
    - Use Supabase dashboard to set admin role manually for first admin user
    - Booking validation prevents double-booking same room for overlapping dates
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view their own bookings by email" ON bookings;
DROP POLICY IF EXISTS "System can update booking status" ON bookings;

-- Update RLS policies for hotels table
CREATE POLICY "Admins can insert hotels"
  ON hotels FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update hotels"
  ON hotels FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete hotels"
  ON hotels FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Update RLS policies for rooms table
CREATE POLICY "Admins can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Update RLS policies for bookings table
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Create function to check for booking overlaps
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM bookings
    WHERE room_id = NEW.room_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status != 'cancelled'
      AND (
        (NEW.check_in_date, NEW.check_out_date) OVERLAPS (check_in_date, check_out_date)
      )
  ) THEN
    RAISE EXCEPTION 'Room is already booked for these dates';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate bookings
DROP TRIGGER IF EXISTS validate_booking_overlap ON bookings;
CREATE TRIGGER validate_booking_overlap
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();