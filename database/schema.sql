-- ============================================================
-- Review Me - PostgreSQL schema (reference copy)
-- Database: reviewme
--
-- This script mirrors the tables that the NestJS backend creates
-- from its TypeORM entities (camelCase column names, so every
-- column name is double-quoted).
-- Safe to re-run: every statement uses IF NOT EXISTS.
-- Requires PostgreSQL 13 or newer (gen_random_uuid() is built in).
-- ============================================================

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    "id"               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "email"            varchar(160)  NOT NULL,
    "passwordHash"     varchar(255)  NOT NULL,
    "fullName"         varchar(120)  NOT NULL,
    "phone"            varchar(30),
    "role"             varchar(20)   NOT NULL DEFAULT 'CUSTOMER',
    "isActive"         boolean       NOT NULL DEFAULT true,
    "refreshTokenHash" varchar(255),
    "lastLoginAt"      timestamp,
    "createdAt"        timestamp     NOT NULL DEFAULT now(),
    "updatedAt"        timestamp     NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email" ON users ("email");

-- ------------------------------------------------------------
-- BUSINESSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS businesses (
    "id"                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"              varchar(160)  NOT NULL,
    "slug"              varchar(180)  NOT NULL,
    "description"       text,
    "category"          varchar(80),
    "industry"          varchar(100),
    "foundedYear"       integer,
    "website"           varchar(255),
    "contactEmail"      varchar(160),
    "phone"             varchar(30),
    "address"           varchar(255),
    "city"              varchar(100),
    "state"             varchar(100),
    "country"           varchar(100),
    "postalCode"        varchar(20),
    "brandColor"        varchar(20),
    "businessHours"     jsonb,
    "socialLinks"       jsonb,
    "logoUrl"           varchar(500),
    "bannerUrl"         varchar(500),
    "moderationEnabled" boolean       NOT NULL DEFAULT true,
    "isActive"          boolean       NOT NULL DEFAULT true,
    "ownerId"           uuid          NOT NULL,
    "createdAt"         timestamp     NOT NULL DEFAULT now(),
    "updatedAt"         timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT "fk_businesses_owner"
        FOREIGN KEY ("ownerId") REFERENCES users ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_businesses_slug" ON businesses ("slug");

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    "id"             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId"     uuid          NOT NULL,
    "customerId"     uuid,
    "customerName"   varchar(120)  NOT NULL,
    "customerEmail"  varchar(160),
    "rating"         integer       NOT NULL,
    "type"           varchar(20)   NOT NULL DEFAULT 'TEXT',
    "content"        text,
    "transcript"     text,
    "status"         varchar(20)   NOT NULL DEFAULT 'PENDING',
    "sentiment"      varchar(20),
    "sentimentScore" double precision,
    "aiStatus"       varchar(20)   NOT NULL DEFAULT 'PENDING',
    "aiError"        text,
    "moderationNote" text,
    "moderatedById"  uuid,
    "moderatedAt"    timestamp,
    "createdAt"      timestamp     NOT NULL DEFAULT now(),
    "updatedAt"      timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT "fk_reviews_business"
        FOREIGN KEY ("businessId") REFERENCES businesses ("id") ON DELETE CASCADE,
    CONSTRAINT "fk_reviews_customer"
        FOREIGN KEY ("customerId") REFERENCES users ("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "idx_reviews_business" ON reviews ("businessId");
CREATE INDEX IF NOT EXISTS "idx_reviews_status"   ON reviews ("status");

-- ------------------------------------------------------------
-- SENTIMENT RESULTS  (one row per analysed review)
-- ------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE sentiment_results_sentimentlabel_enum AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sentiment_results (
    "id"             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "reviewId"       uuid          NOT NULL,
    "sentimentLabel" sentiment_results_sentimentlabel_enum NOT NULL,
    "sentimentScore" double precision NOT NULL,
    "confidence"     double precision NOT NULL,
    "keywords"       text[]        NOT NULL DEFAULT '{}',
    "engine"         varchar       NOT NULL,
    "processingMs"   integer,
    "createdAt"      timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT "uq_sentiment_review" UNIQUE ("reviewId"),
    CONSTRAINT "fk_sentiment_review"
        FOREIGN KEY ("reviewId") REFERENCES reviews ("id") ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- MEDIA FILES
-- (businessId and reviewId are plain columns, no foreign keys)
-- ------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE media_files_type_enum AS ENUM ('video', 'audio', 'image');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS media_files (
    "id"         uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId" varchar       NOT NULL,
    "reviewId"   varchar,
    "fileName"   varchar       NOT NULL,
    "filePath"   varchar       NOT NULL,
    "type"       media_files_type_enum NOT NULL,
    "sizeBytes"  bigint        NOT NULL,
    "mimeType"   varchar       NOT NULL,
    "createdAt"  timestamp     NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- NOTIFICATIONS  (metadata is stored as a JSON string: simple-json)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    "id"        uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    uuid          NOT NULL,
    "title"     varchar(160)  NOT NULL,
    "message"   text          NOT NULL,
    "type"      varchar(30)   NOT NULL DEFAULT 'SYSTEM',
    "isRead"    boolean       NOT NULL DEFAULT false,
    "metadata"  text,
    "createdAt" timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT "fk_notifications_user"
        FOREIGN KEY ("userId") REFERENCES users ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON notifications ("userId");

-- ------------------------------------------------------------
-- WIDGETS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS widgets (
    "id"            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    "businessId"    uuid          NOT NULL,
    "name"          varchar(120)  NOT NULL,
    "publicKey"     varchar(64)   NOT NULL,
    "theme"         varchar(20)   NOT NULL DEFAULT 'LIGHT',
    "layout"        varchar(20)   NOT NULL DEFAULT 'LIST',
    "primaryColor"  varchar(20)   NOT NULL DEFAULT '#2563eb',
    "minRating"     integer       NOT NULL DEFAULT 1,
    "maxReviews"    integer       NOT NULL DEFAULT 10,
    "showSentiment" boolean       NOT NULL DEFAULT true,
    "showRating"    boolean       NOT NULL DEFAULT true,
    "showAverage"   boolean       NOT NULL DEFAULT true,
    "isActive"      boolean       NOT NULL DEFAULT true,
    "viewCount"     integer       NOT NULL DEFAULT 0,
    "createdAt"     timestamp     NOT NULL DEFAULT now(),
    "updatedAt"     timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT "fk_widgets_business"
        FOREIGN KEY ("businessId") REFERENCES businesses ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_widgets_public_key" ON widgets ("publicKey");