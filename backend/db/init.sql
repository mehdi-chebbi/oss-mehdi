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
-- News (Actualités)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS news (
    id              SERIAL PRIMARY KEY,
    page_id         INT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    title_fr        VARCHAR(500) NOT NULL,
    title_en        VARCHAR(500) NOT NULL,
    excerpt_fr      TEXT NOT NULL,
    excerpt_en      TEXT NOT NULL,
    image           VARCHAR(500) NOT NULL,
    date            DATE NOT NULL,
    link            VARCHAR(500) NOT NULL DEFAULT '#',
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    sort_order      INT NOT NULL DEFAULT 0,
    is_published    BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    icon_svg    TEXT NOT NULL,
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
