const tcgs = [
  {
    name: 'Pokemon',
    color: 'border-yellow-500/30 bg-yellow-500/5',
    textColor: 'text-yellow-400',
    description: 'From vintage Base Set to the latest Scarlet & Violet expansions.',
  },
  {
    name: 'Magic: The Gathering',
    color: 'border-blue-500/30 bg-blue-500/5',
    textColor: 'text-blue-400',
    description: 'Standard, Modern, Commander — find cards for every format.',
  },
  {
    name: 'Yu-Gi-Oh!',
    color: 'border-red-500/30 bg-red-500/5',
    textColor: 'text-red-400',
    description: 'Trade singles, build decks, and complete your collection locally.',
  },
];

export const TcgShowcase = () => (
  <section className="px-4 py-16">
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
        Every Major TCG, One App
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {tcgs.map((tcg) => (
          <div
            key={tcg.name}
            className={`rounded-xl border p-6 text-center ${tcg.color}`}
          >
            <div className={`mb-3 text-lg font-bold ${tcg.textColor}`}>
              {tcg.name}
            </div>
            <p className="text-sm text-muted-foreground">{tcg.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
