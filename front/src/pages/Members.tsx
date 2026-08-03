export default function Members() {
  const africanCountries = [
    'Algérie', 'Bénin', 'Burkina Faso', 'Cameroun', 'Cap Vert',
    "Côte d'Ivoire", 'Djibouti', 'Egypte', 'Erythrée', 'Ethiopie',
    'Gambie', 'Guinée', 'Guinée-Bissau', 'Kenya', 'Libéria', 'Libye',
    'Mali', 'Maroc', 'Mauritanie', 'Niger', 'Nigeria', 'Ouganda',
    'République centrafricaine', 'Sénégal', 'Somalie', 'Soudan', 'Tchad', 'Tunisie',
  ];

  const nonAfricanCountries = [
    'Allemagne', 'Belgique', 'Canada', 'France', 'Italie', 'Luxembourg', 'Suisse',
  ];

  const organisations = [
    { abbr: 'APGMV', name: 'Agence Panafricaine de la Grande Muraille Verte' },
    { abbr: 'CARI', name: "Centre d'Actions et de Réalisations Internationales" },
    { abbr: 'CRTEAN', name: "Centre Régional de Télédétection des Etats de l'Afrique du Nord" },
    { abbr: 'CILSS', name: "Comité permanent Inter-Etats de Lutte contre la Sécheresse dans le Sahel" },
    { abbr: 'CBLT', name: 'Commission du Bassin du Lac Tchad' },
    { abbr: 'CENSAD', name: 'Communauté des Etats sahélo-sahariens' },
    { abbr: 'CNULCD', name: 'Convention des Nations Unies sur la Lutte Contre la Désertification' },
    { abbr: 'CRU-BN', name: "Coordination Régionale des Usagers.ères des ressources naturelles du Bassin du Niger" },
    { abbr: 'ENDA', name: 'Environnement et Développement du tiers-monde' },
    { abbr: 'IGAD', name: 'Intergovernmental Authority on Development' },
    { abbr: 'FAO', name: "Organisation des Nations Unies pour l'alimentation et l'agriculture" },
    { abbr: 'ReSaD', name: 'Réseau Sahel Désertification' },
    { abbr: 'UMA', name: 'Union du Maghreb Arabe' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">

      {/* ── États membres ── */}
      <section className="mb-16">
        <h1 className="text-3xl font-bold text-ink mb-2 font-serif">
          États membres
        </h1>
        <p className="text-forest-700 font-semibold text-lg mb-8">
          35 États membres
        </p>

        {/* Map placeholder */}
        <div className="w-full h-64 md:h-80 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center mb-10">
          <span className="text-forest-400 text-sm font-medium tracking-wide uppercase">
            Carte — à venir
          </span>
        </div>

        {/* African countries */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4">
            28 pays africains
          </h2>
          <div className="flex flex-wrap gap-2">
            {africanCountries.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 text-[13px] font-medium text-ink/70 bg-ink/[0.04] border border-ink/[0.08] rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Non-African countries */}
        <div>
          <h2 className="text-lg font-semibold text-ink mb-4">
            7 pays non africains
          </h2>
          <div className="flex flex-wrap gap-2">
            {nonAfricanCountries.map((c) => (
              <span
                key={c}
                className="px-3 py-1.5 text-[13px] font-medium text-ink/70 bg-ink/[0.04] border border-ink/[0.08] rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Organisations membres ── */}
      <section className="mb-16">
        <div className="flex items-baseline gap-3 mb-8">
          <h2 className="text-2xl font-bold text-ink font-serif">
            Organisations membres
          </h2>
          <span className="text-forest-700 font-semibold">
            13 Organisations membres
          </span>
        </div>

        <ul className="space-y-3">
          {organisations.map((org) => (
            <li
              key={org.abbr}
              className="flex items-baseline gap-3 px-4 py-3 rounded-lg bg-white border border-ink/[0.06] hover:border-forest-200 hover:bg-forest-50/40 transition-colors duration-150"
            >
              <span className="shrink-0 text-[13px] font-bold text-forest-700 tracking-wide min-w-[60px]">
                {org.abbr}
              </span>
              <span className="text-[14px] text-ink/75 leading-snug">
                {org.name}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[14px] leading-relaxed text-ink/60">
          Les États et les Organisations souhaitant adhérer à l'Observatoire du Sahara et du Sahel peuvent suivre la procédure d'adhésion décrite dans les statuts de l'institution. Ils ont également la possibilité de se rapprocher directement du Secrétariat exécutif de l'OSS afin d'obtenir les documents statutaires nécessaires et toute information complémentaire utile pour accompagner leur démarche.
        </p>
      </section>

      {/* ── Admission ── */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          Admission
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p className="font-medium text-ink">
            Sont admis comme membres :
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-forest-600" />
              <p>
                Les États et les Organisations intergouvernementales qui ont notifié leurs contributions au budget de l'OSS par écrit.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-forest-600" />
              <p>
                Les Organisations internationales non gouvernementales dont la demande officielle d'adhésion a été adressée au Secrétariat exécutif de l'OSS et approuvée par l'Assemblée Générale.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-forest-600" />
              <p>
                Seules les Organisations non gouvernementales internationales opérant dans le domaine de la science et dont les activités sont compatibles avec les objectifs de l'OSS, peuvent en devenir membres.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
