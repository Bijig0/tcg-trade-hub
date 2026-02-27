const tcgBadges = [
  { label: 'Pokemon', color: 'text-yellow-400' },
  { label: 'Magic: The Gathering', color: 'text-blue-400' },
  { label: 'Yu-Gi-Oh!', color: 'text-red-400' },
];

export const SocialProofBar = () => (
  <section className="border-y border-border bg-card/50 py-6">
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center sm:gap-8">
      {tcgBadges.map((badge) => (
        <span
          key={badge.label}
          className={`text-sm font-semibold ${badge.color}`}
        >
          {badge.label}
        </span>
      ))}
      <span className="text-sm text-muted-foreground">
        Coming to iOS &amp; Android
      </span>
    </div>
  </section>
);
