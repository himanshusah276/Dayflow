-- Dayflow HRMS - Migration 003: Phone Number Authentication Support
ALTER TABLE users ADD COLUMN phone TEXT;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
