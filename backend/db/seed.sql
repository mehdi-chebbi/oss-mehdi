-- ═══════════════════════════════════════════════════════════════
-- OSS Seed Data — run manually: psql -f seed.sql
-- Assumes the schema from init.sql already exists (page_id = 1 for home).
-- ═══════════════════════════════════════════════════════════════

-- ── Fields (Nos domaines d'action) ──
INSERT INTO fields (page_id, title_fr, title_en, description_fr, description_en, image, gradient_hue, sort_order, is_published) VALUES
  (1,
   'Eau', 'Water',
   'Gestion durable des ressources en eau dans les zones arides et semi-arides du Sahara et du Sahel.',
   'Sustainable management of water resources in the arid and semi-arid zones of the Sahara and Sahel.',
   '/eau.jpg', 200, 1, true),

  (1,
   'Terre', 'Land',
   'Lutte contre la dégradation des terres et la désertification pour préserver les moyens de subsistance des populations.',
   'Combating land degradation and desertification to preserve the livelihoods of populations.',
   '/terre.jpg', 30, 2, true),

  (1,
   'Climat', 'Climate',
   'Adaptation au changement climatique et renforcement de la résilience des communautés et des écosystèmes.',
   'Adaptation to climate change and strengthening the resilience of communities and ecosystems.',
   '/climat.jpg', 10, 3, true),

  (1,
   'Biodiversité', 'Biodiversity',
   'Protection du patrimoine biologique et promotion d''une gestion intégrée des écosystèmes en Afrique.',
   'Protecting biological heritage and promoting integrated ecosystem management in Africa.',
   '/terre.jpg', 140, 4, true);


-- ── News (Actualités) ──
INSERT INTO news (title_fr, title_en, body_fr, body_en, images, thumbnail_index, date, slug, is_published) VALUES
  ('L''OSS et l''ICARDA renforcent leur coopération en faveur des zones arides',
   'OSS and ICARDA strengthen cooperation in favor of drylands',
   'L''Observatoire du Sahara et du Sahel (OSS) et le Centre international de recherche agricole dans les zones arides (ICARDA) ont renforcé leur coopération afin de répondre aux défis communs liés à la gestion durable des ressources naturelles dans les zones arides d''Afrique. Ce partenariat vise à développer des approches innovantes pour l''adaptation au changement climatique et la lutte contre la désertification.',
   'The Sahara and Sahel Observatory (OSS) and the International Center for Agricultural Research in the Dry Areas (ICARDA) have strengthened their cooperation to address common challenges related to sustainable natural resource management in Africa''s drylands. This partnership aims to develop innovative approaches for climate change adaptation and combating desertification.',
   '["/act1.jpg"]', 0, '2025-01-15', 'oss-icarda-cooperation-zones-arides', true),

  ('L''OSS a pris part à la session de renforcement et de mobilisation des financements pour promouvoir l''agroécologie',
   'OSS took part in the session on strengthening and mobilizing financing to promote agroecology',
   'L''OSS a participé activement à la session dédiée au renforcement des capacités et à la mobilisation des financements en faveur de l''agroécologie. Cette initiative s''inscrit dans le cadre des efforts continus de l''Observatoire pour promouvoir des pratiques agricoles durables et résilientes face aux défis environnementaux en Afrique.',
   'OSS actively participated in the session dedicated to capacity building and financing mobilization in favor of agroecology. This initiative is part of the Observatory''s ongoing efforts to promote sustainable and resilient agricultural practices in the face of environmental challenges in Africa.',
   '["/act2.jpg"]', 0, '2025-01-10', 'oss-session-mobilisation-financements-agroecologie', true),

  ('De l''engagement à l''action : renforcer la résilience climatique en Guinée-Bissau',
   'From commitment to action: strengthening climate resilience in Guinea-Bissau',
   'En collaboration avec ses partenaires, l''OSS accompagne la Guinée-Bissau dans le renforcement de sa résilience climatique. Ce projet illustre la transition d''engagements politiques vers des actions concrètes sur le terrain, intégrant les communautés locales dans l''adaptation aux impacts du changement climatique.',
   'In collaboration with its partners, OSS supports Guinea-Bissau in strengthening its climate resilience. This project illustrates the transition from political commitments to concrete actions on the ground, integrating local communities in adapting to the impacts of climate change.',
   '["/act3.jpg"]', 0, '2025-01-05', 'engagement-action-resilience-climatique-guinee-bissau', true),

  ('Deuxième réunion du Comité de pilotage du processus d''élaboration du premier rapport national sur la mise en œuvre du Protocole de Nagoya en Tunisie',
   'Second meeting of the Steering Committee for the development of the first national report on the implementation of the Nagoya Protocol in Tunisia',
   'La deuxième réunion du Comité de pilotage s''est tenue pour faire le point sur l''avancement du processus d''élaboration du premier rapport national tunisien sur la mise en œuvre du Protocole de Nagoya. Les participants ont examiné les progrès réalisés et défini les prochaines étapes pour finaliser ce rapport stratégique.',
   'The second Steering Committee meeting was held to review progress on developing Tunisia''s first national report on the implementation of the Nagoya Protocol. Participants examined the progress made and defined the next steps to finalize this strategic report.',
   '["/act4.jpg"]', 0, '2024-12-20', 'comite-pilotage-rapport-national-protocole-nagoya-tunisie', true);


-- ── Partners (top row = row_number 1, bottom row = row_number 2) ──
INSERT INTO partners (page_id, name, image, row_number, sort_order, is_published) VALUES
  -- Top row
  (1, 'Adaptation Fund',                'https://ecbi.org/sites/default/files/adaptation-fund-logo.png', 1, 1, true),
  (1, 'Green Climate Fund',            'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Green_Climate_Fund.svg/960px-Green_Climate_Fund.svg.png', 1, 2, true),
  (1, 'GEF',                           'https://www.thegef.org/sites/default/files/2023-04/GEF_logo_main_fullname_RGB_600x270_2023.png', 1, 3, true),
  (1, 'FFEM',                          'https://www.afd.fr/sites/default/files/styles/large/public/2025-06/ffem_logo_rvb-zoome.png.webp', 1, 4, true),
  (1, 'World Bank',                    'https://kanoacresal.org/wp-content/uploads/2024/08/world-bank-logo-1-1.webp', 1, 5, true),
  (1, 'African Union',                 'https://upload.wikimedia.org/wikipedia/commons/2/23/African_Union_logo.png', 1, 6, true),
  (1, 'African Development Bank',      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_Afrikanische_Entwicklungsbank.svg/1280px-Logo_Afrikanische_Entwicklungsbank.svg.png', 1, 7, true),
  (1, 'African Water Facility',        'https://archive.africanwaterfacility.org/sites/default/files/AWF-logo-large_300dpi%20transparent%20%281%29_2.png', 1, 8, true),
  (1, 'UNEP',                          'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/UNEP_logo.svg/330px-UNEP_logo.svg.png', 1, 9, true),

  -- Bottom row
  (1, 'COOP',                          'https://cl-coop-risktool.org/static/core/logo_coop.4ba0e51e9185.png', 2, 1, true),
  (1, 'GIZ',                           'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_Logo.svg/3840px-Deutsche_Gesellschaft_f%C3%BCr_Internationale_Zusammenarbeit_Logo.svg.png', 2, 2, true),
  (1, 'Ministère de l''Environnement du Climat et de la Biodiversité', 'https://adaimpact.lu/sites/default/files/2024-08/GOUV_Ministere_de_lEnvironnement_du_Climat__et_de_la_Biodiversite_Rouge-1024x269.png', 2, 3, true),
  (1, 'Swiss Confederation',           'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_der_Schweizerischen_Eidgenossenschaft.svg/960px-Logo_der_Schweizerischen_Eidgenossenschaft.svg.png', 2, 4, true),
  (1, 'European Union',               'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/960px-Flag_of_Europe.svg.png', 2, 5, true),
  (1, 'Europe et Étranger',           'https://upload.wikimedia.org/wikipedia/commons/1/1d/Logo_europe_etrangere_gouv.jpg', 2, 6, true),
  (1, 'Ministère de la Transition Écologique et Solidaire', 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/57/Minist%C3%A8re_de_la_Transition_%C3%89cologique_et_Solidaire_%28depuis_2017%29.svg/1920px-Minist%C3%A8re_de_la_Transition_%C3%89cologique_et_Solidaire_%28depuis_2017%29.svg.png', 2, 7, true),
  (1, 'AFD',                           'https://www.afd.fr/sites/afd/files/logo_0.png', 2, 8, true);


-- ── Tools (Nos outils) ──
INSERT INTO tools (page_id, title_fr, title_en, description_fr, description_en, image, link, sort_order, is_published) VALUES
  (1, 'MISLAND', 'MISLAND',
   'Un système intégré de surveillance de la dégradation des terres utilisant des données d''observation de la Terre pour fournir des informations.',
   'An integrated land degradation surveillance system using Earth observation data to provide information.',
   '/misland.jpg', 'http://misland-africa.oss-online.org', 1, true),

  (1, 'MISBAR', 'MISBAR',
   'Un système de suivi et de contrôle des aires irriguées, basé sur des données spatiales à haute résolution.',
   'A monitoring and control system for irrigated areas, based on high-resolution spatial data.',
   '/misbar.jpg', 'http://misbar.oss-online.org/', 2, true),

  (1, 'SAP-MR Complexe WAP', 'SAP-MR WAP Complex',
   'Un outil pour anticiper et gérer les risques liés à la sécheresse, aux inondations, aux feux de végétation et aux conflits homme-faune dans le complexe W-Arly-Pendjari.',
   'A tool for anticipating and managing risks related to drought, flooding, vegetation fires and human-wildlife conflicts in the W-Arly-Pendjari complex.',
   '/wap.jpg', 'http://sapmr.oss-online.org', 3, true),

  (1, 'Copernicea', 'Copernicea',
   'Une plateforme de mesure et de suivi du capital naturel et de la résilience des écosystèmes aux niveaux continental, national et local.',
   'A platform for measuring and monitoring natural capital and ecosystem resilience at continental, national and local levels.',
   '/copernicea.webp', 'http://copernicea.oss-online.org', 4, true),

  (1, 'Umbrella Seychelles', 'Umbrella Seychelles',
   'Une plateforme d''aide à la décision dédiée aux acteurs seychellois, pour la planification et le suivi de la neutralité de la dégradation des terres (NDT) à l''échelle nationale.',
   'A decision-support platform dedicated to Seychellois stakeholders, for planning and monitoring Land Degradation Neutrality (LDN) at the national scale.',
   '/umbrella-sych.webp', 'https://umbrella-sych.oss-online.org/', 5, true),

  (1, 'Umbrella Libya', 'Umbrella Libya',
   'Une plateforme d''aide à la décision dédiée aux acteurs libyens, pour la planification et le suivi de la neutralité de la dégradation des terres (NDT) à l''échelle nationale.',
   'A decision-support platform dedicated to Libyan stakeholders, for planning and monitoring Land Degradation Neutrality (LDN) at the national scale.',
   '/umbrella-lyb.webp', 'https://umbrella-lyb.oss-online.org/', 6, true),

  (1, 'Umbrella Tunisia', 'Umbrella Tunisia',
   'Une plateforme d''aide à la décision dédiée aux acteurs tunisiens, pour la planification et le suivi de la neutralité de la dégradation des terres (NDT) à l''échelle nationale.',
   'A decision-support platform dedicated to Tunisian stakeholders, for planning and monitoring Land Degradation Neutrality (LDN) at the national scale.',
   '/umbrella-tun.webp', 'https://umbrella-tun.oss-online.org/', 7, true),

  (1, 'LDN Africa', 'LDN Africa',
   'Une plateforme panafricaine d''aide à la décision, fournissant à l''ensemble des pays du continent des outils de planification et de suivi pour atteindre la neutralité de la dégradation des terres (NDT).',
   'A pan-African decision-support platform, providing all countries on the continent with planning and monitoring tools to achieve Land Degradation Neutrality (LDN).',
   '/ldn.webp', 'https://ldn-africa.oss-online.org/', 8, true),

  (1, 'Readiness Eritrea', 'Readiness Eritrea',
   'Une plateforme d''aide à la décision dédiée aux acteurs érythréens, développée dans le cadre du projet Readiness pour appuyer la planification environnementale et le suivi des actions sur le terrain.',
   'A decision-support platform dedicated to Eritrean stakeholders, developed under the Readiness project to support environmental planning and monitoring of field actions.',
   '/readiness-eritrea.webp', 'https://readiness-ery.oss-online.org/', 9, true);


-- ── Socials ──
INSERT INTO socials (platform, url, icon_svg, sort_order) VALUES
  ('facebook',  '#', 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', 1),

  ('x',         '#', 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', 2),

  ('linkedin',  '#', 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', 3),

  ('youtube',   '#', 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', 4),

  ('instagram', '#', 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', 5);
