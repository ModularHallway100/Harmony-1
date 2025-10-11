-- Migration: Consolidate and Optimize Database Schema
-- This migration refines and unifies the entire PostgreSQL schema.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to recreate them with optimizations (in reverse order of dependency)
DROP TABLE IF EXISTS comment_likes, comments, user_follows, user_likes, playlist_tracks, listening_history, user_preferences, prompt_exports, prompt_likes, prompt_comments, prompt_shares, prompt_analytics, prompt_versions, collection_prompts, prompts, prompt_collections, prompt_templates, ai_generation_history, ai_artist_images, ai_artist_details, tracks, playlists, artists, users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    user_type VARCHAR(20) NOT NULL DEFAULT 'listener' CHECK (user_type IN ('listener', 'creator', 'both')),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Artists table
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    genre VARCHAR(50),
    profile_image_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_ai_artist BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Artist Details table
CREATE TABLE ai_artist_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE UNIQUE NOT NULL,
    personality_traits TEXT[],
    visual_style VARCHAR(50),
    speaking_style VARCHAR(20) CHECK (speaking_style IN ('formal', 'casual', 'energetic', 'mysterious', 'friendly')),
    backstory TEXT,
    influences TEXT[],
    unique_elements TEXT[],
    generation_parameters JSONB,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    ai_training_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Artist Images table
CREATE TABLE ai_artist_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    prompt TEXT,
    model VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id, image_url)
);

-- Tracks table
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    audio_url VARCHAR(500) NOT NULL,
    cover_art_url VARCHAR(500),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    genre VARCHAR(50),
    mood VARCHAR(50),
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_generation_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlists table
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_art_url VARCHAR(500),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_generation_prompt TEXT,
    track_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlist tracks junction table
CREATE TABLE playlist_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, track_id)
);

-- User likes for tracks
CREATE TABLE user_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, track_id)
);

-- User follows for artists
CREATE TABLE user_follows (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, artist_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_comment_target CHECK (
        (track_id IS NOT NULL AND playlist_id IS NULL AND artist_id IS NULL) OR
        (track_id IS NULL AND playlist_id IS NOT NULL AND artist_id IS NULL) OR
        (track_id IS NULL AND playlist_id IS NULL AND artist_id IS NOT NULL)
    )
);

-- Comment likes table
CREATE TABLE comment_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id)
);

-- Listening history
CREATE TABLE listening_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    completion_percentage INTEGER DEFAULT 0
);

-- Prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    base_prompt TEXT NOT NULL,
    refined_prompt TEXT,
    genre VARCHAR(50),
    mood VARCHAR(50),
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    parent_prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Generation History
CREATE TABLE ai_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
    generation_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    result_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create a single function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to all relevant tables
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t_name, t_name);
    END LOOP;
END;
$$;

-- Indexes
CREATE INDEX ON users (clerk_user_id);
CREATE INDEX ON artists (user_id);
CREATE INDEX ON artists (is_ai_artist);
CREATE INDEX ON tracks (artist_id);
CREATE INDEX ON playlists (user_id);
CREATE INDEX ON playlist_tracks (playlist_id, track_id);
CREATE INDEX ON user_likes (user_id, track_id);
CREATE INDEX ON user_follows (user_id, artist_id);
CREATE INDEX ON comments (track_id);
CREATE INDEX ON comments (playlist_id);
CREATE INDEX ON comments (artist_id);
CREATE INDEX ON listening_history (user_id, played_at DESC);
CREATE INDEX ON prompts (user_id, created_at DESC);
CREATE INDEX ON ai_generation_history (user_id, created_at DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO harmony_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO harmony_app;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO harmony_app;