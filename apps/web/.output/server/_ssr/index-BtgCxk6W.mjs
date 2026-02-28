import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { J as JsonLd, S as SITE_URL } from "./router-CJrfgYso.mjs";
import "../_libs/tiny-warning.mjs";
import "../_chunks/_libs/@tanstack/router-core.mjs";
import "../_libs/cookie-es.mjs";
import "../_chunks/_libs/@tanstack/history.mjs";
import "../_libs/tiny-invariant.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_chunks/_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_chunks/_libs/@tanstack/query-core.mjs";
import "../_chunks/_libs/@tanstack/react-query.mjs";
import "./index.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
const Navbar = () => {
  const [scrolled, setScrolled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "nav",
    {
      className: `fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-background"}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl items-center justify-between px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/", className: "text-lg font-bold text-foreground", children: "TCG Trade Hub" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-6 md:flex", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how-it-works", className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children: "How It Works" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children: "Features" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#faq", className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children: "FAQ" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/get-started",
            className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
            children: "Get Started"
          }
        ) })
      ] })
    }
  );
};
const PhoneFrame = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mx-auto flex w-full max-w-[420px] flex-col overflow-hidden rounded-[2.5rem] border-2 border-border bg-background shadow-2xl ${className ?? "h-[85vh] max-h-[800px]"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-8 pb-1 pt-3 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "9:41" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col overflow-hidden", children })
  ] });
};
const CardChip$1 = ({ name, set, price }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-6 rounded bg-primary/20 text-[8px] flex items-center justify-center text-primary font-bold", children: "TCG" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground truncate", children: name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
      set,
      " · ",
      price
    ] })
  ] })
] });
const StaticOfferCard = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary", children: "Trade Offer" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Offering" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardChip$1, { name: "Charizard ex", set: "151", price: "$185" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "↓" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Requesting" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardChip$1, { name: "Umbreon ex", set: "Obsidian Flames", price: "$95" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardChip$1, { name: "Mew ex", set: "151", price: "$35" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "💰" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-success", children: "+ $50 cash" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground", children: "Make Your Counter-Offer" })
  ] })
] });
const StaticChatPreview = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary", children: "TM" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "TraderMike" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Online" })
    ] })
  ] }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-hidden p-4 pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-fit rounded-full bg-secondary px-3 py-1 text-[10px] text-muted-foreground", children: "You matched with TraderMike" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-xs text-secondary-foreground", children: "Hey! Saw your Charizard listing. Interested in a trade?" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-xs text-primary-foreground", children: "Sure! What do you have?" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[80%] rounded-2xl rounded-bl-md bg-secondary px-3 py-2 text-xs text-secondary-foreground", children: "Here's what I'm thinking:" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[90%]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaticOfferCard, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6" })
  ] })
] });
const Hero = () => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative px-4 pt-28 pb-16 lg:pt-32 lg:pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl flex-col items-center gap-12 lg:flex-row lg:gap-16", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center lg:text-left", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl", children: [
      "Trade Pokemon, MTG & Yu-Gi-Oh Cards",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Locally" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-lg text-muted-foreground lg:text-xl", children: "No shipping fees. No scam risk. Meet collectors near you and trade face-to-face." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/get-started",
          className: "inline-block rounded-xl bg-primary px-8 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
          children: "Get Started"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "#how-it-works",
          className: "inline-block rounded-xl border border-border px-8 py-3.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent",
          children: "See How It Works"
        }
      )
    ] })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden w-full max-w-[380px] lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { className: "h-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StaticChatPreview, {}) }) })
] }) });
const tcgBadges = [
  { label: "Pokemon", color: "text-yellow-400" },
  { label: "Magic: The Gathering", color: "text-blue-400" },
  { label: "Yu-Gi-Oh!", color: "text-red-400" }
];
const SocialProofBar = () => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-border bg-card/50 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-center sm:gap-8", children: [
  tcgBadges.map((badge) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `text-sm font-semibold ${badge.color}`,
      children: badge.label
    },
    badge.label
  )),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "Coming to iOS & Android" })
] }) });
const steps = [
  {
    num: "1",
    title: "List a Card",
    description: "Post a card you want to trade, buy, or sell with one tap."
  },
  {
    num: "2",
    title: "Swipe Nearby",
    description: "Browse listings from collectors in your area."
  },
  {
    num: "3",
    title: "Match & Negotiate",
    description: "When interest is mutual, chat and build structured offers."
  },
  {
    num: "4",
    title: "Meet & Trade",
    description: "Meet at a verified local game store. Both confirm completion."
  }
];
const HowItWorks = () => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how-it-works", className: "scroll-mt-20 px-4 py-16 lg:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-12 text-center text-3xl font-bold text-foreground", children: "How It Works" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-4", children: steps.map((step) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground", children: step.num }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-lg font-semibold text-foreground", children: step.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: step.description })
  ] }, step.num)) })
] }) });
const FeatureSection = ({
  id,
  title,
  description,
  visual,
  reversed = false
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    id,
    className: `scroll-mt-20 flex flex-col items-center gap-8 py-12 lg:gap-16 ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-center lg:text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-2xl font-bold text-foreground", children: title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full max-w-sm flex-shrink-0 items-center justify-center", children: visual })
    ]
  }
);
const tcgs = [
  {
    name: "Pokemon",
    color: "border-yellow-500/30 bg-yellow-500/5",
    textColor: "text-yellow-400",
    description: "From vintage Base Set to the latest Scarlet & Violet expansions."
  },
  {
    name: "Magic: The Gathering",
    color: "border-blue-500/30 bg-blue-500/5",
    textColor: "text-blue-400",
    description: "Standard, Modern, Commander — find cards for every format."
  },
  {
    name: "Yu-Gi-Oh!",
    color: "border-red-500/30 bg-red-500/5",
    textColor: "text-red-400",
    description: "Trade singles, build decks, and complete your collection locally."
  }
];
const TcgShowcase = () => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-12 text-center text-3xl font-bold text-foreground", children: "Every Major TCG, One App" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-3", children: tcgs.map((tcg) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `rounded-xl border p-6 text-center ${tcg.color}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mb-3 text-lg font-bold ${tcg.textColor}`, children: tcg.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: tcg.description })
      ]
    },
    tcg.name
  )) })
] }) });
const signals = [
  {
    title: "Verified Game Stores",
    description: "Meet at real local game stores with established reputations."
  },
  {
    title: "Both-Party Confirmation",
    description: "Both traders confirm the meetup happened. No one-sided disputes."
  },
  {
    title: "Ratings & Reviews",
    description: "Build trust over time. See who the reliable traders are."
  },
  {
    title: "Blocking & Reporting",
    description: "Full control over who you interact with. Report bad actors instantly."
  }
];
const TrustSafety = () => /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 py-16 lg:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-center text-3xl font-bold text-foreground", children: "Built for Trust & Safety" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mb-12 max-w-2xl text-center text-muted-foreground", children: "Every feature is designed to make local trading safe and reliable." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 sm:grid-cols-2", children: signals.map((signal) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "rounded-xl border border-border bg-card p-5",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 font-semibold text-foreground", children: signal.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: signal.description })
      ]
    },
    signal.title
  )) })
] }) });
const faqItems = [
  {
    question: "Is TCG Trade Hub free to use?",
    answer: "Yes! TCG Trade Hub is free to download and use. Create listings, swipe, match, and chat at no cost."
  },
  {
    question: "What trading card games are supported?",
    answer: "We support Pokemon, Magic: The Gathering, and Yu-Gi-Oh! with card database search and pricing for all three."
  },
  {
    question: "How do you keep trades safe?",
    answer: "We encourage meetups at verified local game stores, require both parties to confirm trade completion, and provide ratings, reviews, blocking, and reporting tools."
  },
  {
    question: "When is the app launching?",
    answer: "TCG Trade Hub is currently in development. Pre-register now to get early access and have your first listing ready on launch day."
  },
  {
    question: "Can I buy and sell cards, or only trade?",
    answer: "All three! You can list cards as Want to Trade (WTT), Want to Buy (WTB), or Want to Sell (WTS)."
  },
  {
    question: "How does the matching system work?",
    answer: "Browse nearby listings and swipe right on cards that interest you. When another collector swipes right on your listing too, you match and can start chatting."
  },
  {
    question: "Do I need to ship cards?",
    answer: "No. TCG Trade Hub is local-only. You meet face-to-face with nearby collectors — no shipping, no waiting, no risk of damage in transit."
  },
  {
    question: "What if someone doesn't show up?",
    answer: "Our rating system tracks reliability. Both parties must confirm a meetup happened. Repeated no-shows get flagged, and you can report and block bad actors."
  }
];
const FaqAccordionItem = ({ item }) => {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen(!open),
        className: "flex w-full items-center justify-between py-4 text-left",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pr-4 font-medium text-foreground", children: item.question }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "flex-shrink-0 text-muted-foreground transition-transform duration-200",
              style: { transform: open ? "rotate(180deg)" : "rotate(0deg)" },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" }) })
            }
          )
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pb-4 text-sm text-muted-foreground", children: item.answer })
  ] });
};
const FaqSection = () => {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "faq", className: "scroll-mt-20 px-4 py-16 lg:py-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-12 text-center text-3xl font-bold text-foreground", children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y-0 border-t border-border", children: faqItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(FaqAccordionItem, { item }, item.question)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: faqJsonLd })
  ] });
};
const Footer = () => /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
    "© ",
    (/* @__PURE__ */ new Date()).getFullYear(),
    " TCG Trade Hub. All rights reserved."
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/terms",
        className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: "Terms"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/privacy",
        className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: "Privacy"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/get-started",
        className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: "Get Started"
      }
    )
  ] })
] }) });
const offeringCards = [
  { name: "Charizard ex", set: "151", price: "$185" }
];
const requestingCards = [
  { name: "Umbreon ex", set: "Obsidian Flames", price: "$95" },
  { name: "Mew ex", set: "151", price: "$35" }
];
const CardChip = ({ card }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-6 rounded bg-primary/20 text-[8px] flex items-center justify-center text-primary font-bold", children: "TCG" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground truncate", children: card.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
      card.set,
      " · ",
      card.price
    ] })
  ] })
] });
const DemoOfferCard = ({ onCounterOffer }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary", children: "Trade Offer" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Offering" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: offeringCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(CardChip, { card }, card.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "↓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Requesting" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: requestingCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(CardChip, { card }, card.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "💰" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-success", children: "+ $50 cash" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onCounterOffer,
          className: "w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
          children: "Make Your Counter-Offer"
        }
      )
    ] })
  ] });
};
const DemoMeetupCard = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-success/10 px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-success", children: "Meetup Proposal" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "📍" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Cool Stuff Games" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "1234 Main St, Orlando, FL" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "📅" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "Saturday, 2:00 PM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Mar 8, 2025" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            disabled: true,
            className: "flex-1 rounded-lg border border-success/30 bg-success/10 py-2 text-xs font-medium text-success/50 cursor-not-allowed",
            children: "Accept"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            disabled: true,
            className: "flex-1 rounded-lg border border-border bg-secondary py-2 text-xs font-medium text-muted-foreground cursor-not-allowed",
            children: "Suggest New Time"
          }
        )
      ] })
    ] })
  ] });
};
const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TCG Trade Hub",
  applicationCategory: "GameApplication",
  operatingSystem: "iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD"
  },
  description: "Local trading card game marketplace for Pokemon, Magic: The Gathering, and Yu-Gi-Oh collectors to buy, sell, and trade cards face-to-face.",
  url: SITE_URL
};
const SwipeCardVisual = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-64", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-2 h-72 w-full rounded-2xl border border-border bg-card/50 -rotate-3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-72 w-full rounded-2xl border border-border bg-card p-5 shadow-lg rotate-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 h-32 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl text-primary/30 font-bold", children: "TCG" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Charizard VMAX" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Brilliant Stars · $45" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "0.3 miles away" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 rounded-lg bg-destructive/10 py-1.5 text-center text-xs font-medium text-destructive", children: "Pass" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 rounded-lg bg-success/10 py-1.5 text-center text-xs font-medium text-success", children: "Interested" })
    ] })
  ] })
] });
const MultiTcgVisual = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 justify-center", children: [{
  name: "Pokemon",
  color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
}, {
  name: "MTG",
  color: "border-blue-500/30 bg-blue-500/10 text-blue-400"
}, {
  name: "Yu-Gi-Oh!",
  color: "border-red-500/30 bg-red-500/10 text-red-400"
}].map((tcg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex h-36 w-24 flex-col items-center justify-center rounded-xl border ${tcg.color}`, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold opacity-40", children: "TCG" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 text-[10px] font-semibold", children: tcg.name })
] }, tcg.name)) });
function LandingPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Hero, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SocialProofBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HowItWorks, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 py-8 lg:py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureSection, { id: "features", title: "Swipe Matching", description: "Browse nearby listings and swipe right on cards that interest you. When another collector swipes right on your listing too, you match instantly and can start chatting.", visual: /* @__PURE__ */ jsxRuntimeExports.jsx(SwipeCardVisual, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureSection, { title: "Structured Trade Offers", description: "Build detailed trade proposals with specific cards, sets, and cash supplements. No more vague DMs — both sides see exactly what's on the table.", visual: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DemoOfferCard, { onCounterOffer: () => {
      } }) }), reversed: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureSection, { title: "Safe Local Meetups", description: "Propose meetups at verified local game stores with specific times. Both parties confirm completion. Safe, accountable, face-to-face trading.", visual: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DemoMeetupCard, {}) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FeatureSection, { title: "Multi-TCG Support", description: "Whether you collect Pokemon, Magic: The Gathering, or Yu-Gi-Oh!, search from real card databases with images, set info, and market pricing.", visual: /* @__PURE__ */ jsxRuntimeExports.jsx(MultiTcgVisual, {}), reversed: true })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TcgShowcase, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TrustSafety, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FaqSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 py-16 text-center lg:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold tracking-tight text-foreground sm:text-4xl", children: "Ready to start trading?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-lg text-muted-foreground", children: "Try the experience and sign up for early access in under a minute." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/get-started", className: "mt-6 inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90", children: "Get Started" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: softwareAppJsonLd })
  ] });
}
export {
  LandingPage as component
};
