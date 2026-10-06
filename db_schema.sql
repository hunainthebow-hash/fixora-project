-- Fixora production-ready PostgreSQL schema
-- Run with a dedicated DB user. Never expose DATABASE_URL to the browser.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(254) UNIQUE NOT NULL,
  phone VARCHAR(32) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer','provider','admin')),
  avatar TEXT,
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_accounts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_pkr NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (balance_pkr >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_providers (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  category_id VARCHAR(50) NOT NULL,
  title VARCHAR(160) NOT NULL,
  hourly_rate_pkr NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (hourly_rate_pkr >= 0),
  rating NUMERIC(3,2) NOT NULL DEFAULT 5 CHECK (rating >= 0 AND rating <= 5),
  current_location GEOGRAPHY(POINT,4326),
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_ready BOOLEAN NOT NULL DEFAULT FALSE,
  background_checked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  provider_id UUID NOT NULL REFERENCES users(id),
  category_id VARCHAR(50) NOT NULL,
  service_title VARCHAR(180) NOT NULL,
  problem_description TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ NOT NULL,
  urgency VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (urgency IN ('standard','emergency')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','en_route','arrived','in_progress','completed','cancelled')),
  total_amount_pkr NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount_pkr >= 0),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_date ON bookings(customer_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_date ON bookings(provider_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(lower(email));

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit','debit','refund','hold','release')),
  amount_pkr NUMERIC(14,2) NOT NULL CHECK (amount_pkr > 0),
  reference VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_date ON wallet_transactions(user_id, created_at DESC);

-- Least-privilege grants should be applied to your application DB role, not a superuser.
-- Never give the web app database role ownership of the database.
