const steps = [
  {
    num: '1',
    title: 'List a Card',
    description: 'Post a card you want to trade, buy, or sell with one tap.',
  },
  {
    num: '2',
    title: 'Swipe Nearby',
    description: 'Browse listings from collectors in your area.',
  },
  {
    num: '3',
    title: 'Match & Negotiate',
    description: 'When interest is mutual, chat and build structured offers.',
  },
  {
    num: '4',
    title: 'Meet & Trade',
    description: 'Meet at a verified local game store. Both confirm completion.',
  },
];

export const HowItWorks = () => (
  <section id="how-it-works" className="scroll-mt-20 px-4 py-16 lg:py-24">
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
        How It Works
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.num} className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
              {step.num}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
