BEGIN;

CREATE TABLE profiles (
  profile_id UUID PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profile_data (
  profile_id UUID PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state CHAR(2) NOT NULL,
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
);

CREATE TABLE otp_codes (
  phone TEXT PRIMARY KEY,
  code INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE interviews (
  interview_id SERIAL PRIMARY KEY,
  profile_id UUID NOT NULL UNIQUE,
  interview_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  FOREIGN KEY (profile_id) REFERENCES profiles(profile_id) ON DELETE CASCADE
);

-- TODO a good constraint would be to ensure an interview only exists when profile_data exists

CREATE TABLE sessions (
  session_token TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMIT;
