interface DomainIntroProps {
  title: string;
  paragraphs: string[];
  image: {
    src: string;
    alt: string;
    position?: string;
  };
}

export default function DomainIntro({ title, paragraphs, image }: DomainIntroProps) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="mb-7 block h-1 w-16 bg-oss-green" aria-hidden="true" />
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-oss-blue-dark sm:text-5xl">
            {title}
          </h1>
          <div className="group mt-9 aspect-video overflow-hidden bg-oss-blue-dark/5">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: image.position || 'center' }}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        </div>
        <div className="max-w-3xl space-y-8 border-l border-oss-line pl-6 text-[17px] leading-[1.85] text-ink/72 sm:pl-9 sm:text-lg lg:pl-12 lg:text-xl">
          {paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={index === 0 ? 'font-semibold text-oss-blue-dark' : undefined}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
