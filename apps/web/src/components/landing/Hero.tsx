import { Link } from '@tanstack/react-router';
import { PhoneFrame } from './PhoneFrame';

const CardChip = ({ name, set, price }: { name: string; set: string; price: string }) => (
  <div className="flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2">
    <div className="h-8 w-6 rounded bg-primary/20 text-[8px] flex items-center justify-center text-primary font-bold">
      TCG
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-foreground truncate">{name}</p>
      <p className="text-[10px] text-muted-foreground">{set} &middot; {price}</p>
    </div>
  </div>
);

const StaticOfferCard = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="bg-primary/10 px-4 py-2.5">
      <p className="text-xs font-semibold text-primary">Trade Offer</p>
    </div>
    <div className="space-y-3 p-4">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Offering
        </p>
        <CardChip name="Charizard ex" set="151" price="$185" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">&darr;</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Requesting
        </p>
        <div className="space-y-1.5">
          <CardChip name="Umbreon ex" set="Obsidian Flames" price="$95" />
          <CardChip name="Mew ex" set="151" price="$35" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2">
        <span className="text-sm">&#128176;</span>
        <p className="text-xs font-medium text-success">+ $50 cash</p>
      </div>
      <div className="w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">
        Make Your Counter-Offer
      </div>
    </div>
  </div>
);

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
        <StaticOfferCard />
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
          <Link
            to="/get-started"
            className="inline-block rounded-xl bg-primary px-8 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            to="/get-started"
            className="inline-block rounded-xl border border-border px-8 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            See How It Works
          </Link>
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
