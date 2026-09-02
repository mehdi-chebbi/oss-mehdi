import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Position = [number, number];
type PolygonCoordinates = Position[][];
type MultiPolygonCoordinates = Position[][][];

interface CountryFeature {
  type: 'Feature';
  properties: {
    iso_a3?: string;
    adm0_a3?: string;
    name?: string;
    name_fr?: string;
    name_en?: string;
    continent?: string;
    subregion?: string;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: PolygonCoordinates | MultiPolygonCoordinates;
  };
}

interface WorldGeoJson {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

type MemberGroup = 'africa' | 'international' | null;
type Locale = 'fr' | 'en';

interface MapCountry {
  code: string;
  name: string;
  region: string;
  group: MemberGroup;
  flagCode?: string;
  path: string;
}

interface MapViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const fullMapViewBox: MapViewBox = { x: 0, y: 0, width: 1000, height: 500 };

const africanMemberCodes = new Set([
  'DZA', 'BEN', 'BFA', 'CMR', 'CIV', 'DJI', 'EGY', 'ERI', 'ETH', 'GMB',
  'GIN', 'GNB', 'KEN', 'LBR', 'LBY', 'MLI', 'MAR', 'MRT', 'NER',
  'NGA', 'UGA', 'CAF', 'SEN', 'SOM', 'SDN', 'TCD', 'TUN',
]);

const internationalMemberCodes = new Set(['DEU', 'BEL', 'CAN', 'FRA', 'ITA', 'LUX', 'CHE']);

const countryFlagCodes: Record<string, string> = {
  DZA: 'dz', BEN: 'bj', BFA: 'bf', CMR: 'cm', CIV: 'ci', DJI: 'dj', EGY: 'eg', ERI: 'er',
  ETH: 'et', GMB: 'gm', GIN: 'gn', GNB: 'gw', KEN: 'ke', LBR: 'lr', LBY: 'ly', MLI: 'ml',
  MAR: 'ma', MRT: 'mr', NER: 'ne', NGA: 'ng', UGA: 'ug', CAF: 'cf', SEN: 'sn', SOM: 'so',
  SDN: 'sd', TCD: 'td', TUN: 'tn', DEU: 'de', BEL: 'be', CAN: 'ca', FRA: 'fr', ITA: 'it',
  LUX: 'lu', CHE: 'ch',
};

const frenchRegionNames: Record<string, string> = {
  Africa: 'Afrique',
  'Eastern Africa': "Afrique de l'Est",
  'Middle Africa': 'Afrique centrale',
  'Northern Africa': 'Afrique du Nord',
  'Southern Africa': 'Afrique australe',
  'Western Africa': "Afrique de l'Ouest",
  Europe: 'Europe',
  'Eastern Europe': "Europe de l'Est",
  'Northern Europe': 'Europe du Nord',
  'Southern Europe': 'Europe du Sud',
  'Western Europe': 'Europe occidentale',
  'North America': 'Amérique du Nord',
  'Northern America': 'Amérique du Nord',
  'Latin America and the Caribbean': 'Amérique latine et Caraïbes',
  Asia: 'Asie',
  Oceania: 'Océanie',
};

function project([longitude, latitude]: Position) {
  return [((longitude + 180) / 360) * 1000, ((90 - latitude) / 180) * 500] as const;
}

function ringToPath(ring: Position[]) {
  return ring
    .map((position, index) => {
      const [x, y] = project(position);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ') + ' Z';
}

function geometryToPath(feature: CountryFeature) {
  if (feature.geometry.type === 'Polygon') {
    return (feature.geometry.coordinates as PolygonCoordinates).map(ringToPath).join(' ');
  }

  return (feature.geometry.coordinates as MultiPolygonCoordinates)
    .flatMap((polygon) => polygon.map(ringToPath))
    .join(' ');
}

function getCountryCode(feature: CountryFeature) {
  const isoCode = feature.properties.iso_a3;
  return isoCode && isoCode !== '-99' ? isoCode : feature.properties.adm0_a3 ?? '';
}

function getMemberGroup(code: string): MemberGroup {
  if (africanMemberCodes.has(code)) return 'africa';
  if (internationalMemberCodes.has(code)) return 'international';
  return null;
}

function getRegionName(feature: CountryFeature, locale: Locale) {
  const region = feature.properties.subregion || feature.properties.continent || '';
  return locale === 'fr' ? frenchRegionNames[region] || region : region;
}

function getCountryDescription(country: MapCountry, locale: Locale) {
  if (locale === 'en') {
    const location = country.region
      ? `This country is located in ${country.region}.`
      : 'This country is one of the territories shown on this map.';

    if (country.group === 'africa') {
      return `${location} It is one of the OSS African member countries.`;
    }

    if (country.group === 'international') {
      return `${location} It is one of the OSS non-African member countries.`;
    }

    return `${location} It is not currently an OSS member country.`;
  }

  const location = country.region
    ? `Ce pays se trouve en ${country.region}.`
    : 'Ce pays fait partie des territoires représentés sur cette carte.';

  if (country.group === 'africa') {
    return `${location} Ce pays fait partie des membres africains de l'OSS.`;
  }

  if (country.group === 'international') {
    return `${location} Ce pays fait partie des membres non africains de l'OSS.`;
  }

  return `${location} Il ne figure pas actuellement parmi les pays membres de l'OSS.`;
}

function countryClasses(country: MapCountry, selectedCode: string | null) {
  if (selectedCode === country.code) return 'fill-oss-ochre';
  if (country.group === 'africa') return 'fill-oss-green hover:fill-oss-ochre focus:fill-oss-ochre';
  if (country.group === 'international') return 'fill-oss-blue hover:fill-oss-ochre focus:fill-oss-ochre';
  return 'fill-[#d9e2e7]';
}

export default function MemberWorldMap({ locale }: { locale: Locale }) {
  const mapRef = useRef<SVGSVGElement | null>(null);
  const [world, setWorld] = useState<WorldGeoJson | null>(null);
  const [error, setError] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mapViewBox, setMapViewBox] = useState<MapViewBox>(fullMapViewBox);
  const [popupSide, setPopupSide] = useState<'left' | 'right'>('right');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const controller = new AbortController();

    fetch('/custom.geo.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load the world map');
        return response.json() as Promise<WorldGeoJson>;
      })
      .then(setWorld)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(true);
      });

    return () => controller.abort();
  }, []);

  const countries = useMemo<MapCountry[]>(() => {
    if (!world) return [];

    return world.features.map((feature) => {
      const code = getCountryCode(feature);
      return {
        code,
        name: locale === 'fr'
          ? feature.properties.name_fr || feature.properties.name_en || feature.properties.name || code
          : feature.properties.name_en || feature.properties.name || feature.properties.name_fr || code,
        region: getRegionName(feature, locale),
        group: getMemberGroup(code),
        flagCode: countryFlagCodes[code],
        path: geometryToPath(feature),
      };
    });
  }, [locale, world]);

  const selectedCountry = countries.find((country) => country.code === selectedCode);
  const memberCountries = useMemo(
    () => countries
      .filter((country) => country.group !== null)
      .sort((first, second) => first.name.localeCompare(second.name, locale)),
    [countries, locale],
  );

  const resetMap = () => {
    setSelectedCode(null);
    setMapViewBox(fullMapViewBox);
  };

  const selectCountry = (country: MapCountry, element: SVGPathElement) => {
    if (selectedCode === country.code) {
      element.blur();
      resetMap();
      return;
    }

    const bounds = element.getBBox();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const targetWidth = Math.min(1000, Math.max(90, bounds.width * 2.2, bounds.height * 4.4));
    const targetHeight = targetWidth / 2;
    const x = Math.min(1000 - targetWidth, Math.max(0, centerX - targetWidth / 2));
    const y = Math.min(500 - targetHeight, Math.max(0, centerY - targetHeight / 2));

    setSelectedCode(country.code);
    setPopupSide(centerX >= 500 ? 'left' : 'right');
    setMapViewBox({ x, y, width: targetWidth, height: targetHeight });
  };

  const selectCountryFromList = (code: string) => {
    if (!code) {
      resetMap();
      return;
    }

    const country = countries.find((item) => item.code === code);
    const element = mapRef.current?.querySelector<SVGPathElement>(`[data-country-code="${code}"]`);
    if (country && element) selectCountry(country, element);
  };

  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-white px-6 text-center text-sm text-ink/55">
        {locale === 'fr'
          ? <>La carte des pays membres n&apos;a pas pu être chargée.</>
          : 'The member countries map could not be loaded.'}
      </div>
    );
  }

  if (!world) {
    return (
      <div
        className="min-h-[420px] animate-pulse bg-white p-6"
        aria-label={locale === 'fr' ? 'Chargement de la carte' : 'Loading the map'}
      >
        <div className="h-full min-h-[372px] bg-oss-blue/5" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white">
      <div className="relative bg-[#edf4f6] px-0 py-3 sm:px-5 sm:py-6">
        <div className="px-3 pb-3 sm:hidden">
          <label htmlFor="member-country-select" className="mb-2 block text-sm font-bold text-oss-blue-dark">
            {locale === 'fr' ? 'Choisir un pays membre' : 'Choose a member country'}
          </label>
          <select
            id="member-country-select"
            value={selectedCode ?? ''}
            onChange={(event) => selectCountryFromList(event.target.value)}
            className="min-h-12 w-full border border-oss-blue/25 bg-white px-3 text-base text-oss-blue-dark outline-none focus:border-oss-blue focus:ring-2 focus:ring-oss-blue/20"
          >
            <option value="">{locale === 'fr' ? 'Afficher la carte complète' : 'Show the full map'}</option>
            {memberCountries.map((country) => (
              <option key={country.code} value={country.code}>{country.name}</option>
            ))}
          </select>
        </div>

        <motion.svg
          ref={mapRef}
          viewBox="0 0 1000 500"
          initial={false}
          animate={{ viewBox: `${mapViewBox.x} ${mapViewBox.y} ${mapViewBox.width} ${mapViewBox.height}` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          role="img"
          aria-labelledby="member-map-title member-map-description"
          className="mx-auto block h-auto w-full max-w-[1200px] touch-manipulation"
        >
          <title id="member-map-title">
            {locale === 'fr' ? <>Carte mondiale des pays membres de l&apos;OSS</> : 'World map of OSS member countries'}
          </title>
          <desc id="member-map-description">
            {locale === 'fr'
              ? 'Les membres africains sont en vert et les membres non africains sont en bleu.'
              : 'African members are shown in green and non-African members in blue.'}
          </desc>
          <g>
            {countries.map((country, index) => {
              const isMember = country.group !== null;
              return (
                <path
                  key={`${country.code || country.name}-${index}`}
                  data-country-code={country.code}
                  d={country.path}
                  fillRule="evenodd"
                  stroke="#ffffff"
                  strokeWidth={0.7}
                  vectorEffect="non-scaling-stroke"
                  tabIndex={isMember ? 0 : -1}
                  role={isMember ? 'button' : undefined}
                  aria-label={isMember
                    ? locale === 'fr'
                      ? `${country.name}, ${country.group === 'africa' ? 'pays africain membre' : 'pays membre non africain'}`
                      : `${country.name}, ${country.group === 'africa' ? 'African member country' : 'non-African member country'}`
                    : undefined}
                  className={`${countryClasses(country, selectedCode)} ${
                    isMember ? 'cursor-pointer outline-none' : 'pointer-events-none outline-none'
                  } transition-colors duration-200`}
                  onClick={isMember ? (event) => selectCountry(country, event.currentTarget) : undefined}
                  onKeyDown={isMember
                    ? (event) => {
                        if (event.key !== 'Enter' && event.key !== ' ') return;
                        event.preventDefault();
                        selectCountry(country, event.currentTarget);
                      }
                    : undefined}
                >
                  <title>{country.name}</title>
                </path>
              );
            })}
          </g>
        </motion.svg>

        <div className="pointer-events-none relative mx-3 mt-3 flex flex-wrap gap-x-4 gap-y-2 border border-oss-line bg-white/95 px-4 py-3 text-xs font-semibold text-oss-blue-dark shadow-[0_10px_28px_rgba(9,54,85,0.12)] sm:absolute sm:bottom-6 sm:left-6 sm:mx-0 sm:mt-0 sm:flex-col sm:text-sm">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-oss-green sm:h-3 sm:w-3" aria-hidden="true" />{locale === 'fr' ? 'Afrique, 28 membres' : 'Africa, 28 members'}</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 bg-oss-blue sm:h-3 sm:w-3" aria-hidden="true" />{locale === 'fr' ? 'International, 7 membres' : 'International, 7 members'}</span>
        </div>

        <AnimatePresence mode="wait">
          {selectedCountry && (
            <motion.aside
              key={selectedCountry.code}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: popupSide === 'left' ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    x: popupSide === 'left' ? -16 : 16,
                    transition: { duration: 0.2, delay: 0 },
                  }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.38, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`relative mx-3 mt-3 overflow-hidden border border-oss-line bg-white p-5 shadow-[0_16px_40px_rgba(9,54,85,0.16)] sm:absolute sm:top-6 sm:z-20 sm:mx-0 sm:mt-0 sm:w-[300px] ${
                popupSide === 'left' ? 'sm:left-6 sm:right-auto' : 'sm:left-auto sm:right-6'
              }`}
              aria-live="polite"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1 ${
                  selectedCountry.group === 'africa'
                    ? 'bg-oss-green'
                    : selectedCountry.group === 'international'
                      ? 'bg-oss-blue'
                      : 'bg-[#aab9c1]'
                }`}
                aria-hidden="true"
              />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-oss-ochre">
                    {locale === 'fr'
                      ? selectedCountry.group === 'africa'
                        ? 'Membre africain'
                        : selectedCountry.group === 'international'
                          ? 'Membre international'
                          : 'Pays non membre'
                      : selectedCountry.group === 'africa'
                        ? 'African member'
                        : selectedCountry.group === 'international'
                          ? 'International member'
                          : 'Non-member country'}
              </p>
              <div className="mt-2 flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-oss-blue-dark">{selectedCountry.name}</h3>
                {selectedCountry.flagCode && (
                  <img
                    src={`/flags/${selectedCountry.flagCode}.svg`}
                    alt={locale === 'fr' ? `Drapeau de ${selectedCountry.name}` : `Flag of ${selectedCountry.name}`}
                    className="h-12 w-16 shrink-0 border border-oss-line object-cover"
                  />
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-ink/65">{getCountryDescription(selectedCountry, locale)}</p>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
