const features = [
  "AI-generated system designs from plain language",
  "Real-time collaborative canvas with live cursors",
  "One-click technical spec export",
];

export function AuthBranding() {
  return (
    <div className="max-w-sm">
      <h1 className="font-serif text-4xl tracking-tight text-copy-primary">
        Ghost AI
      </h1>
      <p className="mt-3 text-base text-copy-secondary">
        Design systems, in seconds.
      </p>
      <ul className="mt-10 space-y-4 text-sm text-copy-muted">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <span aria-hidden className="shrink-0 text-copy-faint">
              —
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
