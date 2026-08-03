import { useState, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Mousewheel, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import type { ToolData } from '@/api/auth';
import { useLocale, localized } from '@/context/locale';

import 'swiper/css';
import 'swiper/css/effect-cards';

// ---- Component ----

interface ToolsProps {
  items: ToolData[];
}

export default function Tools({ items: tools }: ToolsProps) {
  const { locale } = useLocale();
  const [activeIdx, setActiveIdx] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const onSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    setActiveIdx(swiper.realIndex);
  }, []);

  const onSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIdx(swiper.realIndex);
  }, []);

  if (tools.length === 0) return null;

  const active = tools[activeIdx] || tools[0];
  const link = active?.link || '#';

  return (
    <>
      <style>{`
        @media (max-width: 750px) {
          .tools-content {
            flex-direction: column-reverse !important;
            height: auto !important;
            padding: 20px 0;
          }
          .tools-btn {
            margin: 10px auto 40px !important;
          }
          .tools-carousel {
            width: min(420px, calc(100vw - 64px)) !important;
            height: 260px !important;
          }
        }
      `}</style>

      <section
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          background: '#fafaf8',
          padding: '0 16px 40px',
        }}
      >
        {/* Section heading */}
        <div style={{ width: 'min(1100px, calc(100% - 32px))' }}>
          <div
            style={{
              height: '4px',
              width: '48px',
              background: '#489e42',
              margin: '0 0 16px',
              borderRadius: '2px',
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.875rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              fontFamily: "'Fraunces', Georgia, serif",
            }}
          >
            {locale === 'fr' ? 'Nos outils' : 'Our Tools'}
          </h2>
        </div>

        <div
          className="tools-content"
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: '30px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            width: 'min(1100px, calc(100% - 32px))',
            height: '440px',
            boxShadow:
              '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            zIndex: 10,
          }}
        >
          {/* Left — info panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              flex: '1 1 450px',
              maxWidth: '450px',
              padding: '35px',
              textAlign: 'justify',
              fontFamily: "'Comfortaa', cursive",
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <h2
              style={{
                margin: '0 0 16px 0',
                fontWeight: 700,
                fontSize: '1.6rem',
                textAlign: 'center',
                fontFamily: "'Comfortaa', cursive",
                color: '#000000',
                lineHeight: 1.2,
              }}
            >
              {active ? localized(active, 'title', locale) : (locale === 'fr' ? 'Nos outils' : 'Our Tools')}
            </h2>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: '8px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {active ? (
                <p
                  style={{
                    color: '#1a1f1c',
                    fontWeight: 500,
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {localized(active, 'description', locale)}
                </p>
              ) : (
                <p
                  style={{
                    color: '#1a1f1c',
                    fontWeight: 500,
                    fontSize: '1rem',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {locale === 'fr'
                    ? <>Découvrez les{' '}
                      <span
                        style={{
                          background:
                            'linear-gradient(225deg, #ff3cac 0%, #784ba0 50%, #2b86c5 100%)',
                          padding: '0 4px',
                          borderRadius: '4px',
                          color: '#fff',
                        }}
                      >
                        outils numériques
                      </span>{' '}
                      de l'OSS, dédiés au suivi de l'environnement et à l'aide à la
                      décision.</>
                    : <>Discover the{' '}
                      <span
                        style={{
                          background:
                            'linear-gradient(225deg, #ff3cac 0%, #784ba0 50%, #2b86c5 100%)',
                          padding: '0 4px',
                          borderRadius: '4px',
                          color: '#fff',
                        }}
                      >
                        digital tools
                      </span>{' '}
                      of OSS, dedicated to environmental monitoring and decision support.</>}
                </p>
              )}
            </div>

            <a
              className="tools-btn"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '10px 40px',
                margin: '0 auto 0',
                alignSelf: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: '4px',
                outline: 'none',
                textDecoration: 'none',
                color: '#fff',
                background: '#3183d4',
                boxShadow: '0 6px 24px rgba(49, 131, 212, 0.35)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Comfortaa', cursive",
              }}
            >
              {locale === 'fr' ? "Visiter l'outil" : 'Visit Tool'}
            </a>
          </div>

          {/* Right — Swiper cards carousel */}
          <div
            className="tools-carousel"
            style={{
              width: '540px',
              height: '330px',
              display: 'flex',
              alignItems: 'center',
              margin: 'auto 0',
            }}
          >
            <Swiper
              modules={[EffectCards, Mousewheel, Autoplay]}
              effect="cards"
              cardsEffect={{ rotate: true }}
              grabCursor
              initialSlide={Math.min(2, tools.length - 1)}
              speed={500}
              rewind
              mousewheel={{ invert: false }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              onSwiper={onSwiperInit}
              onSlideChange={onSlideChange}
              style={{ width: '100%', height: '100%', padding: '30px 20px' }}
            >
              {tools.map((t) => (
                <SwiperSlide
                  key={t.id}
                  style={{
                    position: 'relative',
                    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px',
                    userSelect: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={t.image}
                    alt={localized(t, 'title', locale)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      background:
                        'linear-gradient(to top, #0f2027, transparent, transparent)',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                    }}
                  />
                  <h2
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      color: '#fff',
                      fontWeight: 400,
                      fontSize: '1.1rem',
                      lineHeight: 1.4,
                      margin: '0 0 20px 20px',
                      fontFamily: "'Comfortaa', cursive",
                    }}
                  >
                    {localized(t, 'title', locale)}
                  </h2>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>
    </>
  );
}
