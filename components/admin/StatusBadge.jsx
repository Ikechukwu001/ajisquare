const TONES = {
  gray: "border-border bg-white text-muted",
  green: "border-green-300 bg-green-50 text-green-800",
  amber: "border-amber-300 bg-amber-50 text-amber-800",
  red: "border-red-300 bg-red-50 text-red-700",
  blue: "border-blue-300 bg-blue-50 text-blue-800",
};

export default function StatusBadge({ tone = "gray", children }) {
  return (
    <span className={`inline-block whitespace-nowrap border px-2 py-0.5 text-xs ${TONES[tone] || TONES.gray}`}>
      {children}
    </span>
  );
}