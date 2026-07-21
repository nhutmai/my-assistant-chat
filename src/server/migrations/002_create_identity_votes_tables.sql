-- Migration: Create identity and votes tables
-- Created at: 2026-07-14

-- ────────────────────────────────────────────────────────────
-- 1. user_identity: Lưu tuyên ngôn identity của mỗi user
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_identity (
    username VARCHAR(100) PRIMARY KEY,
    identity_text TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────
-- 2. user_votes: Mỗi thói quen (vote) thuộc về 1 user
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_votes_username ON user_votes(username);

-- ────────────────────────────────────────────────────────────
-- 3. vote_history: Lịch sử bỏ phiếu theo ngày
--    Composite PK (vote_id, vote_date) đảm bảo mỗi vote
--    chỉ có tối đa 1 record mỗi ngày.
--    ON DELETE CASCADE: xoá vote → tự xoá toàn bộ history.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vote_history (
    vote_id UUID NOT NULL REFERENCES user_votes(id) ON DELETE CASCADE,
    vote_date DATE NOT NULL,
    PRIMARY KEY (vote_id, vote_date)
);

CREATE INDEX IF NOT EXISTS idx_vote_history_date ON vote_history(vote_date DESC);
