import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { u as useMutation } from "../_chunks/_libs/@tanstack/react-query.mjs";
import { D as DemoOfferCard, a as DemoMeetupCard, P as PhoneFrame, o as orpc, S as SuccessScreen, C as CardAutocomplete } from "./CardAutocomplete-b7spMNHe.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { J as JsonLd, S as SITE_URL } from "./router-B2HqKRbu.mjs";
import "../_chunks/_libs/@tanstack/query-core.mjs";
import "../_chunks/_libs/@orpc/client.mjs";
import "../_chunks/_libs/@orpc/shared.mjs";
import "../_chunks/_libs/@orpc/standard-server-fetch.mjs";
import "../_chunks/_libs/@orpc/standard-server.mjs";
import "../_chunks/_libs/@orpc/tanstack-query.mjs";
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
import "./index.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:https";
import "node:http2";
const TCG_OPTIONS = [
  { value: "pokemon", label: "Pokemon" },
  { value: "mtg", label: "Magic: The Gathering" },
  { value: "yugioh", label: "Yu-Gi-Oh!" }
];
const LISTING_TYPE_OPTIONS = [
  { value: "wtt", label: "Trade", description: "Looking to trade" },
  { value: "wtb", label: "Buy", description: "Looking to buy" },
  { value: "wts", label: "Sell", description: "Looking to sell" }
];
const PreRegistrationForm = () => {
  const [email, setEmail] = reactExports.useState("");
  const [displayName, setDisplayName] = reactExports.useState("");
  const [tcg, setTcg] = reactExports.useState("pokemon");
  const [selectedCard, setSelectedCard] = reactExports.useState(null);
  const [cardName, setCardName] = reactExports.useState("");
  const [listingType, setListingType] = reactExports.useState("wtt");
  const [askingPrice, setAskingPrice] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [zipCode, setZipCode] = reactExports.useState("");
  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions()
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      email,
      display_name: displayName || null,
      tcg,
      card_name: selectedCard?.name ?? cardName,
      card_set: selectedCard?.setName ?? null,
      card_external_id: selectedCard?.externalId ?? null,
      card_image_url: selectedCard?.imageUrl ?? null,
      listing_type: listingType,
      asking_price: askingPrice ? parseFloat(askingPrice) : null,
      city: city || null,
      zip_code: zipCode || null
    });
  };
  const handleReset = () => {
    mutation.reset();
    setEmail("");
    setDisplayName("");
    setTcg("pokemon");
    setSelectedCard(null);
    setCardName("");
    setListingType("wtt");
    setAskingPrice("");
    setCity("");
    setZipCode("");
  };
  if (mutation.isSuccess) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      SuccessScreen,
      {
        position: mutation.data.position,
        email,
        onReset: handleReset
      }
    );
  }
  const resolvedCardName = selectedCard?.name ?? cardName;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mx-auto max-w-lg space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "email", className: "block text-sm font-medium text-foreground mb-1.5", children: [
        "Email ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "email",
          type: "email",
          required: true,
          value: email,
          onChange: (e) => setEmail(e.target.value),
          placeholder: "you@example.com",
          className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "displayName", className: "block text-sm font-medium text-foreground mb-1.5", children: [
        "Display Name ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          id: "displayName",
          type: "text",
          value: displayName,
          onChange: (e) => setDisplayName(e.target.value),
          placeholder: "TraderJoe",
          className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-foreground mb-1.5", children: [
        "Which TCG? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: TCG_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setTcg(option.value);
            setSelectedCard(null);
            setCardName("");
          },
          className: `flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${tcg === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent"}`,
          children: option.label
        },
        option.value
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-foreground mb-1.5", children: [
        "What card? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CardAutocomplete,
        {
          tcg,
          onSelect: (card) => {
            setSelectedCard(card);
            setCardName(card.name);
          },
          selectedCard,
          onClear: () => {
            setSelectedCard(null);
            setCardName("");
          }
        }
      ),
      !selectedCard && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: cardName,
          onChange: (e) => setCardName(e.target.value),
          placeholder: "Or type card name manually",
          className: "mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-foreground mb-1.5", children: [
        "What do you want to do? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: LISTING_TYPE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setListingType(option.value),
          className: `flex-1 rounded-lg border px-3 py-2.5 text-center transition-colors ${listingType === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-medium", children: option.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `block text-xs ${listingType === option.value ? "text-primary-foreground/70" : "text-muted-foreground"}`, children: option.description })
          ]
        },
        option.value
      )) })
    ] }),
    (listingType === "wts" || listingType === "wtb") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "askingPrice", className: "block text-sm font-medium text-foreground mb-1.5", children: [
        listingType === "wts" ? "Asking Price" : "Budget",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", children: "$" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "askingPrice",
            type: "number",
            step: "0.01",
            min: "0",
            value: askingPrice,
            onChange: (e) => setAskingPrice(e.target.value),
            placeholder: "0.00",
            className: "w-full rounded-lg border border-input bg-background pl-7 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "city", className: "block text-sm font-medium text-foreground mb-1.5", children: "City" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "city",
            type: "text",
            value: city,
            onChange: (e) => setCity(e.target.value),
            placeholder: "San Francisco",
            className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "zipCode", className: "block text-sm font-medium text-foreground mb-1.5", children: "Zip Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "zipCode",
            type: "text",
            value: zipCode,
            onChange: (e) => setZipCode(e.target.value),
            placeholder: "94102",
            className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] })
    ] }),
    mutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-sm text-destructive", children: mutation.error.message || "Something went wrong. Please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "submit",
        disabled: mutation.isPending || !email || !resolvedCardName,
        className: "w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
        children: mutation.isPending ? "Registering..." : "Get Early Access"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "No spam, ever. We'll only email when we launch in your area." })
  ] });
};
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/demo",
              className: "text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline",
              children: "Try Demo"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "#register",
              className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
              children: "Get Early Access"
            }
          )
        ] })
      ] })
    }
  );
};
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-[90%]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DemoOfferCard, { onCounterOffer: () => {
    } }) }),
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
        "a",
        {
          href: "#register",
          className: "inline-block rounded-xl bg-primary px-8 py-3.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
          children: "Get Early Access"
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
        to: "/demo",
        className: "text-sm text-muted-foreground hover:text-foreground transition-colors",
        children: "Demo"
      }
    )
  ] })
] }) });
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "register", className: "scroll-mt-20 px-4 py-16 lg:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-1 text-center text-2xl font-bold text-foreground", children: "Be First in Your Area" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-8 text-center text-muted-foreground", children: "Pre-register with a card you want to trade. Your listing goes live on day one." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PreRegistrationForm, {})
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(JsonLd, { data: softwareAppJsonLd })
  ] });
}
export {
  LandingPage as component
};
