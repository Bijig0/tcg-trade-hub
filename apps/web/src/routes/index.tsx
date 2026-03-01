import { createFileRoute, Link } from '@tanstack/react-router';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { SocialProofBar } from '@/components/landing/SocialProofBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { TcgShowcase } from '@/components/landing/TcgShowcase';
import { TrustSafety } from '@/components/landing/TrustSafety';
import { FaqSection } from '@/components/landing/FaqSection';
import { Footer } from '@/components/landing/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL } from '@/components/seo/seoConstants';
import { DemoOfferCard } from '@/components/demo/DemoOfferCard';
import { DemoMeetupCard } from '@/components/demo/DemoMeetupCard';

const softwareAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TCG Trade Hub',
  applicationCategory: 'GameApplication',
  operatingSystem: 'iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Local trading card game marketplace for Pokemon, Magic: The Gathering, and Yu-Gi-Oh collectors to buy, sell, and trade cards face-to-face.',
  url: SITE_URL,
};

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title:
          'TCG Trade Hub - Trade Pokemon, MTG & Yu-Gi-Oh Cards Locally',
      },
      {
        name: 'description',
        content:
          'Find local trading card game collectors to buy, sell, and trade cards face-to-face. No shipping, no scams. Pre-register for early access.',
      },
      {
        property: 'og:title',
        content:
          'TCG Trade Hub - Trade Pokemon, MTG & Yu-Gi-Oh Cards Locally',
      },
      {
        property: 'og:description',
        content:
          'Find local trading card game collectors to buy, sell, and trade cards face-to-face. No shipping, no scams. Pre-register for early access.',
      },
    ],
  }),
  component: LandingPage,
});

/** Swipe card mockup for the "Swipe Matching" feature visual */
const SwipeCardVisual = () => (
  <div className="relative mx-auto w-64">
    {/* Background card */}
    <div className="absolute left-4 top-2 h-72 w-full rounded-2xl border border-border bg-card/50 -rotate-3" />
    {/* Foreground card */}
    <div className="relative h-72 w-full rounded-2xl border border-border bg-card p-5 shadow-lg rotate-2">
      <div className="mb-3 h-32 rounded-lg bg-primary/10 flex items-center justify-center">
        <span className="text-4xl text-primary/30 font-bold">TCG</span>
      </div>
      <p className="font-semibold text-foreground">Charizard VMAX</p>
      <p className="text-xs text-muted-foreground">Brilliant Stars &middot; $45</p>
      <p className="mt-2 text-xs text-muted-foreground">0.3 miles away</p>
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-lg bg-destructive/10 py-1.5 text-center text-xs font-medium text-destructive">
          Pass
        </div>
        <div className="flex-1 rounded-lg bg-success/10 py-1.5 text-center text-xs font-medium text-success">
          Interested
        </div>
      </div>
    </div>
  </div>
);

/** Multi-TCG card placeholders */
const MultiTcgVisual = () => (
  <div className="flex gap-3 justify-center">
    {[
      { name: 'Pokemon', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400' },
      { name: 'MTG', color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
      { name: 'Yu-Gi-Oh!', color: 'border-red-500/30 bg-red-500/10 text-red-400' },
    ].map((tcg) => (
      <div
        key={tcg.name}
        className={`flex h-36 w-24 flex-col items-center justify-center rounded-xl border ${tcg.color}`}
      >
        <span className="text-2xl font-bold opacity-40">TCG</span>
        <span className="mt-1 text-[10px] font-semibold">{tcg.name}</span>
      </div>
    ))}
  </div>
);

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <SocialProofBar />
      <HowItWorks />

      {/* Features */}
      <section className="px-4 py-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <FeatureSection
            id="features"
            title="Swipe Matching"
            description="Browse nearby listings and swipe right on cards that interest you. When another collector swipes right on your listing too, you match instantly and can start chatting."
            visual={<SwipeCardVisual />}
          />
          <FeatureSection
            title="Structured Trade Offers"
            description="Build detailed trade proposals with specific cards, sets, and cash supplements. No more vague DMs — both sides see exactly what's on the table."
            visual={
              <div className="w-full max-w-xs">
                <DemoOfferCard />
              </div>
            }
            reversed
          />
          <FeatureSection
            title="Safe Local Meetups"
            description="Propose meetups at verified local game stores with specific times. Both parties confirm completion. Safe, accountable, face-to-face trading."
            visual={
              <div className="w-full max-w-xs">
                <DemoMeetupCard />
              </div>
            }
          />
          <FeatureSection
            title="Multi-TCG Support"
            description="Whether you collect Pokemon, Magic: The Gathering, or Yu-Gi-Oh!, search from real card databases with images, set info, and market pricing."
            visual={<MultiTcgVisual />}
            reversed
          />
        </div>
      </section>

      <TcgShowcase />
      <TrustSafety />
      <FaqSection />


      {/* Bottom CTA */}
      <section className="px-4 py-16 text-center lg:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to start trading?
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Try the experience and sign up for early access in under a minute.
          </p>
          <Link
            to="/get-started"
            className="mt-6 inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
      <JsonLd data={softwareAppJsonLd} />
    </div>
  );
}
