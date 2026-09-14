-- ============================================================
-- ReviewMe
-- PostgreSQL Database Schema
-- CS619 Prototype
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(160) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    full_name VARCHAR(120) NOT NULL,

    phone VARCHAR(30),

    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'
        CHECK (role IN ('ADMIN', 'BUSINESS', 'CUSTOMER')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    refresh_token_hash VARCHAR(255),

    last_login_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
ON users(email);


-- ============================================================
-- BUSINESSES
-- ============================================================

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(160) NOT NULL,

    slug VARCHAR(180) NOT NULL UNIQUE,

    description TEXT,

    category VARCHAR(80),

    website VARCHAR(255),

    contact_email VARCHAR(160),

    phone VARCHAR(30),

    address VARCHAR(255),

    logo_url VARCHAR(500),

    moderation_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    owner_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_business_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner
ON businesses(owner_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_slug
ON businesses(slug);


-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL,

    customer_id UUID,

    customer_name VARCHAR(120) NOT NULL,

    customer_email VARCHAR(160),

    rating INTEGER NOT NULL
        CHECK (rating >= 1 AND rating <= 5),

    type VARCHAR(20) NOT NULL DEFAULT 'TEXT'
        CHECK (type IN ('TEXT', 'AUDIO', 'VIDEO')),

    content TEXT,

    transcript TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),

    sentiment VARCHAR(20)
        CHECK (
            sentiment IS NULL OR
            sentiment IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')
        ),

    sentiment_score DOUBLE PRECISION,

    ai_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (
            ai_status IN (
                'PENDING',
                'PROCESSING',
                'COMPLETED',
                'FAILED'
            )
        ),

    ai_error TEXT,

    moderation_note TEXT,

    moderated_by_id UUID,

    moderated_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_business
        FOREIGN KEY (business_id)
        REFERENCES businesses(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_review_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_business
ON reviews(business_id);

CREATE INDEX IF NOT EXISTS idx_reviews_customer
ON reviews(customer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_status
ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_reviews_created
ON reviews(created_at);


-- ============================================================
-- SENTIMENT RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS sentiment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    review_id UUID NOT NULL UNIQUE,

    label VARCHAR(20) NOT NULL
        CHECK (label IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),

    score DOUBLE PRECISION NOT NULL,

    confidence DOUBLE PRECISION NOT NULL DEFAULT 0,

    keywords JSONB,

    engine VARCHAR(80) NOT NULL DEFAULT 'local-lexicon-v1',

    processing_ms INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sentiment_review
        FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);


-- ============================================================
-- MEDIA FILES
-- ============================================================

CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    review_id UUID,

    original_name VARCHAR(255) NOT NULL,

    stored_name VARCHAR(255) NOT NULL,

    storage_path VARCHAR(500) NOT NULL,

    url VARCHAR(500) NOT NULL,

    mime_type VARCHAR(100) NOT NULL,

    kind VARCHAR(20) NOT NULL
        CHECK (kind IN ('AUDIO', 'VIDEO', 'IMAGE')),

    size BIGINT NOT NULL,

    duration_seconds DOUBLE PRECISION,

    transcribed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_media_review
        FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_review
ON media_files(review_id);


-- ============================================================
-- WIDGETS
-- ============================================================

CREATE TABLE IF NOT EXISTS widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL,

    name VARCHAR(120) NOT NULL,

    public_key VARCHAR(64) NOT NULL UNIQUE,

    theme VARCHAR(20) NOT NULL DEFAULT 'LIGHT'
        CHECK (theme IN ('LIGHT', 'DARK')),

    layout VARCHAR(20) NOT NULL DEFAULT 'LIST'
        CHECK (layout IN ('LIST', 'GRID', 'CAROUSEL')),

    primary_color VARCHAR(20) NOT NULL DEFAULT '#2563eb',

    min_rating INTEGER NOT NULL DEFAULT 1,

    max_reviews INTEGER NOT NULL DEFAULT 10,

    show_sentiment BOOLEAN NOT NULL DEFAULT TRUE,

    show_rating BOOLEAN NOT NULL DEFAULT TRUE,

    show_average BOOLEAN NOT NULL DEFAULT TRUE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    view_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_widget_business
        FOREIGN KEY (business_id)
        REFERENCES businesses(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_widgets_business
ON widgets(business_id);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(160) NOT NULL,

    message TEXT NOT NULL,

    type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    metadata JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read
ON notifications(is_read);


-- ============================================================
-- COMPLETE
-- ============================================================