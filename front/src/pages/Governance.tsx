export default function Governance() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">

      {/* ── Intro ── */}
      <section className="mb-16">
        <h1 className="text-3xl font-bold text-ink mb-6 font-serif">
          Gouvernance
        </h1>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            L'OSS collabore avec ses pays membres en suivant le principe de subsidiarité. Il joue à la fois un rôle d'initiateur et de facilitateur pour établir des partenariats visant à relever des défis environnementaux communs.
          </p>
          <p>
            Les domaines clés de son action incluent la gestion des ressources en eau et l'application des accords multilatéraux sur l'environnement, particulièrement ceux relatifs à la dégradation des terres, à la biodiversité et au changement climatique.
          </p>
          <p>
            Les programmes et projets de l'OSS sont financés par des contributions volontaires, des subventions et des dons provenant de ses pays membres, d'organisations et de partenaires.
          </p>
          <p>
            Grâce à une structure légère et flexible, une gestion financière transparente, une gouvernance efficace, ainsi qu'une équipe compétente, multiculturelle et multidisciplinaire, l'OSS est bien positionné pour répondre de manière significative aux défis environnementaux tant régionaux qu'internationaux.
          </p>
        </div>
      </section>

      {/* ── L'Assemblée Générale ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          L'Assemblée Générale
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            C'est l'organe suprême de l'OSS qui représente l'appropriation de l'Organisation par ses membres et a pour tâche, entre autres, de définir les orientations de l'Organisation et d'approuver les statuts et les stratégies d'intervention. Elle se réunit tous les quatre ans en session ordinaire.
          </p>
          <p>
            Elle a également pour rôle d'élire les membres du Conseil d'Administration pour un mandat de quatre ans. L'Egypte assure jusqu'en 2029 la présidence de l'Organisation à travers Son Excellence M.&nbsp;Alaaeddine Farouk Zaki El-SAYED, Ministre de l'agriculture et de la réhabilitation des terres de l'Egypte.
          </p>
        </div>
      </section>

      {/* ── Le Conseil d'Administration ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          Le Conseil d'Administration
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75 mb-8">
          <p>
            Le Conseil d'Administration est composé de 27 membres élus par l'AG pour une durée de quatre ans renouvelables et d'un bureau de 11 membres qui facilite le dialogue entre le CA et le Secrétariat Exécutif. Le CA se réunit une fois par an et se prononce sur la base du consensus. Il met en œuvre les orientations et les résolutions de l'AG, examine les états financiers annuels, amende les textes réglementaires, désigne le Secrétaire Exécutif et adopte le budget de l'OSS pour l'année suivante.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-ink mb-4">
          Composition
        </h3>
        <ul className="space-y-3 mb-10">
          {[
            { label: 'Président', value: 'Egypte' },
            { label: 'Zone Cen-Sad', value: 'Djibouti et Soudan' },
            { label: "Zone de l'Union du Maghreb Arabe", value: 'Maroc et Mauritanie' },
            { label: 'Zone CILSS', value: 'Bénin et Niger' },
            { label: "Région de l'IGAD", value: 'Kenya et Ouganda' },
            { label: 'Espace CBLT', value: 'République Centrafricaine et Tchad' },
            { label: 'Pays du Nord', value: 'Allemagne, Belgique, Canada, France, Italie, Luxembourg et Suisse' },
            { label: 'Organisations sous-régionales', value: 'APGMV, CBLT, CEN-SAD, CILSS, IGAD et UMA' },
            { label: 'Organisations internationales', value: 'CNULCD' },
            { label: 'Organisations de la société civile', value: 'ENDA et CARI' },
          ].map((item) => (
            <li
              key={item.label}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3 rounded-lg bg-white border border-ink/[0.06]"
            >
              <span className="shrink-0 text-[13px] font-bold text-forest-700 min-w-[200px]">
                {item.label}
              </span>
              <span className="text-[14px] text-ink/75">{item.value}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold text-ink mb-4">
          Bureau du Conseil d'Administration
        </h3>
        <ul className="space-y-3">
          {[
            { label: 'Présidence', value: 'Egypte' },
            { label: 'Membres', value: 'Bénin, France, Kenya, Mauritanie, Niger, Ouganda, Tchad et SE/OSS' },
            { label: 'Pays hôte', value: 'Tunisie' },
            { label: 'Rapporteur', value: 'Djibouti' },
          ].map((item) => (
            <li
              key={item.label}
              className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 px-4 py-3 rounded-lg bg-white border border-ink/[0.06]"
            >
              <span className="shrink-0 text-[13px] font-bold text-forest-700 min-w-[200px]">
                {item.label}
              </span>
              <span className="text-[14px] text-ink/75">{item.value}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Comité d'Orientation Stratégique ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          Le Comité d'Orientation Stratégique (COS)
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75 mb-8">
          <p>
            Organe bénévole et consultatif, il exerce une mission de réflexion, d'anticipation et d'analyse stratégique, prenant en compte la dimension stratégique de l'OSS face aux évolutions de la gouvernance régionale et internationale des ressources naturelles et de l'environnement.
          </p>
          <p>
            Il est composé de scientifiques et de praticiens indépendants, œuvrant dans le domaine du développement durable. Il se réunit chaque année avant la tenue de la session ordinaire du CA.
          </p>
          <p>
            Il soumet à l'appréciation du CA et du Secrétariat Exécutif de l'OSS les orientations stratégiques issues de ses réflexions.
          </p>
          <p>
            Les membres du COS sont issus de divers horizons académiques, techniques et institutionnels. Leur expertise reconnue au niveau régional et international dans les domaines liés à la gestion durable des ressources naturelles renforce la légitimité et la portée des recommandations formulées.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-ink mb-4">
          Composition
        </h3>
        <ul className="space-y-3">
          {[
            { name: "M. Habib BEN YAHIA", title: "Président d'honneur depuis 2016, ancien Président du COS, ancien Secrétaire Général de l'Union du Maghreb Arabe (UMA), ancien Ministre des Affaires Etrangères et de la Défense Nationale", country: "Tunisie" },
            { name: "M. Jean Luc GNACADJA", title: "Président d'honneur, ancien Président du COS, ancien Secrétaire exécutif de la CNULCD, ancien Ministre de l'Environnement et du Développement durable", country: "Bénin" },
            { name: "M. Assane SOUMARE", title: "Président, Professeur à l'Université de Nouakchott, ancien Ministre des Pêches", country: "Mauritanie" },
            { name: "Mme Anneke TRUX", title: "Vice Présidente du COS et Cheffe de programme à la GIZ", country: "Allemagne" },
            { name: "M. Alhamandou DORSOUMA", title: "Directeur intérimaire et chef de division au département du changement climatique et de la croissance verte à la BAD", country: "Tchad" },
            { name: "Mme Anta SECK", title: "Coordinatrice du Programme de Gestion intégrée des Ressources en Eau (PGIRE 2)", country: "Sénégal" },
            { name: "M. Callist TINDIMUGAYA", title: "Commissaire à la planification des ressources en eau et à la réglementation, Ministère de l'Eau et de l'Environnement", country: "Ouganda" },
            { name: "Mme Dorothy AMWATA", title: "Professeure universitaire", country: "Kenya" },
            { name: "M. Elyes HAMZA", title: "Directeur du Centre d'activités régionales pour les aires spécialement protégées (SPA/RAC), ancien Ministre de l'Agriculture", country: "Tunisie" },
            { name: "M. Jean Luc CHOTTE", title: "Directeur de recherche à l'Institut de Recherche pour le Développement (IRD)", country: "France" },
            { name: "M. Jesper WOHLERT", title: "Directeur de Humana People to People (HPP)", country: "Suisse" },
            { name: "M. Raafat MISAK", title: "Professeur émérite au Desert Research Centre (DRC)", country: "Egypte" },
          ].map((m) => (
            <li
              key={m.name}
              className="px-4 py-3 rounded-lg bg-white border border-ink/[0.06] hover:border-forest-200 hover:bg-forest-50/40 transition-colors duration-150"
            >
              <p className="text-[14px] font-semibold text-ink mb-0.5">
                {m.name}
                <span className="ml-2 text-forest-700 font-medium">— {m.country}</span>
              </p>
              <p className="text-[13px] text-ink/60 leading-relaxed">{m.title}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Le Secrétariat Exécutif ── */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          Le Secrétariat Exécutif
        </h2>
        <div className="text-[15px] leading-relaxed text-ink/75">
          <p>
            Constitué d'une équipe pluriculturelle et multidisciplinaire compétente, il applique les décisions du CA et de l'AG et prend toutes les mesures nécessaires à la gestion de l'OSS, à l'exécution de ses programmes, à l'application de ses politiques et à l'accomplissement de sa mission.
          </p>
        </div>
      </section>
    </div>
  );
}
