-- PostgreSQL Schema for Harmony Music Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and user profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE, -- Clerk user ID for authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- May be NULL for Clerk users
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    user_type VARCHAR(20) NOT NULL DEFAULT 'listener' CHECK (user_type IN ('listener', 'creator', 'both')),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Artists table for both human and AI artists
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    bio TEXT,
    genre VARCHAR(50),
    profile_image_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_ai_artist BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(50),
    ai_prompt TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Artist Details table for storing AI-specific artist data
CREATE TABLE ai_artist_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE UNIQUE,
    personality_traits TEXT[], -- Array of personality traits
    visual_style VARCHAR(50),
    speaking_style VARCHAR(20) CHECK (speaking_style IN ('formal', 'casual', 'energetic', 'mysterious', 'friendly')),
    backstory TEXT,
    influences TEXT,
    unique_elements TEXT,
    generation_parameters JSONB,
    performance_metrics JSONB DEFAULT '{}'::jsonb,
    ai_training_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Artist Images table for storing generated artist images
CREATE TABLE ai_artist_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    prompt TEXT,
    model VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(artist_id, image_url)
);

-- AI Generation History table for tracking AI generations
CREATE TABLE ai_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
    generation_type VARCHAR(50) NOT NULL CHECK (generation_type IN ('artist', 'bio', 'image', 'track')),
    prompt TEXT NOT NULL,
    refined_prompt TEXT,
    parameters JSONB,
    result_data JSONB,
    service_used VARCHAR(50) CHECK (service_used IN ('gemini', 'nano-banana', 'seedance')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, generation_type, created_at)
);

-- Tracks table for music content
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in seconds
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
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, track_id)
);

-- User likes table for tracks
CREATE TABLE user_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id)
);

-- User follows table for artists
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, artist_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comment likes table
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, comment_id)
);

-- User preferences for personalization
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_genres TEXT[], -- Array of preferred genres
    preferred_moods TEXT[], -- Array of preferred moods
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    auto_play BOOLEAN DEFAULT TRUE,
    explicit_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User listening history
CREATE TABLE listening_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed BOOLEAN DEFAULT FALSE,
    completion_percentage INTEGER DEFAULT 0
);


-- Indexes for better query performance
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Artist indexes
CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_is_ai_artist ON artists(is_ai_artist);
CREATE INDEX idx_artists_genre ON artists(genre);
CREATE INDEX idx_artists_created_at ON artists(created_at DESC);
CREATE INDEX idx_artists_name ON artists(name);

-- AI Artist Details indexes
CREATE INDEX idx_ai_artist_details_artist_id ON ai_artist_details(artist_id);
CREATE INDEX idx_ai_artist_details_visual_style ON ai_artist_details(visual_style);
CREATE INDEX idx_ai_artist_details_speaking_style ON ai_artist_details(speaking_style);

-- AI Artist Images indexes
CREATE INDEX idx_ai_artist_images_artist_id ON ai_artist_images(artist_id);
CREATE INDEX idx_ai_artist_images_is_primary ON ai_artist_images(is_primary);
CREATE INDEX idx_ai_artist_images_generated_at ON ai_artist_images(generated_at DESC);

-- AI Generation History indexes
CREATE INDEX idx_ai_generation_history_user_id ON ai_generation_history(user_id);
CREATE INDEX idx_ai_generation_history_artist_id ON ai_generation_history(artist_id);
CREATE INDEX idx_ai_generation_history_generation_type ON ai_generation_history(generation_type);
CREATE INDEX idx_ai_generation_history_status ON ai_generation_history(status);
CREATE INDEX idx_ai_generation_history_service_used ON ai_generation_history(service_used);
CREATE INDEX idx_ai_generation_history_created_at ON ai_generation_history(created_at DESC);

-- Track indexes
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_is_ai_generated ON tracks(is_ai_generated);

-- Playlist indexes
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_ai_generated ON playlists(is_ai_generated);

-- Playlist tracks indexes
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track_id ON playlist_tracks(track_id);

-- User likes indexes
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_track_id ON user_likes(track_id);

-- User follows indexes
CREATE INDEX idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX idx_user_follows_artist_id ON user_follows(artist_id);

-- Comments indexes
CREATE INDEX idx_comments_track_id ON comments(track_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Listening history indexes
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX idx_listening_history_played_at ON listening_history(played_at DESC);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- AI generations indexes (legacy)
CREATE INDEX idx_ai_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_ai_generations_status ON ai_generations(status);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at timestamp
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();