import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { a as useQuery } from "../_chunks/_libs/@tanstack/react-query.mjs";
import { R as RPCLink, c as createORPCClient } from "../_chunks/_libs/@orpc/client.mjs";
import { c as createRouterUtils } from "../_chunks/_libs/@orpc/tanstack-query.mjs";
const SuccessScreen = ({ position, email, onReset }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md text-center py-12 px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 text-6xl", children: "🎉" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "You're in!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mb-2", children: [
      "We've registered ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: email }),
      " for early access."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6 rounded-xl bg-primary/10 p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "Your position in your area" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-4xl font-bold text-primary", children: [
        "#",
        position
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "We'll email you when TCG Trade Hub launches in your area. Your card listing will be ready to go on day one." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onReset,
        className: "text-sm text-primary hover:underline",
        children: "Register another email"
      }
    )
  ] });
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
const link = new RPCLink({
  url: typeof window !== "undefined" ? `${window.location.origin}/api/rpc` : "http://localhost:3000/api/rpc"
});
const client = createORPCClient(link);
const orpc = createRouterUtils(client);
const CardAutocomplete = ({
  tcg,
  onSelect,
  selectedCard,
  onClear
}) => {
  const [query, setQuery] = reactExports.useState("");
  const [debouncedQuery, setDebouncedQuery] = reactExports.useState("");
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const containerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);
  reactExports.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { data: cards = [], isFetching } = useQuery({
    ...orpc.card.search.queryOptions({
      input: { query: debouncedQuery, tcg }
    }),
    enabled: debouncedQuery.length >= 2
  });
  const handleSelect = (card) => {
    onSelect(card);
    setQuery("");
    setIsOpen(false);
  };
  if (selectedCard) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: selectedCard.imageUrl,
          alt: selectedCard.name,
          className: "h-16 w-12 rounded object-cover"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate", children: selectedCard.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground truncate", children: [
          selectedCard.setName,
          " · ",
          selectedCard.rarity
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onClear,
          className: "shrink-0 text-sm text-muted-foreground hover:text-foreground",
          children: "Change"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "text",
        value: query,
        onChange: (e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        },
        onFocus: () => query.length >= 2 && setIsOpen(true),
        placeholder: "Search for a card...",
        className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      }
    ),
    isFetching && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }) }),
    isOpen && cards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-64 overflow-y-auto", children: cards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => handleSelect(card),
        className: "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: card.imageUrl,
              alt: card.name,
              className: "h-12 w-9 rounded object-cover"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: card.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
              card.setName,
              " · ",
              card.rarity,
              card.marketPrice != null && ` · $${card.marketPrice.toFixed(2)}`
            ] })
          ] })
        ]
      }
    ) }, card.externalId)) }),
    isOpen && debouncedQuery.length >= 2 && !isFetching && cards.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-10 mt-1 w-full rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg", children: "No cards found" })
  ] });
};
export {
  CardAutocomplete as C,
  DemoOfferCard as D,
  PhoneFrame as P,
  SuccessScreen as S,
  DemoMeetupCard as a,
  orpc as o
};
