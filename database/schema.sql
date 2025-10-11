-- PostgreSQL Schema for Harmony Music Platform
-- This file represents the consolidated and optimized database schema.
-- The authoritative schema definition is in the latest migration file.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';