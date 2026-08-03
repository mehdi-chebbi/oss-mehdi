export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 lg:px-8">
      {/* ── Présentation ── */}
      <section className="mb-14">
        <h1 className="text-3xl font-bold text-ink mb-6 font-serif">
          Présentation
        </h1>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            Fondé en 1992 et basé à Tunis depuis 2000, l'Observatoire du Sahara et du Sahel (OSS) est une Organisation internationale à vocation africaine. Il a pour rôle principal de créer et de soutenir des partenariats pour relever les défis liés à la gestion des ressources en eau et à la mise en œuvre, en Afrique, des Accords Multilatéraux sur l'Environnement, particulièrement la dégradation des terres, la biodiversité et le changement climatique.
          </p>
          <p>
            L'OSS compte actuellement 48 membres, dont 28 pays africains et 7 pays non-africains. A ces Etats, s'ajoutent 13 entités représentatives de l'Afrique, des Nations Unies ainsi que des Organisations non gouvernementales.
          </p>
          <p>
            Les collaborations entre l'OSS et ses membres visent, en premier lieu, à renforcer les efforts communs pour un avenir durable en Afrique.
          </p>
        </div>
      </section>

      {/* ── Mission et expertise ── */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          Mission et expertise
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            L'OSS a pour mission d'aider ses pays membres africains à gérer durablement leurs ressources naturelles, dans un contexte de changement climatique des plus difficiles. Son action se concentre principalement sur les zones arides, semi-arides et subhumides sèches.
          </p>
          <p>
            Pour mener à bien sa mission, l'OSS développe continuellement une expertise qui lui permet d'apporter des éclairages sur les enjeux environnementaux actuels et de contribuer à des réflexions stratégiques sur la gestion durable des terres et des ressources en eau.
          </p>
          <p>
            Ses actions se déclinent en trois axes principaux :
          </p>
          <ul className="list-none space-y-4 pl-1">
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-forest-700 text-white text-xs flex items-center justify-center font-semibold">1</span>
              <p>
                <span className="font-medium text-ink">Mise en œuvre d'accords multilatéraux sur l'environnement :</span> appliquer les accords sur la dégradation des terres, la biodiversité et le changement climatique.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-forest-700 text-white text-xs flex items-center justify-center font-semibold">2</span>
              <p>
                <span className="font-medium text-ink">Promotion d'initiatives :</span> appuyer les initiatives régionales et internationales qui répondent aux défis environnementaux en favorisant la synergie entre les Etats et les Organisations sous régionales afin de consolider un véritable espace de partenariat.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-forest-700 text-white text-xs flex items-center justify-center font-semibold">3</span>
              <p>
                <span className="font-medium text-ink">Harmonisation des approches :</span> définir des concepts et unifier les méthodologies liées à la gestion durable des terres et des ressources en eau.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Action ── */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-ink mb-6 font-serif">
          Action
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-ink/75">
          <p>
            L'OSS vise à aider ses pays membres dans leur lutte contre la dégradation des terres et la désertification, ainsi que dans la gestion durable des ressources en eau et le renforcement de la résilience des populations face aux mutations environnementales.
          </p>
          <p>
            Il s'engage également à protéger le patrimoine biologique. Pour cela, il élabore des concepts et des méthodologies dédiés au suivi environnemental, à la gestion des ressources naturelles et à l'adaptation au changement climatique. Cet engagement s'appuie sur des programmes scientifiques et techniques structurant de sa stratégie à savoir : « Terre », « Eau », « Climat » et « Biodiversité ».
          </p>
          <p>
            Ces axes visent à promouvoir une gestion intégrée et collaborative des ressources naturelles en Afrique. Grâce à ses accréditations auprès du Fonds Vert pour le Climat (GCF) et du Fonds d'Adaptation (FA), l'OSS soutient les pays dans la mise en œuvre de projets qui atténuent les impacts du changement climatique sur les populations et les écosystèmes.
          </p>
          <p>
            Pour réaliser sa mission, l'Observatoire mise sur le transfert de connaissances, le renforcement des capacités et la sensibilisation de toutes les parties prenantes.
          </p>
        </div>
      </section>
    </div>
  );
}
