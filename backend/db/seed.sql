-- ═══════════════════════════════════════════════════════════════
-- OSS Seed Data — run manually: psql -f seed.sql
-- Assumes the schema from init.sql already exists (page_id = 1 for home).
-- ═══════════════════════════════════════════════════════════════

-- ── Fields (Nos domaines d'action) ──
INSERT INTO fields (page_id, title_fr, title_en, description_fr, description_en, image, gradient_hue, sort_order) VALUES
  (1,
   'Eau', 'Water',
   'Gestion durable des ressources en eau dans les zones arides et semi-arides du Sahara et du Sahel.',
   'Sustainable management of water resources in the arid and semi-arid zones of the Sahara and Sahel.',
   '/eau.jpg', 200, 1),

  (1,
   'Terre', 'Land',
   'Lutte contre la dégradation des terres et la désertification pour préserver les moyens de subsistance des populations.',
   'Combating land degradation and desertification to preserve the livelihoods of populations.',
   '/terre.jpg', 30, 2),

  (1,
   'Climat', 'Climate',
   'Adaptation au changement climatique et renforcement de la résilience des communautés et des écosystèmes.',
   'Adaptation to climate change and strengthening the resilience of communities and ecosystems.',
   '/climat.jpg', 10, 3),

  (1,
   'Biodiversité', 'Biodiversity',
   'Protection du patrimoine biologique et promotion d''une gestion intégrée des écosystèmes en Afrique.',
   'Protecting biological heritage and promoting integrated ecosystem management in Africa.',
   '/hero.jpg', 140, 4);


-- ── News (Actualités) ──
INSERT INTO news (title_fr, title_en, body_fr, body_en, category, images, thumbnail_index, date, slug) VALUES
  ('L''OSS et l''ICARDA renforcent leur coopération en faveur des zones arides',
   'OSS and ICARDA strengthen cooperation in favor of drylands',
   'L''Observatoire du Sahara et du Sahel (OSS) et le Centre international de recherche agricole dans les zones arides (ICARDA) ont renforcé leur coopération afin de répondre aux défis communs liés à la gestion durable des ressources naturelles dans les zones arides d''Afrique. Ce partenariat vise à développer des approches innovantes pour l''adaptation au changement climatique et la lutte contre la désertification.',
   'The Sahara and Sahel Observatory (OSS) and the International Center for Agricultural Research in the Dry Areas (ICARDA) have strengthened their cooperation to address common challenges related to sustainable natural resource management in Africa''s drylands. This partnership aims to develop innovative approaches for climate change adaptation and combating desertification.',
   'partnership', '["/act1.jpg"]', 0, '2025-01-15', 'oss-icarda-cooperation-zones-arides'),

  ('L''OSS a pris part à la session de renforcement et de mobilisation des financements pour promouvoir l''agroécologie',
   'OSS took part in the session on strengthening and mobilizing financing to promote agroecology',
   'L''OSS a participé activement à la session dédiée au renforcement des capacités et à la mobilisation des financements en faveur de l''agroécologie. Cette initiative s''inscrit dans le cadre des efforts continus de l''Observatoire pour promouvoir des pratiques agricoles durables et résilientes face aux défis environnementaux en Afrique.',
   'OSS actively participated in the session dedicated to capacity building and financing mobilization in favor of agroecology. This initiative is part of the Observatory''s ongoing efforts to promote sustainable and resilient agricultural practices in the face of environmental challenges in Africa.',
   'event', '["/act2.jpg"]', 0, '2025-01-10', 'oss-session-mobilisation-financements-agroecologie'),

  ('De l''engagement à l''action : renforcer la résilience climatique en Guinée-Bissau',
   'From commitment to action: strengthening climate resilience in Guinea-Bissau',
   'En collaboration avec ses partenaires, l''OSS accompagne la Guinée-Bissau dans le renforcement de sa résilience climatique. Ce projet illustre la transition d''engagements politiques vers des actions concrètes sur le terrain, intégrant les communautés locales dans l''adaptation aux impacts du changement climatique.',
   'In collaboration with its partners, OSS supports Guinea-Bissau in strengthening its climate resilience. This project illustrates the transition from political commitments to concrete actions on the ground, integrating local communities in adapting to the impacts of climate change.',
   'project', '["/act3.jpg"]', 0, '2025-01-05', 'engagement-action-resilience-climatique-guinee-bissau'),

  ('Deuxième réunion du Comité de pilotage du processus d''élaboration du premier rapport national sur la mise en œuvre du Protocole de Nagoya en Tunisie',
   'Second meeting of the Steering Committee for the development of the first national report on the implementation of the Nagoya Protocol in Tunisia',
   'La deuxième réunion du Comité de pilotage s''est tenue pour faire le point sur l''avancement du processus d''élaboration du premier rapport national tunisien sur la mise en œuvre du Protocole de Nagoya. Les participants ont examiné les progrès réalisés et défini les prochaines étapes pour finaliser ce rapport stratégique.',
   'The second Steering Committee meeting was held to review progress on developing Tunisia''s first national report on the implementation of the Nagoya Protocol. Participants examined the progress made and defined the next steps to finalize this strategic report.',
   'institutional', '["/act4.jpg"]', 0, '2024-12-20', 'comite-pilotage-rapport-national-protocole-nagoya-tunisie');


-- ── Partners (top row = row_number 1, bottom row = row_number 2) ──
INSERT INTO partners (page_id, name, image, row_number, sort_order) VALUES
  -- Top row
  (1, 'Adaptation Fund',                '/logo/adaptation-fund.png', 1, 1),
  (1, 'Green Climate Fund',            '/logo/green-climate-fund.png', 1, 2),
  (1, 'GEF',                           '/logo/gef.avif', 1, 3),
  (1, 'FFEM',                          '/logo/ffem.webp', 1, 4),
  (1, 'World Bank',                    '/logo/world-bank.webp', 1, 5),
  (1, 'African Union',                 '/logo/african-union.png', 1, 6),
  (1, 'African Development Bank',      '/logo/african-development-bank.png', 1, 7),
  (1, 'African Water Facility',        '/logo/awf.png', 1, 8),
  (1, 'UNEP',                          '/logo/unep.png', 1, 9),

  -- Bottom row
  (1, 'COOP',                          '/logo/coop.png', 2, 1),
  (1, 'GIZ',                           '/logo/giz.png', 2, 2),
  (1, 'Ministère de l''Environnement du Climat et de la Biodiversité', '/logo/luxembourg-environment.png', 2, 3),
  (1, 'Swiss Confederation',           '/logo/swiss-confederation.svg', 2, 4),
  (1, 'European Union',               '/logo/european-union.svg', 2, 5),
  (1, 'Europe et Étranger',           '/logo/europe-foreign-affairs.jpg', 2, 6),
  (1, 'Ministère de la Transition Écologique et Solidaire', '/logo/france-ecological-transition.svg', 2, 7),
  (1, 'AFD',                           '/logo/afd.png', 2, 8);


-- ── Tools (Nos outils) ──
INSERT INTO tools (page_id, title_fr, title_en, description_fr, description_en, image, link, sort_order) VALUES
  (1, 'MISLAND', 'MISLAND',
   'Un système intégré de surveillance de la dégradation des terres utilisant des données d''observation de la Terre pour fournir des informations.',
   'An integrated land degradation surveillance system using Earth observation data to provide information.',
   '/misland.jpg', 'http://misland-africa.oss-online.org', 1),

  (1, 'MISBAR', 'MISBAR',
   'Un système de suivi et de contrôle des aires irriguées, basé sur des données spatiales à haute résolution.',
   'A monitoring and control system for irrigated areas, based on high-resolution spatial data.',
   '/misbar.jpg', 'http://misbar.oss-online.org/', 2),

  (1, 'SAP-MR Complexe WAP', 'SAP-MR WAP Complex',
   'Un outil pour anticiper et gérer les risques liés à la sécheresse, aux inondations, aux feux de végétation et aux conflits homme-faune dans le complexe W-Arly-Pendjari.',
   'A tool for anticipating and managing risks related to drought, flooding, vegetation fires and human-wildlife conflicts in the W-Arly-Pendjari complex.',
   '/wap.jpg', 'http://sapmr.oss-online.org', 3),

  (1, 'Copernicea', 'Copernicea',
   'Une plateforme de mesure et de suivi du capital naturel et de la résilience des écosystèmes aux niveaux continental, national et local.',
   'A platform for measuring and monitoring natural capital and ecosystem resilience at continental, national and local levels.',
   '/copernicea.webp', 'http://copernicea.oss-online.org', 4),

  (1, 'Umbrella Seychelles', 'Umbrella Seychelles',
   'Une plateforme d''aide à la décision dédiée aux acteurs seychellois, pour la planification et le suivi de la neutralité de la dégradation des terres (NDT) à l''échelle nationale.',
   'A decision-support platform dedicated to Seychellois stakeholders, for planning and monitoring Land Degradation Neutrality (LDN) at the national scale.',
   '/umbrella-sych.webp', 'https://umbrella-sych.oss-online.org/', 5),

  (1, 'Umbrella Libya', 'Umbrella Libya',
   'Une plateforme d''aide à la décision dédiée aux acteurs libyens, pour la planification et le suivi de la neutralité de la dégradation des terres (NDT) à l''échelle nationale.',
   'A decision-support platform dedicated to Libyan stakeholders, for planning and monitoring Land Degradation Neutrality (LDN) at the national scale.',
   '/umbrella-lyb.webp', 'https://umbrella-lyb.oss-online.org/', 6),

  (1, 'Umbrella Tunisia', 'Umbrella Tunisia',
   'Une plateforme d''aide à la décision dédiée aux acteurs tunisiens, pour la planification et le suivi de la neutralité de la dégradation des terres (NDT) à l''échelle nationale.',
   'A decision-support platform dedicated to Tunisian stakeholders, for planning and monitoring Land Degradation Neutrality (LDN) at the national scale.',
   '/umbrella-tun.webp', 'https://umbrella-tun.oss-online.org/', 7),

  (1, 'LDN Africa', 'LDN Africa',
   'Une plateforme panafricaine d''aide à la décision, fournissant à l''ensemble des pays du continent des outils de planification et de suivi pour atteindre la neutralité de la dégradation des terres (NDT).',
   'A pan-African decision-support platform, providing all countries on the continent with planning and monitoring tools to achieve Land Degradation Neutrality (LDN).',
   '/ldn.webp', 'https://ldn-africa.oss-online.org/', 8),

  (1, 'Readiness Eritrea', 'Readiness Eritrea',
   'Une plateforme d''aide à la décision dédiée aux acteurs érythréens, développée dans le cadre du projet Readiness pour appuyer la planification environnementale et le suivi des actions sur le terrain.',
   'A decision-support platform dedicated to Eritrean stakeholders, developed under the Readiness project to support environmental planning and monitoring of field actions.',
   '/readiness-eritrea.webp', 'https://readiness-ery.oss-online.org/', 9);


-- ── Departments — Climate ──
INSERT INTO departments (title_fr, title_en, description_fr, description_en, slug, sort_order) VALUES
  ('Département Climat',
   'Climate Department',
   'Rapport d''activité 2025 & Programme d''activité 2026 — Observatoire du Sahara et du Sahel (OSS)',
   '2025 Activity Report & 2026 Activity Program — Sahara and Sahel Observatory (OSS)',
   'climate-department',
   1);


-- ── Projects — Climate Department ──
INSERT INTO projects (department_id, title_fr, title_en, description_fr, description_en, image, year_start, year_end, status, budget, slug, sort_order) VALUES
  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'DRESS-EA : Renforcement de la résilience à la sécheresse des petits exploitants agricoles et pasteurs dans la région de l''IGAD',
   'DRESS-EA: Strengthening drought resilience of smallholder farmers and pastoralists in the IGAD region',
   'Pays : Djibouti, Kenya, Soudan, Ouganda. Résultats clés 2025 : Harmonisation régionale des SAP, infrastructures météo équipées, ~1800 ménages desservis par infrastructures hydrauliques, distribution de chèvres et semences résistantes, 5 notes politiques transversales. Programme 2026 : Réhabilitation de haffiers, système micro-irrigation, renforcement du système d''alerte précoce, assurance contre la sécheresse.',
   'Countries: Djibouti, Kenya, Sudan, Uganda. Key results 2025: Regional harmonization of EWs, equipped weather infrastructure, ~1800 households served by water infrastructures, distribution of goats and resistant seeds, 5 cross-cutting policy briefs. 2026 Program: Rehabilitation of haffirs, micro-irrigation system, strengthening of early warning system, drought insurance.',
   '',
   2020, 2026, 'en_cours',
   '13 079,54 KUS$ (FA)',
   'dress-ea-drought-resilience',
   1),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'ADSWAC : Renforcement de la capacité d''adaptation au changement climatique des communautés du Sud-Ouest de l''Afrique touchées par la sécheresse',
   'ADSWAC: Strengthening the climate change adaptation capacity of drought-affected communities in South-West Africa',
   'Pays : Angola, Namibie. Résultats clés 2025 : 130 structures communautaires formées, 130 parcelles modèles confirmées, construction des Centres d''Action contre le Changement Climatique. Programme 2026 : Achèvement des infrastructures hydriques, lancement des activités génératrices de revenus, microfinance, production agroécologique.',
   'Countries: Angola, Namibia. Key results 2025: 130 community structures trained, 130 model plots confirmed, construction of Climate Change Action Centers. 2026 Program: Completion of water infrastructures, launch of income-generating activities, microfinance, agroecological production.',
   '',
   NULL, NULL, 'en_cours',
   '11 941,038 KUS$ (FA)',
   'adswac-climate-adaptation',
   2),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'RICOWAS : Mise à l''échelle de la production de riz résiliente au climat en Afrique de l''Ouest',
   'RICOWAS: Scaling up climate-resilient rice production in West Africa',
   'Pays : Bénin, Burkina Faso, Côte d''Ivoire, Gambie, Ghana, Guinée, Liberia, Mali, Niger, Nigeria, Sénégal, Sierra Leone, Togo. Résultats clés 2025 : 2e atelier ToT régional, ~300 formateurs nationaux formés, 8 682 producteurs renforcés sur le SRI. Programme 2026 : Finalisation de la revue à mi-parcours, intensification du modèle de formation en cascade, partenariats public-privé.',
   'Countries: Benin, Burkina Faso, Ivory Coast, Gambia, Ghana, Guinea, Liberia, Mali, Niger, Nigeria, Senegal, Sierra Leone, Togo. Key results 2025: 2nd regional ToT workshop, ~300 national trainers trained, 8,682 producers strengthened on SRI. 2026 Program: Finalization of the mid-term review, intensification of the cascade training model, public-private partnerships.',
   '',
   NULL, NULL, 'en_cours',
   '14 000 KUS$ (FA)',
   'ricowas-climate-resilient-rice',
   3),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'APICA-GNB : Adaptation des systèmes de production agricole dans les zones côtières du Nord-Ouest de la Guinée-Bissau',
   'APICA-GNB: Adaptation of agricultural production systems in the coastal zones of North-West Guinea-Bissau',
   'Pays : Guinée-Bissau (Oio & Cacheu). Résultats clés 2025 : Entrée en phase d''exécution opérationnelle, études de référence, 2 Groupes d''Observation mis en place. Programme 2026 : Création des CCC, opérationnalisation des Groupes d''Observation, serres de multiplication des plants de mangrove, restauration écologique.',
   'Countries: Guinea-Bissau (Oio & Cacheu). Key results 2025: Entry into operational execution phase, baseline studies, 2 Observation Groups established. 2026 Program: Creation of CCCs, operationalization of Observation Groups, mangrove plant multiplication greenhouses, ecological restoration.',
   '',
   NULL, NULL, 'en_cours',
   '9 955 KUS$ (FA)',
   'apica-gnb-coastal-agriculture',
   4),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'Readiness Libye 2 : Renforcer les capacités institutionnelles, humaines et techniques du système libyen de financement climatique',
   'Readiness Libya 2: Strengthening the institutional, human and technical capacities of the Libyan climate finance system',
   'Pays : Libye. Résultats clés 2025 : Élaboration du programme national GCF finalisée, 2 notes secteur public préparées, cadre national de suivi mis en place. Programme 2026 : Mise en œuvre du programme national GCF, accompagnement pour accréditation, structuration du cadre MRV.',
   'Countries: Libya. Key results 2025: Finalization of the national GCF program, 2 public sector concept notes prepared, national monitoring framework established. 2026 Program: Implementation of the national GCF program, accreditation support, structuring of the MRV framework.',
   '',
   NULL, NULL, 'en_cours',
   '765 KUS$ (GCF)',
   'readiness-libya-2',
   5),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'Readiness Érythrée 1 : Renforcement des capacités institutionnelles, humaines et techniques du système érythréen de financement climatique',
   'Readiness Eritrea 1: Strengthening the institutional, human and technical capacities of the Eritrean climate finance system',
   'Pays : Érythrée. Résultats clés 2025 : Secrétariat AND mis en place, atelier national sur procédures GCF, mécanisme de non-objection développé. Programme 2026 : Développement du programme pays GCF, accompagnement des entités identifiées pour accréditation, élaboration de 2 notes conceptuelles.',
   'Countries: Eritrea. Key results 2025: NDA Secretariat established, national workshop on GCF procedures, no-objection mechanism developed. 2026 Program: Development of the GCF country program, support for identified entities for accreditation, development of 2 concept notes.',
   '',
   2024, 2025, 'en_cours',
   '319 KUS$ (GCF)',
   'readiness-eritrea-1',
   6),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'CREW Angola : Autonomisation des groupes de femmes pour renforcer la résilience aux impacts climatiques dans la province de Cunene, Sud-Ouest de l''Angola',
   'CREW Angola: Empowering women''s groups to strengthen resilience to climate impacts in Cunene province, South-West Angola',
   'Pays : Angola (Cunene). Résultats 2025 : Projet approuvé par le GCF, planification des activités 2026. Programme 2026 : Atelier de lancement, équipe, études de base, mapping bénéficiaires.',
   'Countries: Angola (Cunene). Results 2025: Project approved by the GCF, planning of 2026 activities. 2026 Program: Launch workshop, team, baseline studies, beneficiary mapping.',
   '',
   2025, 2029, 'en_cours',
   '10 000 000 US$ (GCF)',
   'crew-angola',
   7),

  ((SELECT id FROM departments WHERE slug = 'climate-department'),
   'CCAILSO : Adaptation au changement climatique pour l''amélioration des moyens de subsistance dans l''oasis de Siwa',
   'CCAILSO: Climate change adaptation for livelihoods improvement in the Siwa oasis',
   'Pays : Égypte (Oasis de Siwa). Résultats 2025 : Projet approuvé par le FA, planification des activités 2026. Programme 2026 : Atelier de lancement, équipe, études de base, mapping bénéficiaires.',
   'Countries: Egypt (Siwa Oasis). Results 2025: Project approved by the FA, planning of 2026 activities. 2026 Program: Launch workshop, team, baseline studies, beneficiary mapping.',
   '',
   NULL, NULL, 'en_cours',
   '8 000 000 US$ (FA)',
   'ccailso-siwa-oasis',
   8);


-- ── Departments — Technology, Information and Remote Sensing ──
INSERT INTO departments (title_fr, title_en, description_fr, description_en, slug, sort_order) VALUES
  ('Département Technologie, Information et Télédétection',
   'Department of Technology, Information and Remote Sensing',
   'Rapport d''activité 2025 & Programme d''activité 2026 — Observatoire du Sahara et du Sahel (OSS). Démarche stratégique intégrée pour transformer la donnée environnementale en appui direct à la décision, s''appuyant sur des services géospatiaux, le cloud computing et l''intelligence artificielle.',
   '2025 Activity Report & 2026 Activity Program — Sahara and Sahel Observatory (OSS). Integrated strategic approach to transform environmental data into direct decision support, relying on geospatial services, cloud computing and artificial intelligence.',
   'technology-information-remote-sensing',
   2);


-- ── Projects — Technology, Information and Remote Sensing ──
INSERT INTO projects (department_id, title_fr, title_en, description_fr, description_en, image, year_start, year_end, status, budget, slug, sort_order) VALUES
  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'GMES : Appui à la gestion durable de l''eau et des ressources naturelles à travers la valorisation des données et technologies d''Observation de la Terre',
   'GMES: Support for sustainable water and natural resource management through the valorization of Earth Observation data and technologies',
   'Résultats clés 2025 : FarmBot (outil de diagnostic des maladies des cultures), lancement de MISLAND-Africa (plateforme de suivi de la dégradation des terres, application mobile, plugin QGIS, réseau JIN de plus de 275 experts, versions nationales déployées en Égypte et Mauritanie). Programme 2026 : Désignation par la CNULCD comme partenaire technique régional pour 26 pays africains pour le rapportage ODD 15.3.1, cartographie continentale, formation des formateurs, opérationnalisation du FarmBot, hackathons.',
   'Key results 2025: FarmBot (crop disease diagnostic tool), launch of MISLAND-Africa (land degradation monitoring platform, mobile application, QGIS plugin, JIN network of over 275 experts, national versions deployed in Egypt and Mauritania). 2026 Program: Designation by UNCCD as regional technical partner for 26 African countries for SDG 15.3.1 reporting, continental mapping, training of trainers, operationalization of FarmBot, hackathons.',
   '',
   2022, 2025, 'cloture',
   '1 700 K€ (UA)',
   'gmes-earth-observation',
   1),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Digital Earth Africa : Renforcement des capacités en Observation de la Terre',
   'Digital Earth Africa: Capacity building in Earth Observation',
   'Pays : Burkina Faso, Tunisie. Résultats clés 2025 : Mise en place de communautés d''utilisateurs, plus de 160 experts et décideurs formés, développement de scripts pour le suivi de la dégradation des terres, ateliers nationaux sur l''Observation de la Terre, le cloud computing et l''IA.',
   'Countries: Burkina Faso, Tunisia. Key results 2025: Establishment of user communities, over 160 experts and decision-makers trained, development of scripts for land degradation monitoring, national workshops on Earth Observation, cloud computing and AI.',
   '',
   2021, 2023, 'en_cours',
   '300 K$ australiens (Geoscience Australia–SANSA)',
   'digital-earth-africa',
   2),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Partenariat OSS/AIR-CAS : Suivi et évaluation des ressources en eau et de leur utilisation à des fins agricoles en Tunisie',
   'OSS/AIR-CAS Partnership: Monitoring and evaluation of water resources and their agricultural use in Tunisia',
   'Pays : Tunisie. Partenaire : Aerospace Information Research Institute (AIR-CAS). Résultats clés 2025 : Plateforme WaterMap N-Africa pour la diffusion de données géospatiales sur les besoins en eau des cultures et l''efficacité de l''utilisation agricole à échelle décadaire, session de formation sur le suivi de l''eau agricole.',
   'Countries: Tunisia. Partner: Aerospace Information Research Institute (AIR-CAS). Key results 2025: WaterMap N-Africa platform for the dissemination of geospatial data on crop water needs and agricultural use efficiency at a decadal scale, training session on agricultural water monitoring.',
   '',
   NULL, NULL, 'en_cours',
   '',
   'oss-air-cas-watermap',
   3),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Transformation numérique — Systèmes et applications d''aide à la décision',
   'Digital transformation — Decision support systems and applications',
   'Résultats clés 2025 : Développement de plateformes décisionnelles incluant la gestion des appels d''offres, l''inventaire informatique, la gestion électronique des documents (GED), le suivi de la dégradation des terres au Sahel (15 pays) et la dissémination des résultats AdaptWAP.',
   'Key results 2025: Development of decision support platforms including tender management, IT inventory, electronic document management (EDM), land degradation monitoring in the Sahel (15 countries) and AdaptWAP results dissemination.',
   '',
   NULL, NULL, 'en_cours',
   '',
   'digital-transformation-decision-support',
   4),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Programme Veille et Prospective (V&P) : Livre documentaire sur le changement climatique en Afrique',
   'Monitoring and Foresight Program (M&F): Documentary book on climate change in Africa',
   'Résultats 2025 : Progrès majeurs dans la conception et la production de l''ouvrage avec une approche participative, intégration d''exemples concrets d''adaptation et d''innovation africaines. Programme 2026 : Publication du livre lors d''événements OSS et production d''un policy brief.',
   'Key results 2025: Major progress in the design and production of the book with a participatory approach, integration of concrete examples of African adaptation and innovation. 2026 Program: Publication of the book during OSS events and production of a policy brief.',
   '',
   NULL, NULL, 'en_cours',
   '',
   'monitoring-foresight-climate-book',
   5),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Écosystèmes et adaptation au changement climatique au Maghreb/Sahel',
   'Ecosystems and climate change adaptation in the Maghreb/Sahel',
   'Résultats 2025 : Fédération des communautés autour de la GDT et de l''adaptation au CC, plaidoyer pour la préservation des écosystèmes, diffusion des messages lors d''événements internationaux (GISS, UICN). Programme 2026 : Renforcement de la diffusion des outils de plaidoyer et production d''une vidéo documentaire.',
   'Key results 2025: Federation of communities around DLDD and CC adaptation, advocacy for ecosystem preservation, dissemination of messages at international events (GISS, IUCN). 2026 Program: Strengthening the dissemination of advocacy tools and production of a documentary video.',
   '',
   NULL, 2026, 'en_cours',
   '120 K€ (AFD — COPAR)',
   'ecosystems-climate-adaptation-maghreb-sahel',
   6),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Notes de synthèse, articles thématiques et mise en débat des connaissances',
   'Summary notes, thematic articles and knowledge debate',
   'Résultats 2025 : Publication d''articles thématiques (sécurité hydrique, biodiversité, pollution plastique), production d''un compendium sur les solutions fondées sur la nature, documents sur le méthane, engagement dans le consortium IYRP pour la région MENA. Programme 2026 : Production de notes d''orientation et contribution au Consortium IYRP 2026.',
   'Key results 2025: Publication of thematic articles (water security, biodiversity, plastic pollution), production of a compendium on nature-based solutions, documents on methane, engagement in the IYRP consortium for the MENA region. 2026 Program: Production of policy notes and contribution to the 2026 IYRP Consortium.',
   '',
   NULL, NULL, 'en_cours',
   '',
   'knowledge-notes-thematic-articles',
   7),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Développement de requêtes de projets',
   'Development of project proposals',
   'Résultats 2025 : Soumission à l''AFD (programme AdaptAction) d''une proposition de projet pour renforcer la résilience des systèmes alimentaires en Afrique du Nord et au Moyen-Orient par la co-création de connaissances et la valorisation des savoirs locaux face au stress hydrique et au changement climatique.',
   'Key results 2025: Submission to AFD (AdaptAction program) of a project proposal to strengthen the resilience of food systems in North Africa and the Middle East through the co-creation of knowledge and the valorization of local knowledge in the face of water stress and climate change.',
   '',
   NULL, NULL, 'en_cours',
   '',
   'project-proposal-development',
   8),

  ((SELECT id FROM departments WHERE slug = 'technology-information-remote-sensing'),
   'Évaluation à mi-parcours de la Stratégie 2030',
   'Mid-term evaluation of the 2030 Strategy',
   'Résultats 2025 : Évaluation externe et indépendante couvrant la période 2020–2024, appréciation du degré de réalisation des objectifs, vérification de la pertinence et efficacité de la Stratégie 2030. Programme 2026 : Ajustement du cadre stratégique, consolidation du programme de veille et prospective, accélération de la mobilisation de la finance climat.',
   'Key results 2025: External and independent evaluation covering the 2020–2024 period, assessment of the degree of achievement of objectives, verification of the relevance and effectiveness of the 2030 Strategy. 2026 Program: Adjustment of the strategic framework, consolidation of the monitoring and foresight program, acceleration of climate finance mobilization.',
   '',
   NULL, NULL, 'en_cours',
   '',
   'strategy-2030-mid-term-evaluation',
   9);


-- ── Beneficiary countries for seeded projects ──
UPDATE projects AS p
SET beneficiary_country_codes = mapping.country_codes
FROM (VALUES
  ('dress-ea-drought-resilience', ARRAY['DJ', 'KE', 'SD', 'UG']::TEXT[]),
  ('adswac-climate-adaptation', ARRAY['AO', 'NA']::TEXT[]),
  ('ricowas-climate-resilient-rice', ARRAY['BJ', 'BF', 'CI', 'GM', 'GH', 'GN', 'LR', 'ML', 'NE', 'NG', 'SN', 'SL', 'TG']::TEXT[]),
  ('apica-gnb-coastal-agriculture', ARRAY['GW']::TEXT[]),
  ('readiness-libya-2', ARRAY['LY']::TEXT[]),
  ('readiness-eritrea-1', ARRAY['ER']::TEXT[]),
  ('crew-angola', ARRAY['AO']::TEXT[]),
  ('ccailso-siwa-oasis', ARRAY['EG']::TEXT[]),
  ('gmes-earth-observation', ARRAY['DZ', 'EG', 'LY', 'MA', 'MR', 'TN']::TEXT[]),
  ('digital-earth-africa', ARRAY['BF', 'TN']::TEXT[]),
  ('oss-air-cas-watermap', ARRAY['TN']::TEXT[]),
  ('digital-transformation-decision-support', ARRAY['BF', 'TD', 'ML', 'MR', 'NE', 'SN']::TEXT[]),
  ('monitoring-foresight-climate-book', ARRAY['DZ', 'EG', 'KE', 'SN', 'TN', 'ZA']::TEXT[]),
  ('ecosystems-climate-adaptation-maghreb-sahel', ARRAY['DZ', 'ML', 'MA', 'MR', 'NE', 'TN']::TEXT[]),
  ('knowledge-notes-thematic-articles', ARRAY['EG', 'MR', 'SN', 'TN']::TEXT[]),
  ('project-proposal-development', ARRAY['DZ', 'EG', 'LY', 'MA', 'TN']::TEXT[]),
  ('strategy-2030-mid-term-evaluation', ARRAY['DZ', 'MA', 'MR', 'SN', 'TN']::TEXT[])
) AS mapping(project_slug, country_codes)
WHERE p.slug = mapping.project_slug;


-- ── Department - Land and Biodiversity ──
INSERT INTO departments (title_fr, title_en, description_fr, description_en, slug, sort_order) VALUES
  ('Département Terre et Biodiversité',
   'Land and Biodiversity Department',
   'Préserver la biodiversité, restaurer les écosystèmes et renforcer la résilience des territoires et des communautés.',
   'Preserving biodiversity, restoring ecosystems and strengthening the resilience of territories and communities.',
   'land-biodiversity-department',
   3);

-- ── Department - Water ──
INSERT INTO departments (title_fr, title_en, description_fr, description_en, slug, sort_order) VALUES
  ('Département Eau',
   'Water Department',
   'Améliorer la connaissance, la gouvernance et la gestion durable des ressources en eau souterraines et de surface.',
   'Improving knowledge, governance and sustainable management of groundwater and surface water resources.',
   'water-department',
   4);


-- ── Project editorial content — overviews and results ──
UPDATE projects
SET description_fr = 'DRESS-EA accompagne les petits exploitants et les communautés pastorales de Djibouti, du Kenya, du Soudan et de l’Ouganda face à des sécheresses plus fréquentes. Le projet associe systèmes d’alerte précoce, services météorologiques, infrastructures hydrauliques et solutions agricoles adaptées afin de sécuriser durablement les moyens de subsistance. En 2026, l’action se concentre sur la réhabilitation des haffirs, la micro-irrigation et l’assurance contre la sécheresse.',
    description_en = 'DRESS-EA supports smallholder farmers and pastoral communities in Djibouti, Kenya, Sudan and Uganda as droughts become more frequent. The project combines early warning systems, weather services, water infrastructure and adapted agricultural solutions to protect livelihoods over the long term. In 2026, activities focus on rehabilitating haffirs, expanding micro-irrigation and developing drought insurance.',
    results_fr = 'L’harmonisation régionale des systèmes d’alerte précoce a progressé et plusieurs infrastructures météorologiques ont été équipées. Environ 1 800 ménages bénéficient désormais d’infrastructures hydrauliques. Des chèvres et des semences résistantes ont été distribuées, tandis que cinq notes politiques transversales ont été produites pour soutenir la décision publique.',
    results_en = 'Regional harmonization of early warning systems advanced and several weather facilities were equipped. Around 1,800 households now benefit from water infrastructure. Goats and drought-resistant seeds were distributed, while five cross-cutting policy briefs were produced to support public decision-making.'
WHERE slug = 'dress-ea-drought-resilience';

UPDATE projects
SET description_fr = 'ADSWAC renforce la capacité d’adaptation des communautés rurales exposées à la sécheresse en Angola et en Namibie. Son approche relie organisation communautaire, démonstration agricole, accès à l’eau et développement d’activités génératrices de revenus. Le programme 2026 prévoit l’achèvement des infrastructures hydriques, le déploiement de solutions de microfinance et l’intensification de la production agroécologique.',
    description_en = 'ADSWAC strengthens the adaptive capacity of drought-exposed rural communities in Angola and Namibia. Its approach connects community organization, agricultural demonstration, access to water and income-generating activities. The 2026 program will complete water infrastructure, deploy microfinance solutions and scale up agroecological production.',
    results_fr = 'Cent trente structures communautaires ont été formées et 130 parcelles modèles ont été confirmées comme espaces de démonstration et d’apprentissage. La construction des Centres d’Action contre le Changement Climatique a également été engagée, créant des points d’appui durables pour les communautés ciblées.',
    results_en = 'A total of 130 community structures were trained and 130 model plots were confirmed as demonstration and learning sites. Construction of Climate Change Action Centers also began, creating lasting support hubs for the targeted communities.'
WHERE slug = 'adswac-climate-adaptation';

UPDATE projects
SET description_fr = 'RICOWAS accompagne treize pays d’Afrique de l’Ouest dans la diffusion d’une riziculture plus productive et plus résiliente au climat. Le programme s’appuie sur le Système de Riziculture Intensive, la formation en cascade et la mise en réseau des institutions, des formateurs et des producteurs. La prochaine étape porte sur la revue à mi-parcours et le renforcement des partenariats public-privé.',
    description_en = 'RICOWAS supports thirteen West African countries in scaling up rice production that is both more productive and more climate resilient. The program relies on the System of Rice Intensification, cascade training and stronger networks connecting institutions, trainers and producers. The next phase focuses on the mid-term review and expanded public-private partnerships.',
    results_fr = 'Le deuxième atelier régional de formation des formateurs a été organisé. Près de 300 formateurs nationaux ont renforcé leurs compétences et 8 682 producteurs ont été accompagnés dans l’application du Système de Riziculture Intensive, élargissant la base technique nécessaire au passage à l’échelle.',
    results_en = 'The second regional training-of-trainers workshop was completed. Nearly 300 national trainers strengthened their skills and 8,682 producers received support in applying the System of Rice Intensification, expanding the technical base required for scaling up.'
WHERE slug = 'ricowas-climate-resilient-rice';

UPDATE projects
SET description_fr = 'APICA-GNB soutient l’adaptation des systèmes agricoles dans les zones côtières d’Oio et de Cacheu, en Guinée-Bissau. Le projet articule production agricole, observation communautaire, restauration des mangroves et gouvernance locale afin de réduire la vulnérabilité des territoires côtiers. Les activités 2026 prévoient notamment la création de centres communautaires et de serres de multiplication de plants.',
    description_en = 'APICA-GNB supports the adaptation of agricultural systems in the coastal regions of Oio and Cacheu in Guinea-Bissau. The project connects agricultural production, community observation, mangrove restoration and local governance to reduce coastal vulnerability. Activities planned for 2026 include community centers and nurseries for propagating mangrove plants.',
    results_fr = 'Le projet est entré dans sa phase d’exécution opérationnelle. Les études de référence ont été lancées et deux Groupes d’Observation ont été mis en place, fournissant les premières structures locales nécessaires au suivi des changements et à la préparation des actions de restauration.',
    results_en = 'The project entered its operational implementation phase. Baseline studies were launched and two Observation Groups were established, providing the first local structures needed to monitor change and prepare restoration activities.'
WHERE slug = 'apica-gnb-coastal-agriculture';

UPDATE projects
SET description_fr = 'Readiness Libye 2 consolide les capacités institutionnelles, humaines et techniques nécessaires à un système national de financement climatique plus opérationnel. L’intervention accompagne la programmation avec le Fonds vert pour le climat, la préparation de projets, l’accréditation des entités et la structuration d’un cadre national de mesure, rapportage et vérification.',
    description_en = 'Readiness Libya 2 strengthens the institutional, human and technical capacities required for a more operational national climate finance system. The initiative supports Green Climate Fund programming, project preparation, entity accreditation and the establishment of a national measurement, reporting and verification framework.',
    results_fr = 'Le programme national destiné au Fonds vert pour le climat a été finalisé. Deux notes conceptuelles pour le secteur public ont été préparées et un cadre national de suivi a été mis en place, donnant aux institutions libyennes une base plus structurée pour mobiliser et piloter les financements climatiques.',
    results_en = 'The national Green Climate Fund program was finalized. Two public-sector concept notes were prepared and a national monitoring framework was established, giving Libyan institutions a stronger foundation for mobilizing and managing climate finance.'
WHERE slug = 'readiness-libya-2';

UPDATE projects
SET description_fr = 'Readiness Érythrée 1 accompagne la structuration de la gouvernance nationale du financement climatique. Le projet soutient l’Autorité nationale désignée, la compréhension des procédures du Fonds vert pour le climat, la préparation du programme pays et l’accompagnement des entités candidates à l’accréditation.',
    description_en = 'Readiness Eritrea 1 supports the development of national climate finance governance. The project strengthens the National Designated Authority, improves understanding of Green Climate Fund procedures, prepares the country program and supports entities seeking accreditation.',
    results_fr = 'Le Secrétariat de l’Autorité nationale désignée a été mis en place. Un atelier national consacré aux procédures du Fonds vert pour le climat a été organisé et un mécanisme de non-objection a été développé. Ces acquis préparent l’élaboration du programme pays et de deux nouvelles notes conceptuelles.',
    results_en = 'The National Designated Authority Secretariat was established. A national workshop on Green Climate Fund procedures was delivered and a no-objection mechanism was developed. These achievements prepare the country program and two new concept notes.'
WHERE slug = 'readiness-eritrea-1';

UPDATE projects
SET description_fr = 'CREW Angola vise à renforcer la résilience climatique et l’autonomie économique des groupes de femmes dans la province de Cunene. Le projet combinera organisation communautaire, amélioration des moyens de subsistance et solutions adaptées aux risques climatiques locaux. La phase 2026 lancera les études de référence, la cartographie des bénéficiaires et la mise en place de l’équipe opérationnelle.',
    description_en = 'CREW Angola aims to strengthen climate resilience and economic empowerment among women’s groups in Cunene Province. The project will combine community organization, improved livelihoods and solutions adapted to local climate risks. The 2026 phase will launch baseline studies, beneficiary mapping and the operational team.',
    results_fr = 'Le projet a été approuvé par le Fonds vert pour le climat. La planification opérationnelle des activités 2026 a été engagée, permettant de préparer l’atelier de lancement, la mobilisation de l’équipe et les études nécessaires au démarrage sur le terrain.',
    results_en = 'The project was approved by the Green Climate Fund. Operational planning for 2026 activities began, preparing the launch workshop, team mobilization and the studies required for field implementation.'
WHERE slug = 'crew-angola';

UPDATE projects
SET description_fr = 'CCAILSO accompagne l’adaptation des moyens de subsistance dans l’oasis de Siwa, en Égypte, où les systèmes agricoles et hydriques sont fortement exposés aux effets du changement climatique. Le projet préparera des solutions locales fondées sur les besoins des communautés, les caractéristiques de l’oasis et une meilleure connaissance des bénéficiaires.',
    description_en = 'CCAILSO supports livelihood adaptation in Egypt’s Siwa Oasis, where agricultural and water systems are highly exposed to climate change. The project will prepare locally grounded solutions based on community needs, the characteristics of the oasis and a stronger understanding of beneficiaries.',
    results_fr = 'Le projet a été approuvé par le Fonds d’Adaptation. La programmation des activités 2026 a été préparée, avec un atelier de lancement, la constitution de l’équipe, les études de référence et la cartographie des bénéficiaires comme premières étapes opérationnelles.',
    results_en = 'The project was approved by the Adaptation Fund. Activities for 2026 were planned, with a launch workshop, team formation, baseline studies and beneficiary mapping identified as the first operational steps.'
WHERE slug = 'ccailso-siwa-oasis';

UPDATE projects
SET description_fr = 'GMES valorise les données et technologies d’Observation de la Terre au service de la gestion durable de l’eau et des ressources naturelles en Afrique. Le projet transforme les données géospatiales en services accessibles aux institutions, aux experts et aux acteurs de terrain, notamment à travers MISLAND-Africa et FarmBot. En 2026, l’OSS étendra son appui au rapportage ODD 15.3.1 et à la cartographie continentale.',
    description_en = 'GMES turns Earth Observation data and technologies into practical services for sustainable water and natural resource management across Africa. The project makes geospatial information accessible to institutions, experts and field practitioners, particularly through MISLAND-Africa and FarmBot. In 2026, OSS will expand its support for SDG 15.3.1 reporting and continental mapping.',
    results_fr = 'FarmBot a été développé comme outil de diagnostic des maladies des cultures. MISLAND-Africa a été lancé avec une plateforme de suivi de la dégradation des terres, une application mobile et un plugin QGIS. Le réseau JIN réunit désormais plus de 275 experts, et des versions nationales ont été déployées en Égypte et en Mauritanie.',
    results_en = 'FarmBot was developed as a crop disease diagnostic tool. MISLAND-Africa launched with a land degradation monitoring platform, a mobile application and a QGIS plugin. The JIN network now brings together more than 275 experts, and national versions were deployed in Egypt and Mauritania.'
WHERE slug = 'gmes-earth-observation';

UPDATE projects
SET description_fr = 'Digital Earth Africa développe les usages de l’Observation de la Terre, du cloud computing et de l’intelligence artificielle au Burkina Faso et en Tunisie. Le partenariat met l’accent sur des communautés d’utilisateurs capables d’exploiter durablement les données géospatiales pour suivre les territoires et éclairer la décision.',
    description_en = 'Digital Earth Africa develops the use of Earth Observation, cloud computing and artificial intelligence in Burkina Faso and Tunisia. The partnership focuses on user communities capable of sustainably applying geospatial data to monitor territories and inform decisions.',
    results_fr = 'Des communautés nationales d’utilisateurs ont été constituées et plus de 160 experts et décideurs ont été formés. Des scripts dédiés au suivi de la dégradation des terres ont été développés, puis mis en pratique lors d’ateliers nationaux sur l’Observation de la Terre, le cloud computing et l’intelligence artificielle.',
    results_en = 'National user communities were established and more than 160 experts and decision-makers were trained. Scripts for monitoring land degradation were developed and applied during national workshops on Earth Observation, cloud computing and artificial intelligence.'
WHERE slug = 'digital-earth-africa';

UPDATE projects
SET description_fr = 'Le partenariat OSS/AIR-CAS améliore le suivi des ressources en eau et de leur utilisation agricole en Tunisie. Il associe expertise scientifique, données satellitaires et transfert de compétences afin de produire des informations régulières sur les besoins hydriques des cultures et l’efficacité de l’irrigation.',
    description_en = 'The OSS/AIR-CAS partnership improves the monitoring of water resources and their agricultural use in Tunisia. It combines scientific expertise, satellite data and skills transfer to produce regular information on crop water requirements and irrigation efficiency.',
    results_fr = 'La plateforme WaterMap N-Africa a été développée pour diffuser des données géospatiales à échelle décadaire sur les besoins en eau des cultures et l’efficacité de l’utilisation agricole. Une session de formation spécialisée a également renforcé les capacités nationales en suivi de l’eau agricole.',
    results_en = 'The WaterMap N-Africa platform was developed to disseminate ten-day geospatial data on crop water requirements and agricultural water-use efficiency. A specialized training session also strengthened national capacity for agricultural water monitoring.'
WHERE slug = 'oss-air-cas-watermap';

UPDATE projects
SET description_fr = 'Le programme de transformation numérique modernise les outils de gestion et d’aide à la décision de l’OSS. Il relie les besoins internes de l’organisation à des plateformes environnementales destinées aux partenaires et aux pays membres, avec une attention particulière portée à la qualité, à la circulation et à la valorisation des données.',
    description_en = 'The digital transformation program modernizes OSS management and decision-support tools. It connects the organization’s internal needs with environmental platforms serving partners and member countries, with particular attention to data quality, circulation and practical use.',
    results_fr = 'Plusieurs plateformes ont été développées pour la gestion des appels d’offres, l’inventaire informatique et la gestion électronique des documents. Des outils ont également été produits pour suivre la dégradation des terres dans quinze pays du Sahel et diffuser les résultats du projet AdaptWAP.',
    results_en = 'Several platforms were developed for tender management, IT inventory and electronic document management. Additional tools were produced to monitor land degradation in fifteen Sahel countries and disseminate results from the AdaptWAP project.'
WHERE slug = 'digital-transformation-decision-support';

UPDATE projects
SET description_fr = 'Le Programme Veille et Prospective prépare un ouvrage documentaire consacré au changement climatique en Afrique. Conçu comme un outil de connaissance et de sensibilisation, le livre rassemble analyses, expériences d’adaptation et innovations issues du continent. Sa publication en 2026 sera accompagnée d’une note d’orientation destinée aux décideurs.',
    description_en = 'The Monitoring and Foresight Program is preparing a documentary book on climate change in Africa. Designed as a knowledge and awareness resource, the book brings together analysis, adaptation experiences and innovations from across the continent. Its publication in 2026 will be accompanied by a policy brief for decision-makers.',
    results_fr = 'La conception et la production de l’ouvrage ont connu des avancées majeures grâce à une démarche participative. Des exemples concrets d’adaptation et d’innovation africaines ont été identifiés et intégrés afin de relier les connaissances scientifiques aux réalités du terrain.',
    results_en = 'The design and production of the book advanced significantly through a participatory process. Concrete examples of African adaptation and innovation were identified and integrated, connecting scientific knowledge with field realities.'
WHERE slug = 'monitoring-foresight-climate-book';

UPDATE projects
SET description_fr = 'Cette initiative fédère les acteurs du Maghreb et du Sahel autour de la gestion durable des terres, de l’adaptation climatique et de la préservation des écosystèmes. Elle transforme les connaissances produites par les communautés et les institutions en outils de plaidoyer adaptés aux espaces de dialogue régionaux et internationaux.',
    description_en = 'This initiative brings together stakeholders from the Maghreb and Sahel around sustainable land management, climate adaptation and ecosystem preservation. It transforms knowledge produced by communities and institutions into advocacy tools suited to regional and international dialogue.',
    results_fr = 'Des communautés ont été fédérées autour de la gestion durable des terres et de l’adaptation au changement climatique. Les messages de plaidoyer ont été diffusés lors d’événements internationaux, notamment auprès du GISS et de l’UICN. Les acquis alimentent désormais de nouveaux outils de diffusion et la préparation d’une vidéo documentaire.',
    results_en = 'Communities were brought together around sustainable land management and climate change adaptation. Advocacy messages were shared at international events, including with GISS and IUCN audiences. These achievements now support new dissemination tools and the preparation of a documentary video.'
WHERE slug = 'ecosystems-climate-adaptation-maghreb-sahel';

UPDATE projects
SET description_fr = 'Ce programme produit des connaissances courtes, accessibles et directement mobilisables par les décideurs et les partenaires. Il couvre des enjeux émergents tels que la sécurité hydrique, la biodiversité, la pollution plastique, le méthane et les solutions fondées sur la nature, tout en animant leur mise en débat à l’échelle régionale.',
    description_en = 'This program produces concise, accessible knowledge that decision-makers and partners can use directly. It addresses emerging issues such as water security, biodiversity, plastic pollution, methane and nature-based solutions, while supporting regional discussion and uptake.',
    results_fr = 'Des articles thématiques sur la sécurité hydrique, la biodiversité et la pollution plastique ont été publiés. Un compendium consacré aux solutions fondées sur la nature ainsi que des documents sur le méthane ont été produits. L’OSS a également renforcé son engagement dans le consortium IYRP pour la région MENA.',
    results_en = 'Thematic articles on water security, biodiversity and plastic pollution were published. A compendium on nature-based solutions and knowledge products on methane were produced. OSS also strengthened its engagement in the IYRP consortium for the MENA region.'
WHERE slug = 'knowledge-notes-thematic-articles';

UPDATE projects
SET description_fr = 'L’activité de développement de requêtes transforme les priorités régionales et les connaissances de l’OSS en propositions structurées pouvant mobiliser des financements. Elle privilégie la co-création avec les partenaires, l’intégration des savoirs locaux et des réponses concrètes aux pressions exercées par le changement climatique.',
    description_en = 'Project proposal development transforms regional priorities and OSS knowledge into structured initiatives capable of mobilizing finance. It emphasizes co-creation with partners, the integration of local knowledge and practical responses to climate pressures.',
    results_fr = 'Une proposition a été soumise à l’AFD dans le cadre du programme AdaptAction. Elle vise à renforcer la résilience des systèmes alimentaires en Afrique du Nord et au Moyen-Orient par la co-création de connaissances et la valorisation des savoirs locaux face au stress hydrique et au changement climatique.',
    results_en = 'A proposal was submitted to AFD under the AdaptAction program. It aims to strengthen food-system resilience in North Africa and the Middle East through knowledge co-creation and the use of local knowledge to address water stress and climate change.'
WHERE slug = 'project-proposal-development';

UPDATE projects
SET description_fr = 'L’évaluation à mi-parcours de la Stratégie 2030 fournit à l’OSS un regard indépendant sur son positionnement, ses résultats et ses priorités. Elle constitue une base de décision pour ajuster le cadre stratégique, consolider le programme de veille et prospective et accélérer la mobilisation de la finance climatique.',
    description_en = 'The mid-term evaluation of the 2030 Strategy provides OSS with an independent assessment of its positioning, results and priorities. It forms a decision-making basis for adjusting the strategic framework, strengthening monitoring and foresight, and accelerating climate finance mobilization.',
    results_fr = 'L’évaluation externe a couvert la période 2020-2024. Elle a analysé le degré de réalisation des objectifs ainsi que la pertinence et l’efficacité de la Stratégie 2030. Ses conclusions fournissent les orientations nécessaires aux ajustements programmés à partir de 2026.',
    results_en = 'The external evaluation covered the 2020-2024 period. It assessed progress toward the objectives as well as the relevance and effectiveness of the 2030 Strategy. Its findings provide the guidance needed for adjustments beginning in 2026.'
WHERE slug = 'strategy-2030-mid-term-evaluation';


-- ── Team — Direction ──
-- Members are displayed by id; the first Direction member is featured separately.
INSERT INTO team (name, title_fr, title_en, diplomas_fr, diplomas_en, nationality_fr, nationality_en, image, department) VALUES
  ('Nabil BEN KHATRA',
   'Secrétaire Exécutif',
   'Executive Secretary',
   'Agronome et spécialiste en télédétection',
   'Agronomist and remote sensing specialist',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/NbK200.jpg',
   'direction'),

  ('Mourad BRIKI',
   'Directeur du Département Communication et Savoir',
   'Director of the Communication and Knowledge Department',
   'Ingénieur Ecologue',
   'Ecological Engineer',
   'Algérienne', 'Algerian',
   'https://www.oss-online.org/sites/default/files/2022-02/_MB200.jpg',
   'direction'),

  ('Abina Abdoulkarim BELLO',
   'Directeur du Département Terre et Biodiversité par intérim',
   'Acting Director of the Land and Biodiversity Department',
   'DEA en Science de la production animale',
   'Advanced Studies Diploma (DEA) in Animal Production Science',
   'Nigérienne', 'Nigerien',
   'https://www.oss-online.org/sites/default/files/2026-02/Bello200.jpg',
   'direction'),

  ('Khaoula JAOUI',
   'Coordinatrice des Programmes Techniques, Directrice du Département Climat, et Directrice du Département Développement et Mobilisation',
   'Technical Programmes Coordinator, Director of the Climate Department, and Director of the Development and Resource Mobilization Department',
   'Experte en Finance Climatique et GRN',
   'Climate Finance and Natural Resource Management Expert',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-08/KhaoulaJaoui.jpg',
   'direction'),

  ('Nabil HAMADA',
   'Directeur du Département administratif et financier',
   'Director of the Administrative and Financial Department',
   'Ingénieur Général, Forêt, Ecologie et GRN',
   'Chief Engineer in Forestry, Ecology and Natural Resource Management',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/N-Hamada.jpg',
   'direction'),

  ('Mohamedou SY',
   'Directeur du Département Eau',
   'Director of the Water Department',
   'Dr. en Hydrogéologie',
   'PhD in Hydrogeology',
   'Mauritanienne', 'Mauritanian',
   'https://www.oss-online.org/sites/default/files/2024-01/BabaSy.jpg',
   'direction'),

  ('Mustapha MIMOUNI',
   'Département Veille & Prospective, Data et Plateforme Numérique',
   'Foresight and Prospective, Data and Digital Platform Department',
   'Expert en Télédétection',
   'Remote Sensing Expert',
   'Algérienne', 'Algerian',
   'https://www.oss-online.org/sites/default/files/2024-01/Mustapha200.jpg',
   'direction'),

  ('Adel REKIK',
   'Auditeur Interne',
   'Internal Auditor',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Adel-R.png',
   'direction');


-- ── Team — Technique ──
INSERT INTO team (name, title_fr, title_en, diplomas_fr, diplomas_en, nationality_fr, nationality_en, image, department) VALUES
  ('Abir BEN ROMDHANE',
   'Cheffe de la Division de la Biodiversité et des Ecosystèmes',
   'Head of the Biodiversity and Ecosystems Division',
   'Dr. en géologie',
   'PhD in Geology',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-02/Abir%201.jpg',
   'technique'),

  ('Evence LOUIS ZOUNGRANA',
   'Chef de la Division Systèmes d’Information & Géomatique',
   'Head of the Information Systems and Geomatics Division',
   'Géographe, expert en SIG, TD et Suivi-Evaluation, Dr. en Sciences Agronomiques',
   'Geographer, expert in GIS, remote sensing and monitoring and evaluation, PhD in Agricultural Sciences',
   'Burkinabè', 'Burkinabè',
   'https://www.oss-online.org/sites/default/files/2022-02/Zoungrana_0.jpg',
   'technique'),

  ('Haithem RAJEB',
   'Responsable de Gestion de Projets',
   'Project Management Officer',
   'Ingénieur en Génie Hydraulique et Environnement',
   'Hydraulic and Environmental Engineer',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Haithem200_0.jpg',
   'technique'),

  ('Steve MUHANJI',
   'Chef de la Division du Développement et du Montage de projets',
   'Head of the Project Development and Design Division',
   'Master en Sciences de l''Environnement et de la GRN',
   'Master''s degree in Environmental Sciences and Natural Resource Management',
   'Kényane', 'Kenyan',
   'https://www.oss-online.org/sites/default/files/2024-03/SteveMuhanji_0.jpg',
   'technique'),

  ('Hamda FOUGHALI',
   'Chef de la Division du Renforcement des Capacités',
   'Head of the Capacity Building Division',
   'Master en géomatique d’ingénieur',
   'Master''s degree in Engineering Geomatics',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Hamda_0.jpg',
   'technique'),

  ('Amjed HADJ TAIEB',
   'Responsable de Gestion de Projets',
   'Project Management Officer',
   'Ingénieur en GRN, Géo-information dans la gestion de l''environnement',
   'Natural Resource Management Engineer, Geo-information in Environmental Management',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Amjed200_0.jpg',
   'technique'),

  ('Aziz BELHAMRA',
   'Chef de la Division de l’Adaptation et de l’Atténuation',
   'Head of the Adaptation and Mitigation Division',
   'Ingénieur agronome, Master en Lutte Contre la Désertification',
   'Agricultural Engineer, Master''s degree in Combating Desertification',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2024-01/Aziz.jpg',
   'technique'),

  ('Robert David ONYANGO',
   'Responsable de Gestion de Projets',
   'Project Management Officer',
   'Dr. en changement climatique et adaptation',
   'PhD in Climate Change and Adaptation',
   'Kényane', 'Kenyan',
   'https://www.oss-online.org/sites/default/files/2025-12/Robert-New.jpg',
   'technique'),

  ('Omar ENNAIFER',
   'Chef de l’Unité de la conformité et de l’intégrité',
   'Head of the Compliance and Integrity Unit',
   'Biologiste avec spécialisation en Evolution, Ecologie et Environnement',
   'Biologist specializing in Evolution, Ecology and Environment',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Omar200.jpg',
   'technique'),

  ('Leila BENNANI',
   'Chargée de Communication',
   'Communications Officer',
   'Spécialiste en stratégie de communication et contenus multimédias',
   'Specialist in Communication Strategy and Multimedia Content',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/leila_bennani.jpg',
   'technique'),

  ('Olfa OTHMAN',
   'Cheffe de la Division des Publications et de la Gestion des Savoirs',
   'Head of the Publications and Knowledge Management Division',
   'Maîtrise en DBA',
   'Master''s degree in DBA',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2025-06/Olfa.jpg',
   'technique'),

  ('Kaouther HAMROUNI',
   'Responsable de Gestion de Projets',
   'Project Management Officer',
   'Dr. en Agronomie',
   'PhD in Agronomy',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Kaouther.jpg',
   'technique'),

  ('Olfa Karous',
   'Cheffe de Division Veille et Prospective par intérim',
   'Acting Head of the Foresight and Prospective Division',
   'Ingénieure-Dr. en sciences agronomiques',
   'Engineer and PhD in Agricultural Sciences',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2023-10/OlfaKarous.jpg',
   'technique'),

  ('Mohamed AZZABI',
   'Chargé du Parc Informatique',
   'IT Infrastructure Officer',
   'Ingénieur Système d''Information',
   'Information Systems Engineer',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2025-09/MA_1.jpg',
   'technique'),

  ('Wafa Ameur',
   'Assistante Technique',
   'Technical Assistant',
   'Dr. en sciences agronomiques et environnementales',
   'PhD in Agricultural and Environmental Sciences',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2023-10/WafaAmeur.jpg',
   'technique'),

  ('Aymen BENAHMED',
   'Assistant Technique',
   'Technical Assistant',
   'Ingénieur Agronome, Master de recherche en Géomatique Appliquée à l’Agr. et à l’Env.',
   'Agricultural Engineer, Research Master''s degree in Geomatics Applied to Agriculture and the Environment',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2024-12/AymenBENAHMED.jpg',
   'technique'),

  ('Khaled LACHAAL',
   'Chef de la Division Data, IA et Innovation',
   'Head of the Data, AI and Innovation Division',
   'Master en Sécurité des Systèmes d''Information',
   'Master''s degree in Information Systems Security',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2025-06/khaled.jpg',
   'technique'),

  ('Safa ARFAOUI',
   'Assistante technique',
   'Technical Assistant',
   'Ingénieure Agronome, Master en Conservation et Restauration des Ecosystèmes Marins',
   'Agricultural Engineer, Master''s degree in Marine Ecosystem Conservation and Restoration',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2024-12/SafaARFAOUI_0.jpg',
   'technique'),

  ('Pouwédéou KAMBIA',
   'Responsable de Gestion de Projets',
   'Project Management Officer',
   'Master en Télédétection et en Systèmes d''Information Géographique',
   'Master''s degree in Remote Sensing and Geographic Information Systems',
   'Togolaise', 'Togolese',
   'https://www.oss-online.org/sites/default/files/2024-12/Kambia.jpg',
   'technique'),

  ('Youssef HADDOUK',
   'Chargé de la sécurité des Systèmes d''Information',
   'Information Systems Security Officer',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2025-05/Youssef-Haddouk.jpg',
   'technique'),

  ('Soumaya MOUHLI',
   'Cheffe de la Division de l’Hydrologie et des Eaux Partagées',
   'Head of the Hydrology and Shared Waters Division',
   'Ingénieure en Hydraulique',
   'Hydraulic Engineer',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2025-09/Soumaya%20FB.png',
   'technique'),

  ('Pape Ndiaye',
   'Chef de la Division de la Communication Institutionnelle',
   'Head of the Institutional Communication Division',
   'Master en Communication des Organisations',
   'Master''s degree in Organizational Communication',
   'Sénégalo-française', 'Senegalese-French',
   'https://www.oss-online.org/sites/default/files/2026-01/Pape.png',
   'technique'),

  ('Mehdi CHEBBI',
   'Ingénieur DevOps',
   'DevOps Engineer',
   'Ingénierie en Informatique',
   'Computer Engineering',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-05/Mehdi.jpg',
   'technique'),

  ('Nadia KHAMMARI',
   'Cheffe de l’Unité Partenariats et Plaidoyer',
   'Head of the Partnerships and Advocacy Unit',
   'Master en lettres françaises modernes, Arts et Spectacles',
   'Master''s degree in Modern French Literature, Arts and Performing Arts',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-06/NadiaKh200.png',
   'technique');


-- ── Team — Administratif ──
INSERT INTO team (name, title_fr, title_en, diplomas_fr, diplomas_en, nationality_fr, nationality_en, image, department) VALUES
  ('Sonia ABASSI',
   'Cheffe de l’Unité des Relations Extérieures',
   'Head of the External Relations Unit',
   'Maîtrise Combinée de Langues (MCL)',
   'Combined Languages Degree (MCL)',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Sonia-A.jpg',
   'administratif'),

  ('Souhir BEN HEDIA',
   'Responsable des Affaires Sociales et Logistiques',
   'Social Affairs and Logistics Officer',
   'Maîtrise en droit privé',
   'Degree in Private Law',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Souhir.png',
   'administratif'),

  ('Sonia NJAH',
   'Cheffe de la Division des Affaires Administratives et des Moyens Généraux',
   'Head of the Administrative Affairs and General Services Division',
   'Maîtrise en Economie et Relations Internationales',
   'Degree in Economics and International Relations',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/_SoniaNjah.jpg',
   'administratif'),

  ('Nadia MATHLOUTHI',
   'Agent d''accueil',
   'Receptionist',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Nadia-M.jpg',
   'administratif'),

  ('Rafik ZIADI',
   'Chef de la Division de la Comptabilité',
   'Head of the Accounting Division',
   'Maîtrise en Gestion Comptable',
   'Degree in Accounting Management',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Rafik-1.jpg',
   'administratif'),

  ('Henda BELKHODJA',
   'Assistante Administrative',
   'Administrative Assistant',
   'Licence en Management',
   'Bachelor''s degree in Management',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2024-12/HendaBELKHODJA.jpg',
   'administratif'),

  ('Sarra DARDOUR',
   'Gestionnaire Comptable',
   'Accounting Manager',
   'Diplôme national de Master professionnel en comptabilité',
   'National Professional Master''s Degree in Accounting',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2025-05/Sarra-Dardour.jpg',
   'administratif'),

  ('Karim BEN TRAD',
   'Chef de la Division des Ressources Humaines',
   'Head of the Human Resources Division',
   'Ecole Nationale d''Administration',
   'National School of Administration',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-01/KarimTrad.jpg',
   'administratif'),

  ('Hayet Dorii',
   'Assistante administrative',
   'Administrative Assistant',
   '', '',
   'Tunisienne', 'Tunisian',
   '',
   'administratif'),

  ('Tarek LARBI',
   'Responsable Fiduciaire',
   'Fiduciary Officer',
   'Maîtrise en gestion, marketing',
   'Degree in Management and Marketing',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-06/Tarek-Larbi.jpg',
   'administratif'),

  ('Zied SEDIRI',
   'Responsable Financier',
   'Financial Officer',
   'Master professionnel en ingénierie financière et finance d''entreprise',
   'Professional Master''s Degree in Financial Engineering and Corporate Finance',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-06/ZiedSediri.jpg',
   'administratif');


-- ── Team — Appui ──
INSERT INTO team (name, title_fr, title_en, diplomas_fr, diplomas_en, nationality_fr, nationality_en, image, department) VALUES
  ('Souad NAKAA',
   'Agent d''entretien',
   'Maintenance Worker',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Souad.jpg',
   'appui'),

  ('Fathi ELLALI',
   'Chauffeur',
   'Driver',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Fethi.jpg',
   'appui'),

  ('Najeh EL HADJ AHMED',
   'Agent d''entretien',
   'Maintenance Worker',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2022-02/Najeh.jpg',
   'appui'),

  ('Achref OUERTANI',
   'Chauffeur - Agent de liaison',
   'Driver - Liaison Officer',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-01/Achraf-2.jpg',
   'appui'),

  ('Louay AZIZI',
   'Factotum',
   'General Assistant',
   '', '',
   'Tunisienne', 'Tunisian',
   'https://www.oss-online.org/sites/default/files/2026-01/Louay.jpg',
   'appui'),

  ('Mouna ALLAGUI',
   'Agent d''entretien',
   'Maintenance Worker',
   '', '',
   'Tunisienne', 'Tunisian',
   '',
   'appui');


-- ── Socials ──
INSERT INTO socials (platform, url, icon_svg, sort_order) VALUES
  ('facebook',  '#', 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', 1),

  ('x',         '#', 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z', 2),

  ('linkedin',  '#', 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', 3),

  ('youtube',   '#', 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', 4),

  ('instagram', '#', 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', 5);
