-- Migration: Add AI Artist Tables and Indexes
-- This migration adds the necessary tables and indexes for AI artist functionality

-- Add AI Artist Details table
CREATE TABLE IF NOT EXISTS ai_artist_details (
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

-- Add AI Artist Images table
CREATE TABLE IF NOT EXISTS ai_artist_images (
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

-- Add AI Generation History table
CREATE TABLE IF NOT EXISTS ai_generation_history (
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

-- Add indexes for AI Artist Details
CREATE INDEX IF NOT EXISTS idx_ai_artist_details_artist_id ON ai_artist_details(artist_id);
CREATE INDEX IF NOT EXISTS idx_ai_artist_details_visual_style ON ai_artist_details(visual_style);
CREATE INDEX IF NOT EXISTS idx_ai_artist_details_speaking_style ON ai_artist_details(speaking_style);

-- Add indexes for AI Artist Images
CREATE INDEX IF NOT EXISTS idx_ai_artist_images_artist_id ON ai_artist_images(artist_id);
CREATE INDEX IF NOT EXISTS idx_ai_artist_images_is_primary ON ai_artist_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_ai_artist_images_generated_at ON ai_artist_images(generated_at DESC);

-- Add indexes for AI Generation History
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_user_id ON ai_generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_artist_id ON ai_generation_history(artist_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_generation_type ON ai_generation_history(generation_type);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_status ON ai_generation_history(status);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_service_used ON ai_generation_history(service_used);
CREATE INDEX IF NOT EXISTS idx_ai_generation_history_created_at ON ai_generation_history(created_at DESC);

-- Add additional indexes for artists table
CREATE INDEX IF NOT EXISTS idx_artists_is_ai_artist ON artists(is_ai_artist);
CREATE INDEX IF NOT EXISTS idx_artists_genre ON artists(genre);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);

-- Add indexes for tracks table for AI-generated content
CREATE INDEX IF NOT EXISTS idx_tracks_is_ai_generated ON tracks(is_ai_generated);
CREATE INDEX IF NOT EXISTS idx_tracks_genre ON tracks(genre);

-- Add indexes for playlists table for AI-generated content
CREATE INDEX IF NOT EXISTS idx_playlists_is_ai_generated ON playlists(is_ai_generated);

-- Create a function to update performance metrics
CREATE OR REPLACE FUNCTION update_ai_artist_performance_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update artist follower count when user follows an AI artist
        IF NEW.artist_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM artists WHERE id = NEW.artist_id AND is_ai_artist = TRUE
        ) THEN
            UPDATE artists 
            SET follower_count = (
                SELECT COUNT(*) FROM user_follows WHERE artist_id = NEW.artist_id
            )
            WHERE id = NEW.artist_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating AI artist performance metrics
CREATE TRIGGER trg_update_ai_artist_performance_metrics
    AFTER INSERT OR UPDATE ON user_follows
    FOR EACH ROW EXECUTE FUNCTION update_ai_artist_performance_metrics();

-- Create a function to update AI artist generation history
CREATE OR REPLACE FUNCTION update_ai_artist_generation_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update AI artist generation count
        IF NEW.artist_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM artists WHERE id = NEW.artist_id AND is_ai_artist = TRUE
        ) THEN
            UPDATE artists 
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.artist_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating AI artist generation history
CREATE TRIGGER trg_update_ai_artist_generation_history
    AFTER INSERT OR UPDATE ON ai_generation_history
    FOR EACH ROW EXECUTE FUNCTION update_ai_artist_generation_history();

-- Grant necessary permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_artist_details TO harmony_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_artist_images TO harmony_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_generation_history TO harmony_app;

GRANT SELECT, USAGE ON ALL TABLES IN SCHEMA public TO harmony_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO harmony_app;