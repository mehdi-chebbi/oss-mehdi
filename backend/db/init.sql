-- Runs ONCE when the postgres container initialises for the first time.
-- /docker-entrypoint-initdb.d/ is only executed on a fresh volume.

-- ═══════════════════════════════════════════
-- Users
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'editor'
                    CHECK (role IN ('admin', 'editor')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Default admin (password: 123)
INSERT INTO users (name, email, password, role) VALUES
    ('Admin', 'admin@oss.org', '$2a$12$ySwsn.8Ox8yaGbV4CFL2IeM2nWeyl3HgKHJorpWyBWLuWsJXdwYw6', 'admin');

-- ═══════════════════════════════════════════
-- Pages
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pages (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    title_fr    VARCHAR(255) NOT NULL,
    title_en    VARCHAR(255) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default home page
INSERT INTO pages (slug, title_fr, title_en) VALUES
    ('home', 'Accueil', 'Home');

-- ═══════════════════════════════════════════
-- Hero
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hero (
    id                      SERIAL PRIMARY KEY,
    page_id                 INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    title_fr                TEXT NOT NULL,
    title_en                TEXT NOT NULL,
    subtitle_fr             TEXT NOT NULL,
    subtitle_en             TEXT NOT NULL,
    cta_primary_label_fr    VARCHAR(255) NOT NULL,
    cta_primary_label_en    VARCHAR(255) NOT NULL,
    cta_primary_link        VARCHAR(500) NOT NULL DEFAULT '#',
    cta_secondary_label_fr  VARCHAR(255) NOT NULL,
    cta_secondary_label_en  VARCHAR(255) NOT NULL,
    cta_secondary_link      VARCHAR(500) NOT NULL DEFAULT '#',
    background_image        VARCHAR(500) NOT NULL DEFAULT '/hero.jpg',
    is_published            BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default hero content
INSERT INTO hero (page_id, title_fr, title_en, subtitle_fr, subtitle_en,
                  cta_primary_label_fr, cta_primary_label_en, cta_primary_link,
                  cta_secondary_label_fr, cta_secondary_label_en, cta_secondary_link,
                  background_image) VALUES
    (1,
     'L''avenir du Sahel se decide sur le terrain',
     'The future of the Sahel is decided on the ground',
     'Surveillance, donnees et action pour 22 Etats membres face a la degradation des terres.',
     'Monitoring, data and action for 22 member states facing land degradation.',
     'Voir nos actions', 'See our actions', '#',
     'Dernieres actualites', 'Latest news', '#',
     '/hero.jpg');

-- ═══════════════════════════════════════════
-- Stats
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS stats (
    id          SERIAL PRIMARY KEY,
    page_id     INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    label_fr    VARCHAR(255) NOT NULL,
    label_en    VARCHAR(255) NOT NULL,
    value       VARCHAR(50) NOT NULL,
    suffix      VARCHAR(50) NOT NULL DEFAULT '',
    sort_order  INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Fields (Nos domaines d'action)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fields (
    id              SERIAL PRIMARY KEY,
    page_id         INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    title_fr        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255) NOT NULL,
    description_fr  TEXT NOT NULL,
    description_en  TEXT NOT NULL,
    image           VARCHAR(500) NOT NULL,
    gradient_hue    INT NOT NULL DEFAULT 120,
    sort_order      INT NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- News (Actualités) — full articles in DB, bilingual, slug-based URLs
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS news (
    id              SERIAL PRIMARY KEY,
    title_fr        TEXT NOT NULL,
    title_en        TEXT NOT NULL,
    body_fr         TEXT NOT NULL DEFAULT '',
    body_en         TEXT NOT NULL DEFAULT '',
    category        VARCHAR(30) NOT NULL DEFAULT 'institutional'
                    CHECK (category IN ('partnership', 'event', 'project', 'institutional', 'publication', 'opportunity')),
    images          JSONB NOT NULL DEFAULT '[]',       -- array of image URL strings
    thumbnail_index INT NOT NULL DEFAULT 0,            -- which image to use as the card thumbnail
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    slug            VARCHAR(200) NOT NULL UNIQUE,
    is_published    BOOLEAN NOT NULL DEFAULT false,
    index_status    VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (index_status IN ('pending', 'processing', 'ready', 'failed')),
    index_error     TEXT NOT NULL DEFAULT '',
    index_started_at TIMESTAMPTZ,
    indexed_at      TIMESTAMPTZ,
    active_index_version UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_date ON news (date DESC);
CREATE INDEX IF NOT EXISTS idx_news_published ON news (is_published);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news (slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news (category);
CREATE INDEX IF NOT EXISTS idx_news_index_status ON news (index_status, index_started_at);

-- ═══════════════════════════════════════════
-- Tools (Nos outils)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tools (
    id              SERIAL PRIMARY KEY,
    page_id         INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    title_fr        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255) NOT NULL,
    description_fr  TEXT NOT NULL,
    description_en  TEXT NOT NULL,
    image           VARCHAR(500) NOT NULL,
    link            VARCHAR(500) NOT NULL DEFAULT '#',
    sort_order      INT NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Partners
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS partners (
    id          SERIAL PRIMARY KEY,
    page_id     INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    image       VARCHAR(500) NOT NULL,
    row_number  INT NOT NULL DEFAULT 1,
    sort_order  INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Contact Info
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contact_info (
    id          SERIAL PRIMARY KEY,
    page_id     INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    label_fr    VARCHAR(255) NOT NULL,
    label_en    VARCHAR(255) NOT NULL,
    value       TEXT NOT NULL,
    icon        VARCHAR(100) NOT NULL DEFAULT '',
    sort_order  INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Socials
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS socials (
    id          SERIAL PRIMARY KEY,
    platform    VARCHAR(50) NOT NULL UNIQUE,
    url         VARCHAR(500) NOT NULL,
    icon_svg    TEXT NOT NULL DEFAULT '',
    icon_file   VARCHAR(500) NOT NULL DEFAULT '',
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Navigation
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS navigation (
    id          SERIAL PRIMARY KEY,
    label_fr    VARCHAR(255) NOT NULL,
    label_en    VARCHAR(255) NOT NULL,
    url         VARCHAR(500) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Site Settings
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS site_settings (
    id          SERIAL PRIMARY KEY,
    key         VARCHAR(100) NOT NULL UNIQUE,
    value_fr    TEXT NOT NULL,
    value_en    TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Media (uploaded files)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS media (
    id              SERIAL PRIMARY KEY,
    filename        VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    size            INT NOT NULL,
    url             VARCHAR(500) NOT NULL,
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- Preview Tokens
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS preview_tokens (
    id          SERIAL PRIMARY KEY,
    token       VARCHAR(255) NOT NULL UNIQUE,
    section     VARCHAR(50) NOT NULL,
    item_id     INT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preview_tokens_token ON preview_tokens (token);

-- ═══════════════════════════════════════════
-- Departments (for /projects section)
-- Top-level grouping for projects. Projects table (added later) will
-- reference departments(id). Slug auto-generated from title_en, stable.
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS departments (
    id              SERIAL PRIMARY KEY,
    title_fr        TEXT NOT NULL,
    title_en        TEXT NOT NULL,
    description_fr  TEXT NOT NULL DEFAULT '',
    description_en  TEXT NOT NULL DEFAULT '',
    image           VARCHAR(500) NOT NULL DEFAULT '',
    slug            VARCHAR(200) NOT NULL UNIQUE,
    sort_order      INT NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_slug ON departments (slug);
CREATE INDEX IF NOT EXISTS idx_departments_published ON departments (is_published);

-- ═══════════════════════════════════════════
-- Projects (belong to a department)
-- year_end is nullable (ongoing projects have no end year yet).
-- status is an enum: 'en_cours' (in progress) | 'cloture' (closed).
-- budget is a free-text string (e.g. "1.2M EUR", "$500,000") for admin flexibility.
-- Slug auto-generated from title_en + id, stable, never regenerated.
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
    id              SERIAL PRIMARY KEY,
    department_id   INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    title_fr        TEXT NOT NULL,
    title_en        TEXT NOT NULL,
    description_fr  TEXT NOT NULL DEFAULT '',
    description_en  TEXT NOT NULL DEFAULT '',
    results_fr      TEXT NOT NULL DEFAULT '',
    results_en      TEXT NOT NULL DEFAULT '',
    result_files    JSONB NOT NULL DEFAULT '[]'::jsonb,
    image           VARCHAR(500) NOT NULL DEFAULT '',
    year_start      INT,
    year_end        INT,
    status          VARCHAR(20) NOT NULL DEFAULT 'en_cours'
                    CHECK (status IN ('en_cours', 'cloture')),
    budget          VARCHAR(100) NOT NULL DEFAULT '',
    slug            VARCHAR(200) NOT NULL UNIQUE,
    sort_order      INT NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_department ON projects (department_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects (is_published);

-- ═══════════════════════════════════════════
-- Team (Notre équipe)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS team (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    title_fr        VARCHAR(255) NOT NULL DEFAULT '',
    title_en        VARCHAR(255) NOT NULL DEFAULT '',
    diplomas_fr     TEXT NOT NULL DEFAULT '',
    diplomas_en     TEXT NOT NULL DEFAULT '',
    nationality_fr  VARCHAR(255) NOT NULL DEFAULT '',
    nationality_en  VARCHAR(255) NOT NULL DEFAULT '',
    image           VARCHAR(500) NOT NULL DEFAULT '',
    department      VARCHAR(50) NOT NULL DEFAULT 'direction'
);

-- ═══════════════════════════════════════════
-- Refresh Tokens (rotation + reuse detection)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    family      UUID NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens (family);

-- ═══════════════════════════════════════════
-- Reports (complaint / integrity submissions)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reports (
    id          SERIAL PRIMARY KEY,
    category    VARCHAR(50) NOT NULL
                CHECK (category IN ('complaint', 'misconduct', 'fraud', 'harassment', 'other')),
    subject     TEXT NOT NULL,
    description TEXT NOT NULL,
    name        VARCHAR(255),
    email       VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_category ON reports (category);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports (created_at DESC);

-- ═══════════════════════════════════════════
-- Knowledge resources (public document library)
-- Files are stored locally under uploads/resources and served publicly.
-- A resource may provide a French PDF, an English PDF, or both.
-- ═══════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS resources (
    id                      UUID PRIMARY KEY,
    title_fr                TEXT NOT NULL,
    title_en                TEXT NOT NULL,
    summary_fr              TEXT NOT NULL DEFAULT '',
    summary_en              TEXT NOT NULL DEFAULT '',
    document_type           VARCHAR(40) NOT NULL
                            CHECK (document_type IN (
                                'report',
                                'study',
                                'guide',
                                'atlas',
                                'policy_brief',
                                'newsletter',
                                'conference_document',
                                'strategy',
                                'other'
                            )),
    fields                  TEXT[] NOT NULL DEFAULT '{}',
    publication_date        DATE NOT NULL,
    cover_image_path        VARCHAR(1000) NOT NULL DEFAULT '',
    cover_is_custom         BOOLEAN NOT NULL DEFAULT false,
    file_fr_path            VARCHAR(1000),
    file_fr_original_name   VARCHAR(500),
    file_fr_size            INT,
    file_en_path            VARCHAR(1000),
    file_en_original_name   VARCHAR(500),
    file_en_size            INT,
    is_published            BOOLEAN NOT NULL DEFAULT false,
    index_status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (index_status IN ('pending', 'processing', 'ready', 'failed')),
    index_error             TEXT NOT NULL DEFAULT '',
    index_started_at        TIMESTAMPTZ,
    indexed_at              TIMESTAMPTZ,
    active_index_version    UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (cardinality(fields) > 0),
    CHECK (fields <@ ARRAY['biodiversity', 'climate', 'water', 'land', 'institutional']::TEXT[]),
    CHECK (file_fr_path IS NOT NULL OR file_en_path IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_resources_publication_date ON resources (publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_resources_document_type ON resources (document_type);
CREATE INDEX IF NOT EXISTS idx_resources_fields ON resources USING GIN (fields);
CREATE INDEX IF NOT EXISTS idx_resources_published ON resources (is_published);
CREATE INDEX IF NOT EXISTS idx_resources_index_status ON resources (index_status, index_started_at);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id                  BIGSERIAL PRIMARY KEY,
    source_type         VARCHAR(20) NOT NULL
                        CHECK (source_type IN ('resource', 'news', 'project')),
    source_id           VARCHAR(64) NOT NULL,
    index_version       UUID NOT NULL,
    language            VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
    page_start          INT CHECK (page_start IS NULL OR page_start > 0),
    page_end            INT CHECK (page_end IS NULL OR page_end >= page_start),
    chunk_index         INT NOT NULL CHECK (chunk_index >= 0),
    content             TEXT NOT NULL,
    embedding           vector(1536) NOT NULL,
    embedding_model     VARCHAR(200) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_type, source_id, index_version, language, chunk_index),
    CHECK ((page_start IS NULL) = (page_end IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source
    ON knowledge_chunks (source_type, source_id, index_version);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
    ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
