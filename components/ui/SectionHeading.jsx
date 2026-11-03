export default function SectionHeading({ title, subtitle, className = "" }) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="font-serif text-3xl sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-xl text-muted">{subtitle}</p>}
    </div>
  );
}