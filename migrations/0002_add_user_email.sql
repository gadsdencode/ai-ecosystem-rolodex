-- Add email column to users table
-- Note: This migration assumes no existing users without email
-- If migrating existing data, you may need to provide a default value first

ALTER TABLE users ADD COLUMN email text;

-- Update existing users with a placeholder email if needed (uncomment if migrating existing data)
-- UPDATE users SET email = username || '@placeholder.local' WHERE email IS NULL;

-- Make the column NOT NULL after populating existing rows
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add unique constraint
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

