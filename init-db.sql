-- Initialize database schema
-- This script runs when the PostgreSQL container starts for the first time

-- Create the identity schema
CREATE SCHEMA IF NOT EXISTS identity;

-- Grant permissions
GRANT ALL ON SCHEMA identity TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA identity TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA identity TO postgres;
