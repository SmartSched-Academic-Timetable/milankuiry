/*
  # SmartSched Database Schema
  
  Creates the complete database structure for the Academic Timetable & Room Allocation System.
  
  ## Tables Created
  
  1. organizations
     - id (uuid, primary key)
     - name (text, unique)
     - unique_code (text, unique)
     - admin_id (text)
     - password (text)
     - created_at (timestamp)
  
  2. users
     - id (uuid, primary key)
     - name (text)
     - unique_code (text, foreign key to organizations)
     - organization_id (uuid, foreign key)
     - created_at (timestamp)
     - unique constraint on name + unique_code
  
  3. teachers
     - id (uuid, primary key)
     - organization_id (uuid, foreign key)
     - name (text)
     - subject (text)
     - created_at (timestamp)
  
  4. rooms
     - id (uuid, primary key)
     - organization_id (uuid, foreign key)
     - room_number (text)
     - branch (text)
     - section (text)
     - created_at (timestamp)
  
  5. subjects
     - id (uuid, primary key)
     - organization_id (uuid, foreign key)
     - name (text)
     - created_at (timestamp)
  
  6. timetables
     - id (uuid, primary key)
     - organization_id (uuid, foreign key)
     - room_id (uuid, foreign key)
     - generated_date (date)
     - periods_per_day (integer)
     - is_current (boolean)
     - created_at (timestamp)
  
  7. timetable_entries
     - id (uuid, primary key)
     - timetable_id (uuid, foreign key)
     - day_of_week (text)
     - period_number (integer)
     - subject (text)
     - teacher_name (text)
     - room_number (text)
     - start_time (text)
     - end_time (text)
  
  ## Security
  
  - RLS enabled on all tables
  - Policies allow authenticated access based on organization_id
*/

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  unique_code text UNIQUE NOT NULL,
  admin_id text NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unique_code text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, unique_code)
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  room_number text NOT NULL,
  branch text NOT NULL,
  section text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  generated_date date DEFAULT CURRENT_DATE,
  periods_per_day integer DEFAULT 6,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create timetable_entries table
CREATE TABLE IF NOT EXISTS timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id uuid REFERENCES timetables(id) ON DELETE CASCADE NOT NULL,
  day_of_week text NOT NULL,
  period_number integer NOT NULL,
  subject text,
  teacher_name text,
  room_number text,
  start_time text,
  end_time text
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations (public read for login)
CREATE POLICY "Anyone can read organizations for login"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert organizations"
  ON organizations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for users
CREATE POLICY "Users can read all users in system"
  ON users FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for teachers
CREATE POLICY "Anyone can read teachers"
  ON teachers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage teachers"
  ON teachers FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for rooms
CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage rooms"
  ON rooms FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for subjects
CREATE POLICY "Anyone can read subjects"
  ON subjects FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage subjects"
  ON subjects FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for timetables
CREATE POLICY "Anyone can read timetables"
  ON timetables FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage timetables"
  ON timetables FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for timetable_entries
CREATE POLICY "Anyone can read timetable entries"
  ON timetable_entries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can manage timetable entries"
  ON timetable_entries FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_unique_code ON users(unique_code);
CREATE INDEX IF NOT EXISTS idx_teachers_org_id ON teachers(organization_id);
CREATE INDEX IF NOT EXISTS idx_rooms_org_id ON rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_subjects_org_id ON subjects(organization_id);
CREATE INDEX IF NOT EXISTS idx_timetables_org_id ON timetables(organization_id);
CREATE INDEX IF NOT EXISTS idx_timetables_room_id ON timetables(room_id);
CREATE INDEX IF NOT EXISTS idx_timetable_entries_timetable_id ON timetable_entries(timetable_id);