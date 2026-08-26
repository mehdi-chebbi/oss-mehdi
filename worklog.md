# OSS CMS — Worklog & Roadmap

## Project Overview
Transform the OSS static site into a CMS-managed platform where non-technical admins can edit all content through a Drupal-style admin UI. Bilingual: French (FR) + English (EN).

---

## Bilingual Strategy (i18n)

**Approach:** Dual columns per text field (`title_fr` / `title_en`, `description_fr` / `description_en`, etc.)

Why this approach:
- Only 2 languages — no need for a complex translation table
- Simple queries — `SELECT title_fr, title_en FROM ...`
- Easy to spot missing translations at a glance (empty field)
- No joins, no JSON parsing

**Admin UI:**
- Each text field has a **FR / EN tab toggle**
- Switch tab to fill the other language
- Same form, toggled language

**Public site:**
- Frontend reads current locale from context (default: FR)
- API returns both columns, frontend picks `_fr` or `_en`
- Language switcher in navbar (already exists as FR/EN selector)

---

## Phase 1 — Backend: Database & API

### 1.1 Database tables
Create new tables in `init.sql` for all content sections.
All text fields are bilingual (`_fr` / `_en`).

- **pages** — id, slug, title_fr, title_en, created_at, updated_at
- **hero** — id, page_id, title_fr, title_en, subtitle_fr, subtitle_en, cta_primary_label_fr, cta_primary_label_en, cta_primary_link, cta_secondary_label_fr, cta_secondary_label_en, cta_secondary_link, background_image
- **stats** — id, page_id, label_fr, label_en, value, suffix, sort_order
- **fields** — id, page_id, title_fr, title_en, description_fr, description_en, image, gradient_hue, sort_order
- **news** — id, page_id, title_fr, title_en, excerpt_fr, excerpt_en, image, date, link, is_featured, sort_order
- **tools** — id, page_id, title_fr, title_en, description_fr, description_en, image, link, sort_order
- **partners** — id, page_id, name, image, row_number, sort_order
- **contact_info** — id, page_id, label_fr, label_en, value, sort_order
- **socials** — id, platform, url, icon_svg, sort_order
- **navigation** — id, label_fr, label_en, url, sort_order
- **site_settings** — id, key, value_fr, value_en (footer text, org name, etc.)
- **media** — id, filename, original_name, mime_type, size, url, uploaded_at

### 1.2 File upload system
- `POST /api/upload` — accept multipart file, store in `upload/` dir, return media record
- `GET /api/media` — list uploaded files
- `DELETE /api/media/:id` — delete file + record

### 1.3 Content CRUD APIs (per section)
For each content type:
- `GET /api/content/:section` — public read (no auth)
- `POST /api/content/:section` — admin create
- `PATCH /api/content/:section/:id` — admin update
- `DELETE /api/content/:section/:id` — admin delete

### 1.4 Content availability
- Created and updated content is immediately available through the public API.
- Resource indexing remains a separate technical status used only by the AI retrieval system.

---

## Phase 2 — Backend: Preview System

### 2.1 Preview tokens
- `POST /api/preview/generate` — admin creates a temporary preview token for a section + item
- Token stored in `preview_tokens` table with expiry (e.g. 30 min)
- `GET /api/preview/:token` — public endpoint that returns the item data (even if unpublished)

### 2.2 Preview flow
1. Admin clicks "Preview" → backend generates preview token
2. Frontend opens preview page with token in URL
3. Preview page fetches data via preview token
4. Preview page shows "Save" (publishes) and "Back to editing" buttons

---

## Phase 3 — Frontend: Admin UI

### 3.1 Admin layout
- Sidebar grouped by **page** (not by section)
- Each page expands to show its sections
- Example:
  ```
  📄 Home
    ├── Hero
    ├── Stats
    ├── Fields
    ├── News
    ├── Tools
    ├── Partners
    └── Contact
  📄 About (future)
    ├── ...
  ⚙️ Settings
    ├── Navigation
    ├── Socials
    └── Site Settings
  👥 Users (already done)
  ```
- Top bar with: current page name, "View Site" link, user avatar, logout

### 3.2 Section editors
Each section gets a form-based editor:
- **Text fields** — simple input with FR/EN tab toggle
- **Rich text** — WYSIWYG editor (TipTap) with FR/EN tab toggle for descriptions, excerpts
- **Image fields** — upload button + media library picker
- **Sort order** — drag-and-drop reordering
- **Action buttons** per item:
  - **Save** — saves and publishes (goes live)
  - **Preview** — opens preview page with preview token
  - **Cancel** — discards changes, returns to list

### 3.3 Media library
- Grid view of all uploaded files
- Upload new files
- Click to copy URL
- Delete unused files

### 3.4 WYSIWYG editor
- Integrate TipTap (headless, extensible, works great with React)
- Support: bold, italic, headings, lists, links, images
- Clean HTML output stored in DB
- Bilingual: separate FR/EN content for each rich text field

---

## Phase 4 — Frontend: Public Site

### 4.1 i18n setup
- Install react-i18next
- Create locale context with FR (default) and EN
- Language switcher in navbar (already exists, wire it up)
- API returns both `_fr` and `_en` columns, frontend picks based on current locale

### 4.2 Replace hardcoded data with API calls
- Remove `src/data/*.ts` hardcoded files
- Add `GET /api/content/:section` calls in each component
- Add loading skeletons
- Fallback to empty state if API fails

### 4.3 Dynamic pages
- `pages` table drives routing
- Home page always exists (slug: "home")
- Future pages rendered dynamically from DB content

---

## Phase 5 — Polish

### 5.1 Responsive admin
- Mobile-friendly admin sidebar (collapsible)
- Touch-friendly forms

### 5.2 Notifications
- Toast on save/publish/delete
- Confirmation dialogs for destructive actions

### 5.3 Audit log
- `audit_log` table: who changed what, when
- Optional but useful for multi-admin setups

---

## Current Status
- [x] Backend auth system (login, register, refresh, me)
- [x] Backend users CRUD (admin only, can't delete self)
- [x] Frontend login page
- [x] Frontend admin users CRUD page
- [x] Docker compose (postgres, backend, frontend)
- [x] Default admin seed (admin@oss.org / 123)
- [x] Bilingual strategy defined (dual columns _fr / _en)
- [ ] Phase 1 — Backend: Database & API
- [ ] Phase 2 — Backend: Preview system
- [ ] Phase 3 — Frontend: Admin UI
- [ ] Phase 4 — Frontend: Public site
- [ ] Phase 5 — Polish
