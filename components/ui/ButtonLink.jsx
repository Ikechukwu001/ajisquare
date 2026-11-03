import Link from "next/link";

const variants = {
  primary: "bg-foreground text-white hover:bg-accent",
  gold: "bg-gold text-foreground hover:bg-accent hover:text-white",
  outline: "border border-foreground text-foreground hover:bg-foreground hover:text-white",
  light: "bg-white text-foreground hover:bg-gold",
  outlineLight: "border border-white/70 text-white hover:bg-white hover:text-foreground",
};

export default function ButtonLink({ href, variant = "primary", className = "", children }) {
  const classes = `inline-flex items-center justify-center px-7 py-3 text-sm font-medium uppercase tracking-wider transition-colors ${
    variants[variant] || variants.primary
  } ${className}`;

  // Full web addresses (like WhatsApp links) open in a new tab
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}