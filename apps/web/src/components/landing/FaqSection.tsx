import { useState } from 'react';
import { JsonLd } from '@/components/seo/JsonLd';

type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: 'Is TCG Trade Hub free to use?',
    answer:
      'Yes! TCG Trade Hub is free to download and use. Create listings, swipe, match, and chat at no cost.',
  },
  {
    question: 'What trading card games are supported?',
    answer:
      'We support Pokemon, Magic: The Gathering, and Yu-Gi-Oh! with card database search and pricing for all three.',
  },
  {
    question: 'How do you keep trades safe?',
    answer:
      'We encourage meetups at verified local game stores, require both parties to confirm trade completion, and provide ratings, reviews, blocking, and reporting tools.',
  },
  {
    question: 'When is the app launching?',
    answer:
      'TCG Trade Hub is currently in development. Pre-register now to get early access and have your first listing ready on launch day.',
  },
  {
    question: 'Can I buy and sell cards, or only trade?',
    answer:
      'All three! You can list cards as Want to Trade (WTT), Want to Buy (WTB), or Want to Sell (WTS).',
  },
  {
    question: 'How does the matching system work?',
    answer:
      'Browse nearby listings and swipe right on cards that interest you. When another collector swipes right on your listing too, you match and can start chatting.',
  },
  {
    question: 'Do I need to ship cards?',
    answer:
      'No. TCG Trade Hub is local-only. You meet face-to-face with nearby collectors — no shipping, no waiting, no risk of damage in transit.',
  },
  {
    question: "What if someone doesn't show up?",
    answer:
      'Our rating system tracks reliability. Both parties must confirm a meetup happened. Repeated no-shows get flagged, and you can report and block bad actors.',
  },
];

const FaqAccordionItem = ({ item }: { item: FaqItem }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="pr-4 font-medium text-foreground">
          {item.question}
        </span>
        <span className="flex-shrink-0 text-muted-foreground transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-4 text-sm text-muted-foreground">
          {item.answer}
        </div>
      )}
    </div>
  );
};

export const FaqSection = () => {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id="faq" className="scroll-mt-20 px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="divide-y-0 border-t border-border">
          {faqItems.map((item) => (
            <FaqAccordionItem key={item.question} item={item} />
          ))}
        </div>
      </div>
      <JsonLd data={faqJsonLd} />
    </section>
  );
};
