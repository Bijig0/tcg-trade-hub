import { Link } from '@tanstack/react-router';
import { PhoneFrame } from '@/components/demo/PhoneFrame';
import { DemoOfferCard } from '@/components/demo/DemoOfferCard';

const StaticChatPreview = () => (
  <div className="flex flex-1 flex-col">
    {/* Header */}
    <div className="border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          TM
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">TraderMike</p>
          <p className="text-[10px] text-muted-foreground">Online</p>
        </div>
      </div>
    </div>
    {/* Messages */}
    <div className="flex-1 space-y-3 overflow-hidden p-4 pb-8">
      <div className="mx-auto w-fit rounded-full bg-secondary px-3 py-1 text-[10px] text-muted-foreground">
        You matched with TraderMike
      </div>
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          Hey! Saw your Charizard listing. Interested in a trade?
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-xs text-primary-foreground">
          Sure! What do you have?
        </div>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          Here's what I'm thinking:
        </div>
      </div>
      <div className="max-w-[90%]">
        <DemoOfferCard onCounterOffer={() => {}} />
      </div>
      <div className="h-6" />
    </div>
  </div>
);

export const Hero = () => (
  <section className="relative px-4 pt-28 pb-16 lg:pt-32 lg:pb-24">
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
      {/* Text */}
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Trade Pokemon, MTG &amp; Yu-Gi-Oh Cards{' '}
          <span className="text-primary">Locally</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground lg:text-xl">
          No shipping fees. No scam risk. Meet collectors near you and trade face-to-face.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
          <a
            href="#register"
            className="inline-block rounded-xl bg-primary px-8 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Early Access
          </a>
          <a
            href="#how-it-works"
            className="inline-block rounded-xl border border-border px-8 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Phone preview — desktop only */}
      <div className="hidden w-full max-w-[380px] lg:block">
        <PhoneFrame className="h-auto">
          <StaticChatPreview />
        </PhoneFrame>
      </div>
    </div>
  </section>
);
