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
  onClear,
  onAddCustomText
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
    isOpen && debouncedQuery.length >= 2 && !isFetching && cards.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg", children: onAddCustomText ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          onAddCustomText(query);
          setQuery("");
          setIsOpen(false);
        },
        className: "flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-accent transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4 shrink-0 text-primary", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5v14M5 12h14" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
            "Add ‘",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: query }),
            "’ as custom item"
          ] })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "p-4 text-center text-sm text-muted-foreground", children: "No cards found" }) })
  ] });
};
const CardPill = ({ card, onRemove }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: card.imageUrl,
        alt: card.name,
        className: "h-12 w-9 shrink-0 rounded object-cover shadow-sm"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate leading-tight", children: card.name }),
      card.rarity && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground leading-tight", children: card.rarity })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs font-semibold text-foreground tabular-nums", children: card.marketPrice != null ? `$${card.marketPrice.toFixed(2)}` : "--" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onRemove(card.externalId),
        className: "shrink-0 rounded-full p-0.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors",
        "aria-label": `Remove ${card.name}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6L6 18M6 6l12 12" }) })
      }
    )
  ] });
};
const offerItemId = (item) => item.type === "card" ? item.card.externalId : item.id;
const flattenToCards = (items) => items.flatMap((i) => i.type === "card" ? [i.card] : []);
const LISTING_TYPE_OPTIONS = [
  { value: "wtt", label: "Trade" },
  { value: "wtb", label: "Buy" },
  { value: "wts", label: "Sell" }
];
const OfferSection = ({
  label,
  items,
  onItemsChange,
  enableCash = false,
  borderColor,
  dotColor
}) => {
  const [showCash, setShowCash] = reactExports.useState(false);
  const [cashAmount, setCashAmount] = reactExports.useState("");
  const handleAddCard = (card) => {
    if (items.some((i) => i.type === "card" && i.card.externalId === card.externalId)) return;
    onItemsChange([...items, { type: "card", card }]);
  };
  const handleAddCustom = (text) => {
    onItemsChange([...items, { type: "custom", id: crypto.randomUUID(), text }]);
  };
  const handleRemove = (id) => {
    onItemsChange(items.filter((i) => offerItemId(i) !== id));
  };
  const handleClear = () => {
    onItemsChange([]);
    setShowCash(false);
    setCashAmount("");
  };
  const cardTotal = items.reduce(
    (sum, i) => sum + (i.type === "card" ? i.card.marketPrice ?? 0 : 0),
    0
  );
  const cashValue = showCash ? parseFloat(cashAmount) || 0 : 0;
  const cardCount = items.filter((i) => i.type === "card").length;
  const customCount = items.filter((i) => i.type === "custom").length;
  const itemCountLabel = [
    cardCount > 0 ? `${cardCount} ${cardCount === 1 ? "card" : "cards"}` : null,
    customCount > 0 ? `${customCount} custom` : null
  ].filter(Boolean).join(" + ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border-2 ${borderColor} bg-card overflow-hidden`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full ${dotColor}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-foreground", children: label })
      ] }),
      items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleClear,
          className: "text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors",
          children: "Clear"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/50" }),
    items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        item.type === "card" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CardPill, { card: item.card, onRemove: (id) => handleRemove(id) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-9 shrink-0 items-center justify-center rounded bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-5 w-5 text-muted-foreground", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M14 2v6h6M16 13H8M16 17H8M10 9H8" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-foreground truncate leading-tight", children: item.text }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 inline-block rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-400 leading-tight", children: "Custom item" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs font-semibold text-muted-foreground tabular-nums", children: "--" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleRemove(item.id),
              className: "shrink-0 rounded-full p-0.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors",
              "aria-label": `Remove ${item.text}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6L6 18M6 6l12 12" }) })
            }
          )
        ] }),
        i < items.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-3 border-t border-border/40" })
      ] }, offerItemId(item))),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-3 border-t border-border/40" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CardAutocomplete,
      {
        tcg: "pokemon",
        onSelect: handleAddCard,
        selectedCard: null,
        onClear: () => {
        },
        onAddCustomText: handleAddCustom
      }
    ) }),
    enableCash && !showCash && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-3 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setShowCash(true),
        className: "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" }) }),
          "Add Cash"
        ]
      }
    ) }),
    enableCash && showCash && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-3 pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
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
            className: "w-full rounded-lg border border-input bg-background pl-7 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setShowCash(false);
            setCashAmount("");
          },
          className: "shrink-0 rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
          "aria-label": "Remove cash",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18 6L6 18M6 6l12 12" }) })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/50 bg-secondary/30 px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground", children: "Total Value" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground/70", children: [
          itemCountLabel || "0 items",
          showCash && cashAmount ? " + cash" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-bold text-primary tabular-nums", children: [
        "$",
        (cardTotal + cashValue).toFixed(2)
      ] })
    ] }) })
  ] });
};
const CashOnlySection = ({ label, borderColor, dotColor }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border-2 ${borderColor} bg-card overflow-hidden`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-full ${dotColor}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-foreground", children: label })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 px-4 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-10 w-10 text-muted-foreground/40", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Cash" })
    ] })
  ] });
};
const TradeEditor = ({
  listingType,
  myOfferItems,
  theirOfferItems,
  onMyOfferItemsChange,
  onTheirOfferItemsChange,
  onListingTypeChange,
  onSubmit,
  onBack
}) => {
  const isSubmitDisabled = listingType === "wtt" && (myOfferItems.length === 0 || theirOfferItems.length === 0) || listingType === "wts" && myOfferItems.length === 0 || listingType === "wtb" && theirOfferItems.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col overflow-hidden min-h-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border bg-card px-4 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: onBack,
          className: "text-primary hover:text-primary/80 transition-colors",
          "aria-label": "Go back",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M15 19l-7-7 7-7" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-foreground", children: "Trade Details" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2", children: "I want to..." }),
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
      listingType === "wtb" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CashOnlySection, { label: "My Offer", borderColor: "border-primary", dotColor: "bg-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        OfferSection,
        {
          label: "My Offer",
          items: myOfferItems,
          onItemsChange: onMyOfferItemsChange,
          enableCash: true,
          borderColor: "border-primary",
          dotColor: "bg-primary"
        }
      ),
      listingType === "wts" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CashOnlySection, { label: "Their Offer", borderColor: "border-violet-400", dotColor: "bg-violet-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        OfferSection,
        {
          label: "Their Offer",
          items: theirOfferItems,
          onItemsChange: onTheirOfferItemsChange,
          borderColor: "border-violet-400",
          dotColor: "bg-violet-400"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onSubmit,
        disabled: isSubmitDisabled,
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
  const [location, setLocation] = reactExports.useState("");
  const [touched, setTouched] = reactExports.useState({});
  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const emailError = !email.trim() ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Please enter a valid email" : null;
  const firstCard = selectedCards[0];
  const mutation = useMutation(
    orpc.preRegistration.create.mutationOptions()
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true });
    if (emailError || !firstCard) return;
    mutation.mutate(
      {
        email,
        display_name: displayName || null,
        tcg: firstCard.tcg ?? "pokemon",
        card_name: firstCard.name,
        card_set: firstCard.setName ?? null,
        card_external_id: firstCard.externalId ?? null,
        card_image_url: firstCard.imageUrl ?? null,
        listing_type: listingType,
        city: location || null
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
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { noValidate: true, onSubmit: handleSubmit, className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
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
            onBlur: () => markTouched("email"),
            placeholder: "you@example.com",
            "aria-invalid": touched.email && !!emailError,
            "aria-describedby": touched.email && emailError ? "demo-email-error" : void 0,
            className: `w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${touched.email && emailError ? "border-destructive ring-2 ring-destructive/30 focus:ring-destructive" : "border-input focus:ring-ring"}`
          }
        ),
        touched.email && emailError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "demo-email-error", role: "alert", className: "mt-1 text-xs text-destructive", children: emailError })
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "demo-city", className: "block text-xs font-medium text-foreground mb-1.5", children: "City" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "demo-city",
            type: "text",
            value: location,
            onChange: (e) => setLocation(e.target.value),
            placeholder: "San Francisco",
            className: "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          }
        )
      ] }),
      mutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-destructive/10 p-3 text-xs text-destructive", children: mutation.error.message || "Something went wrong. Please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: mutation.isPending,
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
    text: "Hey! We're building the easiest way to trade cards locally."
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
  const [myOfferItems, setMyOfferItems] = reactExports.useState([]);
  const [theirOfferItems, setTheirOfferItems] = reactExports.useState([]);
  const [listingType, setListingType] = reactExports.useState("wtt");
  const [successData, setSuccessData] = reactExports.useState(null);
  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const handleReset = reactExports.useCallback(() => {
    setPhase("chat");
    setMyOfferItems([]);
    setTheirOfferItems([]);
    setListingType("wtt");
    setTimeout(() => {
      setSuccessData(null);
    }, 500);
  }, []);
  const emailCards = flattenToCards(
    listingType === "wtb" ? theirOfferItems : myOfferItems
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex flex-1 min-h-0 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      style: { transform: `translateX(-${phaseIndex * 100}%)` },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full shrink-0 flex flex-col overflow-hidden", children: [
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
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full shrink-0 flex flex-col overflow-hidden min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          TradeEditor,
          {
            listingType,
            myOfferItems,
            theirOfferItems,
            onMyOfferItemsChange: setMyOfferItems,
            onTheirOfferItemsChange: setTheirOfferItems,
            onListingTypeChange: setListingType,
            onSubmit: () => setPhase("email"),
            onBack: () => setPhase("chat")
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full shrink-0 flex flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          EmailCaptureStep,
          {
            selectedCards: emailCards,
            listingType,
            onSuccess: (position, email) => {
              setSuccessData({ position, email });
              setPhase("success");
            },
            onBack: () => setPhase("trade-editor")
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full shrink-0 flex flex-col overflow-hidden", children: successData ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          SuccessScreen,
          {
            position: successData.position,
            email: successData.email,
            onReset: handleReset
          }
        ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}) })
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
