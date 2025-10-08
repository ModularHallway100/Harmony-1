-- Add prompt management tables for music prompt rewriting tool

-- Prompt Templates table for predefined prompt structures
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    genre VARCHAR(50),
    mood VARCHAR(50),
    template_structure JSONB NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt Collections table for organizing prompts
CREATE TABLE prompt_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    collaboration_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collection Prompts junction table
CREATE TABLE collection_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES prompt_collections(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, prompt_id)
);

-- Prompts table for storing rewritten prompts
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES prompt_collections(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    base_prompt TEXT NOT NULL,
    refined_prompt TEXT NOT NULL,
    genre VARCHAR(50),
    mood VARCHAR(50),
    tempo INTEGER CHECK (tempo > 0 AND tempo <= 300),
    instrumentation TEXT[],
    style VARCHAR(100),
    structure JSONB,
    optimization_level VARCHAR(20) DEFAULT 'standard' CHECK (optimization_level IN ('basic', 'standard', 'advanced', 'expert')),
    target_platforms TEXT[] DEFAULT ARRAY['suno']::text[],
    tags TEXT[],
    effectiveness_score DECIMAL(3,2),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    collaboration_data JSONB DEFAULT '{}'::jsonb,
    version INTEGER DEFAULT 1,
    parent_prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt Versions table for versioning
CREATE TABLE prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    base_prompt TEXT NOT NULL,
    refined_prompt TEXT NOT NULL,
    genre VARCHAR(50),
    mood VARCHAR(50),
    tempo INTEGER,
    instrumentation TEXT[],
    style VARCHAR(100),
    structure JSONB,
    optimization_level VARCHAR(20),
    target_platforms TEXT[],
    tags TEXT[],
    changelog TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prompt_id, version_number)
);

-- Prompt Analytics table for tracking effectiveness
CREATE TABLE prompt_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    generation_success BOOLEAN DEFAULT FALSE,
    generation_quality DECIMAL(3,2),
    generation_time INTEGER, -- in seconds
    feedback_text TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt Shares table for collaboration
CREATE TABLE prompt_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_level VARCHAR(20) DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'comment')),
    can_share BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prompt_id, shared_with_user_id)
);

-- Prompt Comments table for collaboration
CREATE TABLE prompt_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES prompt_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    access_level VARCHAR(20) DEFAULT 'all' CHECK (access_level IN ('all', 'collaborators', 'owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prompt Likes table for engagement
CREATE TABLE prompt_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(prompt_id, user_id)
);

-- Prompt Export History table
CREATE TABLE prompt_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    export_format VARCHAR(50) NOT NULL,
    platform_specific_data JSONB,
    export_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for prompt tables
CREATE INDEX idx_prompt_templates_user_id ON prompt_templates(user_id);
CREATE INDEX idx_prompt_templates_genre ON prompt_templates(genre);
CREATE INDEX idx_prompt_templates_is_public ON prompt_templates(is_public);
CREATE INDEX idx_prompt_templates_usage_count ON prompt_templates(usage_count DESC);
CREATE INDEX idx_prompt_templates_created_at ON prompt_templates(created_at DESC);

CREATE INDEX idx_prompt_collections_user_id ON prompt_collections(user_id);
CREATE INDEX idx_prompt_collections_is_public ON prompt_collections(is_public);
CREATE INDEX idx_prompt_collections_created_at ON prompt_collections(created_at DESC);

CREATE INDEX idx_collection_prompts_collection_id ON collection_prompts(collection_id);
CREATE INDEX idx_collection_prompts_prompt_id ON collection_prompts(prompt_id);

CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_collection_id ON prompts(collection_id);
CREATE INDEX idx_prompts_genre ON prompts(genre);
CREATE INDEX idx_prompts_mood ON prompts(mood);
CREATE INDEX idx_prompts_optimization_level ON prompts(optimization_level);
CREATE INDEX idx_prompts_target_platforms ON prompts USING GIN(target_platforms);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_is_favorite ON prompts(is_favorite);
CREATE INDEX idx_prompts_is_public ON prompts(is_public);
CREATE INDEX idx_prompts_version ON prompts(version);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

CREATE INDEX idx_prompt_versions_prompt_id ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_version_number ON prompt_versions(version_number);

CREATE INDEX idx_prompt_analytics_prompt_id ON prompt_analytics(prompt_id);
CREATE INDEX idx_prompt_analytics_user_id ON prompt_analytics(user_id);
CREATE INDEX idx_prompt_analytics_platform ON prompt_analytics(platform);
CREATE INDEX idx_prompt_analytics_created_at ON prompt_analytics(created_at DESC);

CREATE INDEX idx_prompt_shares_prompt_id ON prompt_shares(prompt_id);
CREATE INDEX idx_prompt_shares_owner_user_id ON prompt_shares(owner_user_id);
CREATE INDEX idx_prompt_shares_shared_with_user_id ON prompt_shares(shared_with_user_id);

CREATE INDEX idx_prompt_comments_prompt_id ON prompt_comments(prompt_id);
CREATE INDEX idx_prompt_comments_user_id ON prompt_comments(user_id);
CREATE INDEX idx_prompt_comments_parent_id ON prompt_comments(parent_id);
CREATE INDEX idx_prompt_comments_created_at ON prompt_comments(created_at DESC);

CREATE INDEX idx_prompt_likes_prompt_id ON prompt_likes(prompt_id);
CREATE INDEX idx_prompt_likes_user_id ON prompt_likes(user_id);

CREATE INDEX idx_prompt_exports_prompt_id ON prompt_exports(prompt_id);
CREATE INDEX idx_prompt_exports_user_id ON prompt_exports(user_id);
CREATE INDEX idx_prompt_exports_export_format ON prompt_exports(export_format);
CREATE INDEX idx_prompt_exports_created_at ON prompt_exports(created_at DESC);

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_prompt_templates_updated_at BEFORE UPDATE ON prompt_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_collections_updated_at BEFORE UPDATE ON prompt_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_comments_updated_at BEFORE UPDATE ON prompt_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update prompt effectiveness score
CREATE OR REPLACE FUNCTION update_prompt_effectiveness_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate effectiveness score based on analytics
    IF TG_TABLE_NAME = 'prompts' AND NEW.id IS NOT NULL THEN
        -- Get average rating for this prompt
        DECLARE avg_rating DECIMAL(3,2);
        DECLARE success_rate DECIMAL(3,2);
        DECLARE total_analytics INTEGER;
        
        SELECT 
            COALESCE(AVG(rating), 0),
            COALESCE(AVG(CASE WHEN generation_success THEN 100 ELSE 0 END), 0),
            COUNT(*)
        INTO avg_rating, success_rate, total_analytics
        FROM prompt_analytics
        WHERE prompt_id = NEW.id;
        
        -- Combine metrics (rating 40%, success rate 40%, usage 20%)
        NEW.effectiveness_score := 
            (avg_rating * 0.4) + 
            (success_rate * 0.4) + 
            (LEAST(total_analytics / 10.0, 1.0) * 20.0);
        
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update effectiveness score
CREATE TRIGGER update_prompt_effectiveness_score_trigger
    AFTER INSERT OR UPDATE ON prompt_analytics
    FOR EACH ROW EXECUTE FUNCTION update_prompt_effectiveness_score();

-- Function to create new prompt version
CREATE OR REPLACE FUNCTION create_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'prompts' AND NEW.id IS NOT NULL THEN
        -- Create version record before updating
        INSERT INTO prompt_versions (
            prompt_id,
            version_number,
            base_prompt,
            refined_prompt,
            genre,
            mood,
            tempo,
            instrumentation,
            style,
            structure,
            optimization_level,
            target_platforms,
            tags,
            changelog
        ) SELECT 
            NEW.id,
            COALESCE((SELECT MAX(version_number) FROM prompt_versions WHERE prompt_id = NEW.id), 0) + 1,
            OLD.base_prompt,
            OLD.refined_prompt,
            OLD.genre,
            OLD.mood,
            OLD.tempo,
            OLD.instrumentation,
            OLD.style,
            OLD.structure,
            OLD.optimization_level,
            OLD.target_platforms,
            OLD.tags,
            'Updated prompt: ' || COALESCE(NEW.title, 'Untitled')
        FROM prompts OLD
        WHERE OLD.id = NEW.id;
        
        -- Increment version number
        NEW.version := COALESCE((SELECT MAX(version_number) FROM prompt_versions WHERE prompt_id = NEW.id), 0) + 1;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create prompt version on update
CREATE TRIGGER create_prompt_version_trigger
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION create_prompt_version();