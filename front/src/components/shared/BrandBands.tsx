export default function BrandBands({ className = '' }: { className?: string }) {
  return (
    <div className={`oss-bands ${className}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
