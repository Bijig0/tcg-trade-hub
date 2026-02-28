import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { u as useMutation, a as useQuery } from "../_chunks/_libs/@tanstack/react-query.mjs";
import { R as RPCLink, c as createORPCClient } from "../_chunks/_libs/@orpc/client.mjs";
import { c as createRouterUtils } from "../_chunks/_libs/@orpc/tanstack-query.mjs";
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
import "../_chunks/_libs/@orpc/shared.mjs";
import "../_chunks/_libs/@orpc/standard-server-fetch.mjs";
import "../_chunks/_libs/@orpc/standard-server.mjs";
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
const DemoChatHeader = ({ name }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border bg-card px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground", children: name === "TCG Trade Hub" ? "TH" : name.charAt(0).toUpperCase() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-success", children: "Online" })
    ] })
  ] });
};
const DemoMessageBubble = ({ text, sender }) => {
  const isOwn = sender === "own";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${isOwn ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isOwn ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary text-foreground"}`,
      children: text
    }
  ) });
};
const DemoSystemMessage = ({ text }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-full bg-secondary/60 px-4 py-1.5 text-center text-xs text-muted-foreground", children: text }) });
};
const ReservationCard = ({ onBuildList }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary/10 px-4 py-2.5 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "🎯" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-primary", children: "Reserve Your Spot" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Be first to trade when we launch in your area." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-xs text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success mt-0.5", children: "✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pick the cards you want" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-xs text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success mt-0.5", children: "✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Get matched with local traders who have them" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-xs text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success mt-0.5", children: "✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "First access at launch" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onBuildList,
          className: "w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90",
          children: "Build Your List"
        }
      )
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
const CardPill = ({ card, onRemove }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: card.imageUrl,
        alt: card.name,
        className: "h-10 w-7 rounded object-cover"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-foreground truncate", children: card.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground truncate", children: [
        card.setName,
        card.marketPrice != null && ` · $${card.marketPrice.toFixed(2)}`
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onRemove(card.externalId),
        className: "shrink-0 text-muted-foreground hover:text-foreground transition-colors",
        "aria-label": `Remove ${card.name}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6L6 18M6 6l12 12" }) })
      }
    )
  ] });
};
const TCG_OPTIONS = [
  { value: "pokemon", label: "Pokemon" },
  { value: "mtg", label: "MTG" },
  { value: "yugioh", label: "Yu-Gi-Oh!" }
];
const LISTING_TYPE_OPTIONS = [
  { value: "wtt", label: "Trade" },
  { value: "wtb", label: "Buy" },
  { value: "wts", label: "Sell" }
];
const TradeEditor = ({
  selectedCards,
  tcg,
  listingType,
  onTcgChange,
  onListingTypeChange,
  onAddCard,
  onRemoveCard,
  onSubmit,
  onBack
}) => {
  const [cashAmount, setCashAmount] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border bg-card px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onBack,
          className: "text-muted-foreground hover:text-foreground transition-colors",
          "aria-label": "Go back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Build Your Offer" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-muted-foreground mb-2", children: "TCG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: TCG_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => onTcgChange(option.value),
            className: `flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${tcg === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent"}`,
            children: option.label
          },
          option.value
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-muted-foreground mb-2", children: "I want to..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: LISTING_TYPE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => onListingTypeChange(option.value),
            className: `flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${listingType === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:bg-accent"}`,
            children: option.label
          },
          option.value
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-muted-foreground mb-2", children: "Search cards to add" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardAutocomplete,
          {
            tcg,
            onSelect: onAddCard,
            selectedCard: null,
            onClear: () => {
            }
          }
        )
      ] }),
      selectedCards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-muted-foreground mb-2", children: [
          "Your cards (",
          selectedCards.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: selectedCards.map((card) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          CardPill,
          {
            card,
            onRemove: onRemoveCard
          },
          card.externalId
        )) })
      ] }),
      (listingType === "wts" || listingType === "wtb") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-xs font-medium text-muted-foreground mb-2", children: [
          listingType === "wts" ? "Asking Price" : "Budget",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm", children: "$" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              step: "0.01",
              min: "0",
              value: cashAmount,
              onChange: (e) => setCashAmount(e.target.value),
              placeholder: "0.00",
              className: "w-full rounded-lg border border-input bg-background pl-7 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onSubmit,
        disabled: selectedCards.length === 0,
        className: "w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
        children: "Send Offer"
      }
    ) })
  ] });
};
const EmailCaptureStep = ({
  selectedCards,
  listingType,
  onSuccess,
  onBack
}) => {
  const [email, setEmail] = reactExports.useState("");
  const [displayName, setDisplayName] = reactExports.useState("");
  const [city, setCity] = reactExports.useState("");
  const [zipCode, setZipCode] = reactExports.useState("");
  const firstCard = selectedCards[0];
  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions()
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstCard) return;
    mutation.mutate(
      {
        email,
        display_name: displayName || null,
        tcg: firstCard.tcg,
        card_name: firstCard.name,
        card_set: firstCard.setName ?? null,
        card_external_id: firstCard.externalId ?? null,
        card_image_url: firstCard.imageUrl ?? null,
        listing_type: listingType,
        asking_price: null,
        city: city || null,
        zip_code: zipCode || null
      },
      {
        onSuccess: (data) => {
          onSuccess(data.position, email);
        }
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border bg-card px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onBack,
          className: "text-muted-foreground hover:text-foreground transition-colors",
          "aria-label": "Go back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Complete Registration" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your email to save your offer and get notified when TCG Trade Hub launches." }),
      firstCard && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: firstCard.imageUrl,
            alt: firstCard.name,
            className: "h-14 w-10 rounded object-cover"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground truncate", children: firstCard.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: firstCard.setName }),
          selectedCards.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary", children: [
            "+",
            selectedCards.length - 1,
            " more"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "demo-email", className: "block text-xs font-medium text-foreground mb-1.5", children: [
          "Email ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "demo-email",
            type: "email",
            required: true,
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "you@example.com",
            className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "demo-name", className: "block text-xs font-medium text-foreground mb-1.5", children: [
          "Display Name ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "demo-name",
            type: "text",
            value: displayName,
            onChange: (e) => setDisplayName(e.target.value),
            placeholder: "TraderJoe",
            className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "demo-city", className: "block text-xs font-medium text-foreground mb-1.5", children: "City" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "demo-city",
              type: "text",
              value: city,
              onChange: (e) => setCity(e.target.value),
              placeholder: "San Francisco",
              className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "demo-zip", className: "block text-xs font-medium text-foreground mb-1.5", children: "Zip Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "demo-zip",
              type: "text",
              value: zipCode,
              onChange: (e) => setZipCode(e.target.value),
              placeholder: "94102",
              className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            }
          )
        ] })
      ] }),
      mutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-xs text-destructive", children: mutation.error.message || "Something went wrong. Please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: mutation.isPending || !email,
          className: "w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed",
          children: mutation.isPending ? "Registering..." : "Get Early Access"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] text-muted-foreground", children: "No spam, ever. We'll only email when we launch in your area." })
    ] })
  ] });
};
const demoConversation = [
  {
    id: "1",
    type: "system",
    sender: "system",
    text: "Welcome to TCG Trade Hub"
  },
  {
    id: "2",
    type: "text",
    sender: "other",
    text: "Hey! We're building the easiest way to trade cards locally — no shipping, no scams."
  },
  {
    id: "3",
    type: "text",
    sender: "other",
    text: "What cards are you hunting for? Tell us and we'll match you with local traders when we launch."
  },
  {
    id: "4",
    type: "reservation_card",
    sender: "other"
  },
  {
    id: "5",
    type: "system",
    sender: "system",
    text: "Tap above to build your list"
  }
];
const PHASE_ORDER = ["chat", "trade-editor", "email", "success"];
const DemoChat = () => {
  const [phase, setPhase] = reactExports.useState("chat");
  const [selectedCards, setSelectedCards] = reactExports.useState([]);
  const [tcg, setTcg] = reactExports.useState("pokemon");
  const [listingType, setListingType] = reactExports.useState("wtt");
  const [successData, setSuccessData] = reactExports.useState(null);
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const handleAddCard = (card) => {
    setSelectedCards((prev) => {
      if (prev.some((c) => c.externalId === card.externalId)) return prev;
      return [...prev, card];
    });
  };
  const handleRemoveCard = (externalId) => {
    setSelectedCards((prev) => prev.filter((c) => c.externalId !== externalId));
  };
  const handleTcgChange = (newTcg) => {
    setTcg(newTcg);
    setSelectedCards([]);
  };
  const handleReset = reactExports.useCallback(() => {
    setPhase("chat");
    setSelectedCards([]);
    setTcg("pokemon");
    setListingType("wtt");
    setTimeout(() => {
      setSuccessData(null);
    }, 500);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-1 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      style: { transform: `translateX(-${phaseIndex * 100}%)` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "min-w-full flex flex-col overflow-hidden",
            "aria-hidden": phase !== "chat",
            inert: phase !== "chat" || void 0,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DemoChatHeader, { name: "TCG Trade Hub" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: demoConversation.map((msg) => {
                if (msg.type === "system") {
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoSystemMessage, { text: msg.text }, msg.id);
                }
                if (msg.type === "text") {
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    DemoMessageBubble,
                    {
                      text: msg.text,
                      sender: "other"
                    },
                    msg.id
                  );
                }
                if (msg.type === "reservation_card") {
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ReservationCard,
                    {
                      onBuildList: () => setPhase("trade-editor")
                    },
                    msg.id
                  );
                }
                return null;
              }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "min-w-full flex flex-col overflow-hidden",
            "aria-hidden": phase !== "trade-editor",
            inert: phase !== "trade-editor" || void 0,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              TradeEditor,
              {
                selectedCards,
                tcg,
                listingType,
                onTcgChange: handleTcgChange,
                onListingTypeChange: setListingType,
                onAddCard: handleAddCard,
                onRemoveCard: handleRemoveCard,
                onSubmit: () => setPhase("email"),
                onBack: () => setPhase("chat")
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "min-w-full flex flex-col overflow-hidden",
            "aria-hidden": phase !== "email",
            inert: phase !== "email" || void 0,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              EmailCaptureStep,
              {
                selectedCards,
                listingType,
                onSuccess: (position, email) => {
                  setSuccessData({ position, email });
                  setPhase("success");
                },
                onBack: () => setPhase("trade-editor")
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "min-w-full flex flex-col overflow-hidden",
            "aria-hidden": phase !== "success",
            inert: phase !== "success" || void 0,
            children: successData ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SuccessScreen,
              {
                position: successData.position,
                email: successData.email,
                onReset: handleReset
              }
            ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {})
          }
        )
      ]
    }
  ) });
};
function GetStartedPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children: "← Back to home" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl", children: "See how trading works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Chat with a collector, build a counter-offer, and sign up for early access." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DemoChat, {})
  ] });
}
export {
  GetStartedPage as component
};
