import { j as jsxRuntimeExports, r as reactExports } from "../_chunks/_libs/react.mjs";
import { L as Link } from "../_chunks/_libs/@tanstack/react-router.mjs";
import { P as PhoneFrame, D as DemoOfferCard, a as DemoMeetupCard, S as SuccessScreen, C as CardAutocomplete, o as orpc } from "./CardAutocomplete-b7spMNHe.mjs";
import { u as useMutation } from "../_chunks/_libs/@tanstack/react-query.mjs";
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
import "../_chunks/_libs/@orpc/client.mjs";
import "../_chunks/_libs/@orpc/shared.mjs";
import "../_chunks/_libs/@orpc/standard-server-fetch.mjs";
import "../_chunks/_libs/@orpc/standard-server.mjs";
import "../_chunks/_libs/@orpc/tanstack-query.mjs";
import "../_chunks/_libs/@tanstack/query-core.mjs";
const DemoChatHeader = ({ name }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border bg-card px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary", children: name.charAt(0).toUpperCase() }),
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
    text: "You matched with TraderMike on a Charizard listing"
  },
  {
    id: "2",
    type: "text",
    sender: "other",
    text: "Hey! I saw your listing. I have a Charizard ex from 151 - would you trade?"
  },
  {
    id: "3",
    type: "text",
    sender: "other",
    text: "Here's what I'm thinking:"
  },
  {
    id: "4",
    type: "card_offer",
    sender: "other"
  },
  {
    id: "5",
    type: "text",
    sender: "other",
    text: "Let me know what you think!"
  },
  {
    id: "6",
    type: "meetup_proposal",
    sender: "other"
  },
  {
    id: "7",
    type: "system",
    sender: "system",
    text: "Tap the trade offer above to respond with your cards"
  }
];
const DemoChat = () => {
  const [phase, setPhase] = reactExports.useState("chat");
  const [selectedCards, setSelectedCards] = reactExports.useState([]);
  const [tcg, setTcg] = reactExports.useState("pokemon");
  const [listingType, setListingType] = reactExports.useState("wtt");
  const [successData, setSuccessData] = reactExports.useState(null);
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
  const handleReset = () => {
    setPhase("chat");
    setSelectedCards([]);
    setTcg("pokemon");
    setListingType("wtt");
    setSuccessData(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PhoneFrame, { children: [
    phase === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DemoChatHeader, { name: "TraderMike" }),
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
        if (msg.type === "card_offer") {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            DemoOfferCard,
            {
              onCounterOffer: () => setPhase("trade-editor")
            },
            msg.id
          );
        }
        if (msg.type === "meetup_proposal") {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(DemoMeetupCard, {}, msg.id);
        }
        return null;
      }) })
    ] }),
    phase === "trade-editor" && /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    ),
    phase === "email" && /* @__PURE__ */ jsxRuntimeExports.jsx(
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
    ),
    phase === "success" && successData && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SuccessScreen,
      {
        position: successData.position,
        email: successData.email,
        onReset: handleReset
      }
    ) })
  ] });
};
function DemoPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col items-center justify-center px-4 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-sm text-muted-foreground hover:text-foreground transition-colors", children: "← Back to home" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DemoChat, {})
  ] });
}
export {
  DemoPage as component
};
