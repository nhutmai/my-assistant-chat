-- Migration: Create logs table
-- Created at: 2026-05-18

CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'unknown',
    title TEXT DEFAULT 'Untitled',
    value NUMERIC DEFAULT 0,
    date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster retrieval of latest logs
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
