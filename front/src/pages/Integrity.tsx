import { useState, type KeyboardEvent } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { Locale } from '@/context/locale';

type Localized = Record<Locale, string>;

interface DocumentResource {
  label?: Localized;
  urls: Partial<Record<Locale, string>>;
}

interface PolicyDocument {
  title: Localized;
  description: Localized;
  resources?: DocumentResource[];
}

interface PolicySection {
  id: string;
  title: Localized;
  introduction: Localized;
  documents: PolicyDocument[];
}

const copy = {
  title: {
    fr: 'Cadre d’intégrité, transparence & sauvegardes',
    en: 'Integrity, transparency & safeguards framework',
  },
  introduction: {
    fr: 'L’OSS s’appuie sur un ensemble de politiques et procédures transversales, mises en œuvre par l’UCGTD, afin de garantir intégrité, transparence et sauvegardes environnementales & sociales.',
    en: 'OSS relies on a set of cross-cutting policies and procedures implemented by the UCGTD to ensure integrity, transparency, and environmental & social safeguards.',
  },
  openDocument: { fr: 'Consulter le document', en: 'View document' },
  policy: { fr: 'Consulter la politique', en: 'View policy' },
  procedure: { fr: 'Consulter la procédure', en: 'View procedure' },
} satisfies Record<string, Localized>;

const sections: PolicySection[] = [
  {
    id: 'integrite-ethique-conformite',
    title: {
      fr: 'Intégrité, éthique & conformité',
      en: 'Integrity, ethics & compliance',
    },
    introduction: {
      fr: 'Les politiques d’intégrité de l’OSS établissent un cadre robuste pour garantir les plus hauts standards de conduite éthique dans toutes ses activités et partenariats. Elles définissent des pratiques interdites, notamment la fraude, la corruption, les conflits d’intérêts et les représailles, et fixent des attentes claires en matière de responsabilité pour le personnel (Personnes Couvertes) comme pour les partenaires externes (Contreparties). Des procédures encadrent la détection, l’évaluation et le traitement des allégations, depuis le signalement jusqu’à la décision finale. Ce dispositif couvre également la lutte contre le blanchiment d’argent et le financement du terrorisme (LBA/FT), la protection contre les violences sexuelles, les abus et le harcèlement (VSADH), ainsi que la protection des lanceurs d’alerte. Ensemble, ces instruments renforcent la transparence, l’intégrité et la confiance institutionnelle.',
      en: 'OSS integrity policies provide a robust framework for maintaining the highest standards of ethical conduct across its activities and partnerships. They define prohibited practices, including fraud, corruption, conflicts of interest and retaliation, and establish clear accountability expectations for staff (Covered Persons) and external partners (Counterparties). Procedures govern the detection, assessment and handling of allegations from initial reporting through final decision. The framework also addresses anti-money laundering and counter-terrorist financing (AML/CFT), protection from sexual exploitation, abuse and harassment, and safeguards for whistleblowers. Together, these instruments strengthen transparency, integrity and institutional trust.',
    },
    documents: [
      {
        title: { fr: 'Tolérance Zéro à l’égard des Pratiques Interdites', en: 'Zero Tolerance for Prohibited Practices' },
        description: {
          fr: 'Déclaration du Secrétaire Exécutif appliquant une politique de tolérance zéro au personnel, aux partenaires et aux bénéficiaires.',
          en: 'Executive Secretary statement applying a zero-tolerance policy to staff, partners and beneficiaries.',
        },
        resources: [{ urls: { fr: 'https://www.oss-online.org/sites/default/files/2025-10/RIE004-REACC-2-308-DECLARATION-DE-TOLERANCE-ZERO_mai2025.pdf' } }],
      },
      {
        title: { fr: 'Politique des pratiques interdites (PPI)', en: 'Prohibited Practices Policy (PPP)' },
        description: {
          fr: 'Interdiction de la corruption, de la fraude, de la collusion, de la coercition et de l’obstruction, avec obligations et régime de sanctions.',
          en: 'Prohibition of corruption, fraud, collusion, coercion and obstruction, with obligations and a sanctions framework.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-ProhibitedPracticesPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-ProhibitedPracticesPolicy_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Procédure complète sur les pratiques interdites (PCPI/CPPP)', en: 'Comprehensive Procedure for Prohibited Practices (CPPP)' },
        description: {
          fr: 'Réception des allégations, instruction, enquête, mesures conservatoires, décision et voies de recours.',
          en: 'Receipt of allegations, review, investigation, interim measures, decisions and avenues for appeal.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-ComprehensiveProcedure_for_ProhibitedPractices%28CPPP%29_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-ComprehensiveProcedure_for_ProhibitedPractices%28CPPP%29_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Politique LBA/FT', en: 'AML/CFT Policy' },
        description: {
          fr: 'Approche fondée sur les risques, diligence raisonnable, surveillance, signalement, conservation des dossiers et exclusions.',
          en: 'Risk-based approach covering due diligence, monitoring, reporting, record retention and exclusions.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-AMLCFTPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-AMLCFTPolicy_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Protection des lanceurs d’alerte et des témoins', en: 'Whistleblower and Witness Protection' },
        description: {
          fr: 'Confidentialité, protection contre les représailles et traitement impartial des signalements internes et externes.',
          en: 'Confidentiality, protection from retaliation and impartial handling of internal and external reports.',
        },
        resources: [
          {
            label: copy.policy,
            urls: {
              fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-Whistleblowing%26WitnessProtectionPolicy_Fr.pdf',
              en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-Whistleblowing%26WitnessProtectionPolicy_Eng.pdf',
            },
          },
          {
            label: copy.procedure,
            urls: {
              fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-Whistleblowing%26WitnessProtectionProcedure%28WWPP%29_Fr.pdf',
              en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-Whistleblowing%26WitnessProtectionProcedure%28WWPP%29_Eng.pdf',
            },
          },
        ],
      },
      {
        title: { fr: 'Politique de sauvegarde contre l’exploitation, les abus & le harcèlement sexuels', en: 'Safeguarding Policy against Sexual Exploitation, Abuse & Harassment' },
        description: {
          fr: 'Définitions, comportements prohibés, obligations, dispositifs d’alerte et accompagnement des victimes.',
          en: 'Definitions, prohibited conduct, obligations, reporting arrangements and support for victims.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-SSEAH_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-SSEAH_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Mécanisme d’appel, procédure (AMP)', en: 'Appeal Mechanism Procedure (AMP)' },
        description: {
          fr: 'Voies de recours lorsque l’accès à l’information reste totalement ou partiellement refusé après réexamen.',
          en: 'Appeal routes when access to information remains fully or partially denied after reconsideration.',
        },
        resources: [{ urls: { en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-AppealMechanismProcedure%28AMP%29_Eng.pdf' } }],
      },
      {
        title: { fr: 'Code de conduite', en: 'Code of Conduct' },
        description: {
          fr: 'Cadre éthique et déontologique portant sur les conflits d’intérêts, la transparence et la responsabilité.',
          en: 'Ethical framework addressing conflicts of interest, transparency and accountability.',
        },
        resources: [{ urls: { fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-CodeConduite_Fr.pdf' } }],
      },
      {
        title: { fr: 'Formulaire de signalement de comportement inapproprié', en: 'Misconduct Reporting Form' },
        description: {
          fr: 'Formulaire permettant un signalement, y compris anonyme, par email, ligne directe, fax ou courrier.',
          en: 'Form for reporting misconduct, including anonymously, by email, hotline, fax or post.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-09/Misconduct%20reporting%20form%20%28Fr%29.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-09/Misconduct%20reporting%20form%20%28Eng%29.pdf',
        } }],
      },
    ],
  },
  {
    id: 'sauvegardes-environnementales-sociales-genre',
    title: {
      fr: 'Sauvegardes environnementales, sociales & genre',
      en: 'Environmental, social & gender safeguards',
    },
    introduction: {
      fr: 'L’OSS s’engage à intégrer systématiquement les dimensions environnementales, sociales et de genre dans la conception, la décision et la mise en œuvre de ses projets. Sa politique environnementale et sociale exige l’identification, l’évaluation et la gestion rigoureuse des risques, avec une attention particulière aux populations vulnérables. La politique de genre vise à promouvoir l’égalité et à intégrer cette dimension dans toutes les politiques et activités. Une procédure complète encadre également la réception, le traitement et la résolution des griefs liés aux sauvegardes environnementales et sociales et à l’équité de genre. Ensemble, ces instruments traduisent l’engagement de l’OSS en faveur d’un développement durable, inclusif et équitable.',
      en: 'OSS is committed to systematically integrating environmental, social and gender considerations into project design, decision-making and implementation. Its environmental and social policy requires rigorous risk identification, assessment and management, with particular attention to vulnerable communities. The gender policy promotes equality and mainstreams gender across policies and activities. A comprehensive procedure also governs the receipt, handling and resolution of grievances related to environmental and social safeguards and gender equity. Together, these instruments reflect the OSS commitment to sustainable, inclusive and equitable development.',
    },
    documents: [
      {
        title: { fr: 'Politique environnementale & sociale (PES)', en: 'Environmental & Social Policy (ESP)' },
        description: {
          fr: 'Intégration des exigences environnementales et sociales, gestion des risques, populations vulnérables, divulgation et consultation.',
          en: 'Integration of environmental and social requirements, risk management, vulnerable communities, disclosure and consultation.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-EnvironmentalSocialPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-EnvironmentalSocialPolicy_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Politique de genre (PG)', en: 'Gender Policy (GP)' },
        description: {
          fr: 'Égalité et intégration du genre dans les politiques, programmes et projets, avec résultats sensibles au genre et renforcement des capacités.',
          en: 'Gender equality and mainstreaming across policies, programmes and projects, including gender-responsive results and capacity development.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-GenderPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-GenderPolicy_En.pdf',
        } }],
      },
      {
        title: { fr: 'Mécanisme global de protection & règlement des doléances', en: 'Comprehensive Social & Environmental Grievance and Protection Mechanism' },
        description: {
          fr: 'Réception, traitement et résolution des plaintes liées aux sauvegardes environnementales et sociales et à la protection sociale.',
          en: 'Receipt, handling and resolution of complaints related to environmental and social safeguards and social protection.',
        },
        resources: [{ urls: { en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-Compr.Social%26Environm.Griev_.%26Prot.MechanismProcedure%28CSEGPMP%29_Eng.pdf' } }],
      },
      {
        title: { fr: 'Politique de déplacement involontaire & de réinstallation', en: 'Involuntary Resettlement Policy' },
        description: {
          fr: 'Principes, exigences, rôles et responsabilités pour l’élaboration du Plan de Réinstallation des Populations.',
          en: 'Principles, requirements, roles and responsibilities for preparing population resettlement plans.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-RessettlementPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-RessettlementPolicy_Eng.pdf',
        } }],
      },
    ],
  },
  {
    id: 'transparence-information-communication',
    title: {
      fr: 'Transparence, accès à l’information & communication',
      en: 'Transparency, access to information & communication',
    },
    introduction: {
      fr: 'L’OSS s’engage en faveur d’une transparence active et responsable dans toutes ses activités. Sa politique de transparence établit un cadre clair pour l’accès du public et des partenaires à l’information, fondé sur l’ouverture, le dialogue et la protection des données sensibles. La politique de communication institutionnelle définit les modalités de diffusion, garantit le droit d’appel en cas de refus de divulgation et promeut une communication claire, cohérente et inclusive. Une procédure dédiée précise les étapes, les délais et les acteurs impliqués dans la gestion des demandes d’accès à l’information. Ensemble, ces instruments renforcent la responsabilité de l’OSS envers ses parties prenantes et contribuent à une gouvernance ouverte et participative.',
      en: 'OSS is committed to active and responsible transparency across all its activities. Its transparency policy establishes a clear framework for public and partner access to information based on openness, dialogue and protection of sensitive data. The institutional communication policy defines disclosure arrangements, guarantees a right of appeal when disclosure is denied and promotes clear, consistent and inclusive communication. A dedicated procedure specifies the stages, timelines and actors involved in managing access-to-information requests. Together, these instruments reinforce OSS accountability to its stakeholders and support open, participatory governance.',
    },
    documents: [
      {
        title: { fr: 'Politique de transparence', en: 'Transparency Policy' },
        description: {
          fr: 'Règles d’accès à l’information, principes d’ouverture, protection des informations sensibles, dialogue et mécanismes de plainte.',
          en: 'Rules for access to information, openness, protection of sensitive information, dialogue and complaint mechanisms.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-TransparencyPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-TransparencyPolicy_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Politique de communication', en: 'Communication Policy' },
        description: {
          fr: 'Principes de la communication institutionnelle et de la diffusion, avec droit d’appel en cas de refus.',
          en: 'Principles for institutional communication and disclosure, with a right of appeal when disclosure is denied.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-CommunicationPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-CommunicationPolicy_En.pdf',
        } }],
      },
      {
        title: { fr: 'Procédure de communication', en: 'Communication Procedure' },
        description: {
          fr: 'Mise en œuvre de l’accès public à l’information, avec acteurs, étapes, délais et traitement des réclamations liées à la non-divulgation.',
          en: 'Implementation of public access to information, including actors, stages, timelines and handling of non-disclosure complaints.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-10/OSS-CommunicationProcedure_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-10/OSS-CommunicationProcedure_Eng.pdf',
        } }],
      },
    ],
  },
  {
    id: 'principes-fiduciaires-marches',
    title: {
      fr: 'Principes fiduciaires & passation des marchés',
      en: 'Fiduciary principles & procurement',
    },
    introduction: {
      fr: 'L’OSS s’engage à garantir une gestion fiduciaire rigoureuse et transparente de ses ressources financières. Sa politique fiduciaire établit un cadre solide pour une utilisation efficace et responsable des fonds, fondé sur des contrôles internes renforcés, la prévention des fraudes et des mécanismes clairs de responsabilité. La politique de passation des marchés définit les principes de transparence, d’équité, de concurrence et de redevabilité qui régissent tous les achats, de la planification à la gestion contractuelle. Une procédure détaillée précise les rôles, les contrôles, le mécanisme de non-objection, la publication des attributions et les exigences documentaires. Ensemble, ces instruments assurent une utilisation intègre et efficiente des ressources.',
      en: 'OSS is committed to rigorous and transparent fiduciary management of its financial resources. Its fiduciary policy provides a strong framework for efficient and responsible use of funds based on reinforced internal controls, fraud prevention and clear accountability mechanisms. The procurement policy defines the principles of transparency, fairness, competition and accountability governing purchases from planning through contract management. A detailed procedure specifies roles, controls, the no-objection mechanism, publication of awards and documentation requirements. Together, these instruments ensure the sound and efficient use of resources.',
    },
    documents: [
      {
        title: { fr: 'Politique des principes & normes fiduciaires (FPSP)', en: 'Fiduciary Principles & Standards Policy (FPSP)' },
        description: {
          fr: 'Contrôles internes, prévention de la fraude et des malversations, responsabilités et redevabilité.',
          en: 'Internal controls, prevention of fraud and misconduct, responsibilities and accountability.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-FiduciaryPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-FiduciaryPolicy_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Politique de passation des marchés (PPM)', en: 'Procurement Policy' },
        description: {
          fr: 'Normes applicables aux achats de l’OSS, de la planification et la publicité à l’évaluation, l’attribution et la gestion des contrats.',
          en: 'Standards governing OSS procurement, from planning and advertising through evaluation, award and contract management.',
        },
        resources: [{ urls: {
          fr: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-ProcurementPolicy_Fr.pdf',
          en: 'https://www.oss-online.org/sites/default/files/2025-08/OSS-ProcurementPolicy_Eng.pdf',
        } }],
      },
      {
        title: { fr: 'Règles de passation des marchés des bénéficiaires', en: 'Beneficiary Procurement Rules' },
        description: {
          fr: 'Règles opérationnelles pour les projets financés via l’OSS, couvrant les rôles, les contrôles, la non-objection, la publication des attributions, la conformité et les exclusions.',
          en: 'Operational rules for projects financed through OSS, covering roles, controls, no-objection, publication of awards, compliance and exclusions.',
        },
      },
    ],
  },
];

function resourceUrl(resource: DocumentResource, locale: Locale) {
  return resource.urls[locale] || resource.urls[locale === 'fr' ? 'en' : 'fr'];
}

export default function Integrity() {
  const { lang } = useParams<{ lang: string }>();
  const locale: Locale = lang === 'en' ? 'en' : 'fr';
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % sections.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + sections.length) % sections.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = sections.length - 1;

    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextSection = sections[nextIndex];
    setActiveSectionId(nextSection.id);
    document.getElementById(`tab-${nextSection.id}`)?.focus();
  };

  return (
    <main className="font-oss min-h-screen bg-oss-paper pb-24 text-ink antialiased lg:pb-28">
      <header className="mx-auto max-w-[1400px] px-6 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-12 lg:pt-24">
        <span className="mb-7 block h-1 w-16 bg-oss-green" aria-hidden="true" />
        <h1 className="max-w-5xl text-4xl font-bold leading-[1.06] tracking-[-0.035em] text-oss-blue-dark sm:text-5xl lg:text-6xl">
          {copy.title[locale]}
        </h1>
        <p className="mt-7 max-w-3xl border-l-4 border-oss-ochre pl-6 text-lg leading-relaxed text-ink/68 sm:text-xl">
          {copy.introduction[locale]}
        </p>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div
          role="tablist"
          aria-label={locale === 'fr' ? 'Sections du cadre d’intégrité' : 'Integrity framework sections'}
          className="grid gap-px border border-oss-line bg-oss-line md:grid-cols-2 xl:grid-cols-4"
        >
          {sections.map((section, index) => {
            const isActive = section.id === activeSection.id;

            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`tab-${section.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${section.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveSectionId(section.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className={`relative flex min-h-24 items-center px-5 py-5 text-left text-sm font-bold leading-snug transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oss-green ${
                  isActive
                    ? 'bg-oss-blue-dark text-white after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-oss-green'
                    : 'bg-white text-oss-blue-dark hover:bg-oss-green/10'
                }`}
              >
                {section.title[locale]}
              </button>
            );
          })}
        </div>

        <section
          key={activeSection.id}
          role="tabpanel"
          id={`panel-${activeSection.id}`}
          aria-labelledby={`tab-${activeSection.id}`}
          className="pt-14 lg:pt-20"
        >
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <span className="mb-6 block h-1 w-12 bg-oss-green" aria-hidden="true" />
              <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-[-0.025em] text-oss-blue-dark sm:text-4xl">
                {activeSection.title[locale]}
              </h2>
            </div>
            <p className="max-w-4xl text-base leading-[1.85] text-ink/68 sm:text-lg">
              {activeSection.introduction[locale]}
            </p>
          </div>

          <div className="mt-12 grid gap-px border border-oss-line bg-oss-line md:grid-cols-2">
            {activeSection.documents.map((document) => (
              <article key={document.title.fr} className="flex min-h-64 flex-col bg-white p-6 sm:p-7">
                <FileText className="h-6 w-6 text-oss-green" aria-hidden="true" />
                <h3 className="mt-6 text-lg font-bold leading-snug text-oss-blue-dark sm:text-xl">
                  {document.title[locale]}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/60 sm:text-[15px]">
                  {document.description[locale]}
                </p>
                {document.resources && (
                  <div className="mt-auto flex flex-wrap gap-x-6 gap-y-3 pt-7">
                    {document.resources.map((resource, index) => {
                      const url = resourceUrl(resource, locale);
                      if (!url) return null;
                      return (
                        <a
                          key={`${url}-${index}`}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-oss-blue transition-colors hover:text-oss-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oss-green"
                        >
                          {(resource.label || copy.openDocument)[locale]}
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
