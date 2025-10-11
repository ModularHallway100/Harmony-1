-- Add subscription-related tables to Harmony Music Platform

-- Subscription Tiers table
CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_id UUID REFERENCES subscription_tiers(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trial')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, status)
);

-- Payment Methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_payment_method_id VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    last_four_digits VARCHAR(4),
    expiry_month INTEGER,
    expiry_year INTEGER,
    card_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions table
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    provider_transaction_id VARCHAR(255),
    provider VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Usage Tracking table
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('ai_generations', 'track_uploads', 'prompt_refinements', 'storage_usage')),
    metric_value INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fan Subscriptions table
CREATE TABLE fan_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
    tier_id UUID REFERENCES subscription_tiers(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    platform_percentage DECIMAL(5,2) DEFAULT 0.20, -- 20% platform fee
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fan_id, artist_id)
);

-- Fan Subscription Benefits table
CREATE TABLE fan_subscription_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_subscription_id UUID REFERENCES fan_subscriptions(id) ON DELETE CASCADE NOT NULL,
    benefit_type VARCHAR(50) NOT NULL CHECK (benefit_type IN ('exclusive_content', 'early_access', 'custom_tracks', 'behind_scenes')),
    benefit_data JSONB,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Creator Revenue table
CREATE TABLE creator_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
    fan_subscription_id UUID REFERENCES fan_subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'reversed')),
    payout_method VARCHAR(50),
    payout_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exclusive Content table
CREATE TABLE exclusive_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('track', 'video', 'image', 'document', 'text')),
    content_url VARCHAR(500),
    content_data JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    subscription_tier_required VARCHAR(50) REFERENCES subscription_tiers(name),
    fan_subscription_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (name, description, price, billing_cycle, features) VALUES
('free', 'Free tier with basic features', 0.00, 'monthly', '{
    "ai_generations_monthly": 10,
    "track_uploads_monthly": 5,
    "prompt_refinements_monthly": 20,
    "storage_mb": 100,
    "ad_support": true,
    "exclusive_content_access": false,
    "priority_generation": false,
    "analytics_dashboard": false,
    "download_quality": "standard",
    "custom_tracks": false
}'),
('premium', 'Premium tier with enhanced features and no ads', 9.99, 'monthly', '{
    "ai_generations_monthly": 100,
    "track_uploads_monthly": 50,
    "prompt_refinements_monthly": 200,
    "storage_mb": 1000,
    "ad_support": false,
    "exclusive_content_access": true,
    "priority_generation": true,
    "analytics_dashboard": true,
    "download_quality": "high",
    "custom_tracks": true,
    "early_access": true,
    "enhanced_prompt_tools": true
}'),
('creator', 'Creator tier with professional tools and monetization', 29.99, 'monthly', '{
    "ai_generations_monthly": 500,
    "track_uploads_monthly": 200,
    "prompt_refinements_monthly": 1000,
    "storage_mb": 10000,
    "ad_support": false,
    "exclusive_content_access": true,
    "priority_generation": true,
    "analytics_dashboard": true,
    "download_quality": "lossless",
    "custom_tracks": true,
    "early_access": true,
    "enhanced_prompt_tools": true,
    "fan_subscriptions": true,
    "revenue_sharing": true,
    "advanced_analytics": true,
    "api_access": true,
    "batch_processing": true
}');

-- Insert default subscription plans
INSERT INTO subscription_plans (tier_id, name, description, price, billing_cycle, features) 
SELECT 
    id, 
    name || ' - Monthly', 
    description || ' (Monthly billing)', 
    price, 
    'monthly',
    features
FROM subscription_tiers;

INSERT INTO subscription_plans (tier_id, name, description, price, billing_cycle, features) 
SELECT 
    id, 
    name || ' - Yearly', 
    description || ' (Yearly billing - 2 months free)', 
    price * 10, -- 10 months for yearly (2 months free)
    'yearly',
    features
FROM subscription_tiers;

-- Update function to include subscription tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_subscription_tiers_updated_at 
    BEFORE UPDATE ON subscription_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at 
    BEFORE UPDATE ON payment_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at 
    BEFORE UPDATE ON usage_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fan_subscriptions_updated_at 
    BEFORE UPDATE ON fan_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fan_subscription_benefits_updated_at 
    BEFORE UPDATE ON fan_subscription_benefits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_revenue_updated_at 
    BEFORE UPDATE ON creator_revenue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exclusive_content_updated_at 
    BEFORE UPDATE ON exclusive_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();