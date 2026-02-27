const signals = [
  {
    title: 'Verified Game Stores',
    description: 'Meet at real local game stores with established reputations.',
  },
  {
    title: 'Both-Party Confirmation',
    description: 'Both traders confirm the meetup happened. No one-sided disputes.',
  },
  {
    title: 'Ratings & Reviews',
    description: 'Build trust over time. See who the reliable traders are.',
  },
  {
    title: 'Blocking & Reporting',
    description: 'Full control over who you interact with. Report bad actors instantly.',
  },
];

export const TrustSafety = () => (
  <section className="px-4 py-16 lg:py-24">
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-4 text-center text-3xl font-bold text-foreground">
        Built for Trust &amp; Safety
      </h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
        Every feature is designed to make local trading safe and reliable.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {signals.map((signal) => (
          <div
            key={signal.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="mb-2 font-semibold text-foreground">
              {signal.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {signal.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
