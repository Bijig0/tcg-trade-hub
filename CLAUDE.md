# TCG Trade Hub

## Project Overview

TCG Trade Hub is a location-based app for trading card game collectors to buy, sell, and trade cards locally. Two apps: an Expo (React Native) mobile app and a TanStack Start web app (pre-registration landing page). Supabase backend, oRPC API layer, React Native Reusables (shadcn-style) UI components.

## Tech Stack

- **Runtime — mobile**: Expo SDK (React Native) with Expo Router (file-based routing)
- **Runtime — web**: TanStack Start (Vite + TanStack Router, SSR)
- **Language**: TypeScript (strict mode)
- **API layer**: oRPC (`@orpc/server` + `@orpc/client`) — type-safe RPC with Zod input/output validation
- **Styling — mobile**: NativeWind (Tailwind CSS for React Native)
- **Styling — web**: Tailwind CSS v4
- **UI Components — mobile**: React Native Reusables (copy-paste, shadcn-style)
- **State — server**: TanStack Query (React Query), integrated with oRPC via `@orpc/tanstack-query`
- **State — client**: Zustand with Immer middleware
- **Validation**: Zod (schemas + type inference)
- **Backend**: Supabase (Auth, PostgreSQL + PostGIS, Realtime, Edge Functions, Storage)
- **Database types**: Auto-generated via `supabase gen types` + `supazod`
- **Testing**: Vitest for unit/integration, Maestro for E2E (deferred)
- **Build**: EAS Build, pnpm, Turborepo (monorepo)

## Monorepo Structure

```
tcg-trade-hub/
├── apps/
│   ├── mobile/                    # Expo app (primary)
│   │   ├── app/                   # Expo Router route files ONLY
│   │   │   ├── _layout.tsx
│   │   │   ├── (auth)/
│   │   │   ├── (onboarding)/
│   │   │   └── (tabs)/
│   │   ├── src/
│   │   │   ├── components/        # Shared UI components
│   │   │   │   └── ui/            # React Native Reusables base components
│   │   │   ├── features/          # Feature modules (see Feature Module Structure)
│   │   │   │   ├── auth/
│   │   │   │   ├── chat/
│   │   │   │   ├── collection/
│   │   │   │   ├── feed/
│   │   │   │   ├── listings/
│   │   │   │   ├── meetups/
│   │   │   │   ├── notifications/
│   │   │   │   ├── offers/
│   │   │   │   ├── profile/
│   │   │   │   ├── safety/        # blocking, reporting
│   │   │   │   └── shops/
│   │   │   ├── hooks/             # Cross-feature hooks (folder per hook)
│   │   │   ├── utils/             # Cross-feature pure utilities (folder per function)
│   │   │   ├── context/           # React Context providers
│   │   │   ├── stores/            # Zustand stores (folder per store)
│   │   │   ├── config/            # App config, constants, env
│   │   │   └── lib/               # Third-party client init (supabase.ts, queryClient.ts)
│   │   ├── assets/
│   │   ├── app.json
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── web/                       # TanStack Start web app (pre-registration landing)
│       ├── src/
│       │   ├── components/        # Web components (PreRegistrationForm, CardAutocomplete, etc.)
│       │   ├── lib/
│       │   │   ├── orpc.ts        # oRPC client + TanStack Query utils
│       │   │   ├── queryClient.ts
│       │   │   ├── rpcHandler.server.ts  # Server-side oRPC handler
│       │   │   └── supabase.server.ts    # Service-role Supabase client
│       │   ├── routes/            # TanStack Router file routes
│       │   ├── router.tsx
│       │   └── styles/
│       ├── vite.config.ts
│       └── tsconfig.json
├── packages/
│   ├── api/                       # oRPC API layer (shared between apps)
│   │   ├── src/
│   │   │   ├── base.ts            # Base oRPC instance with Context type
│   │   │   ├── context.ts         # Context type (Supabase client)
│   │   │   ├── router.ts          # Router definition (all procedures)
│   │   │   ├── procedures/        # Individual oRPC procedures
│   │   │   │   ├── cardSearch.ts
│   │   │   │   └── preRegistration.ts
│   │   │   ├── mock/              # Mock data for development
│   │   │   └── index.ts           # Public exports (os, router, Router, Context)
│   │   └── package.json
│   └── database/                  # Shared Supabase types + Zod schemas
│       ├── src/
│       │   ├── types.ts           # Generated: supabase gen types typescript
│       │   ├── schemas.ts         # Zod schemas (single source of truth)
│       │   └── index.ts           # Re-exports
│       └── package.json
├── supabase/
│   ├── migrations/                # SQL migrations
│   ├── functions/                 # Edge Functions
│   │   ├── card-search/
│   │   ├── get-feed/
│   │   ├── record-swipe/
│   │   ├── complete-meetup/
│   │   └── send-push-notification/
│   ├── seed.sql
│   └── config.toml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Feature Module Structure

Each feature is self-contained. A feature folder owns its components, hooks, utils, types, and query definitions. Cross-feature dependencies go through the shared layers (`src/hooks`, `src/utils`, `src/components`, `packages/database`).

```
src/features/chat/
├── components/
│   ├── ChatThread/
│   │   ├── ChatThread.tsx
│   │   └── ChatThread.test.ts
│   ├── MessageBubble/
│   │   ├── MessageBubble.tsx
│   │   └── MessageBubble.test.ts
│   └── OfferCard/
│       ├── OfferCard.tsx
│       └── OfferCard.test.ts
├── hooks/
│   ├── useMessages/
│   │   ├── useMessages.ts
│   │   └── useMessages.test.ts
│   └── useRealtimeChat/
│       ├── useRealtimeChat.ts
│       └── useRealtimeChat.test.ts
├── utils/
│   ├── formatMessage/
│   │   ├── formatMessage.ts
│   │   └── formatMessage.test.ts
│   └── parseOfferPayload/
│       ├── parseOfferPayload.ts
│       └── parseOfferPayload.test.ts
├── schemas.ts                     # Feature-specific Zod schemas (derived from DB schemas)
├── queryKeys.ts                   # TanStack Query key factory for this feature
└── index.ts                       # Public API barrel export
```

## Folder/File Conventions

### One function per folder

Every discrete function, hook, or component gets its own folder containing the implementation file and its collocated test file.

```
# Function
utils/calculateDistance/
├── calculateDistance.ts            # export default const calculateDistance = (...) => {...}
└── calculateDistance.test.ts

# Hook
hooks/useLocation/
├── useLocation.ts                 # export default const useLocation = () => {...}
└── useLocation.test.ts

# Component
components/SwipeCard/
├── SwipeCard.tsx                  # export default const SwipeCard = (...) => {...}
└── SwipeCard.test.ts
```

### Colocation rule (nearest shared ancestor)

- Used by one component → same feature folder
- Used by siblings within a feature → feature's `utils/` or `hooks/`
- Used across features → `src/utils/` or `src/hooks/`
- Used across apps → `packages/`

### Route files are thin

Files in `app/` are route entry points only. They import and compose from `src/features/` and `src/components/`. No business logic, no inline styles, no data fetching logic in route files.

```typescript
// app/(tabs)/(home)/index.tsx — CORRECT
import FeedScreen from '@/features/feed/components/FeedScreen/FeedScreen';
export default FeedScreen;

// app/(tabs)/(home)/index.tsx — WRONG
// Do not put hooks, queries, business logic here
```

## TypeScript Conventions

### Strict mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false
  }
}
```

### Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Functions, variables, hooks | camelCase | `calculateDistance`, `useLocation` |
| Components | PascalCase | `SwipeCard`, `ChatThread` |
| Types, interfaces, Zod schemas | PascalCase | `ListingType`, `CreateListingSchema` |
| Booleans | is/has/should/can prefix | `isLoading`, `hasMatched`, `shouldRefresh` |
| Constants | UPPER_SNAKE_CASE | `MAX_ACTIVE_LISTINGS`, `DEFAULT_RADIUS_KM` |
| Files | match export name | `calculateDistance.ts`, `SwipeCard.tsx` |
| Enum-like values | Zod enum or `as const` object | never use TypeScript `enum` |

### Function style

Always use const arrow functions.

```typescript
// CORRECT
export const calculateDistance = (a: Point, b: Point): number => {
  // ...
};

// CORRECT — component
export default const SwipeCard: React.FC<SwipeCardProps> = ({ listing }) => {
  // ...
};

// WRONG — do not use function declarations
function calculateDistance(a: Point, b: Point): number { ... }
```

### Type derivation from database schemas

The `packages/database` package is the single source of truth for all data types. Never manually define types that mirror database tables.

```typescript
// CORRECT — derive from DB schema
import { ListingInsertSchema, ListingRowSchema } from '@tcg-trade-hub/database';

const CreateListingFormSchema = ListingInsertSchema.pick({
  type: true,
  tcg: true,
  card_name: true,
  condition: true,
  asking_price: true,
  description: true,
});

type CreateListingForm = z.infer<typeof CreateListingFormSchema>;

// CORRECT — UI-only types are standalone
type TabState = 'upcoming' | 'past';
type ViewMode = 'list' | 'swipe';

// WRONG — manually duplicating DB shape
type Listing = {
  id: string;
  user_id: string;
  type: 'wts' | 'wtb' | 'wtt';
  // ... don't do this
};
```

### After any database schema change

1. Run migrations: `supabase db push` or `supabase migration up`
2. Regenerate types: `supabase gen types typescript --local > packages/database/src/types.ts`
3. Regenerate schemas: run `supazod` to produce `packages/database/src/schemas.ts`
4. Check for broken imports across the monorepo

## Export Patterns

```typescript
// Default export: main function or component of a file
export default const SwipeCard = () => { ... };

// Named exports: types, schemas, utilities
export type SwipeCardProps = { ... };
export const SwipeCardSchema = z.object({ ... });

// Barrel exports from feature index.ts
// Only export the public API of the feature
export { default as SwipeCard } from './components/SwipeCard/SwipeCard';
export { default as useFeed } from './hooks/useFeed/useFeed';
export type { FeedFilters } from './schemas';
```

## React Patterns

### Components

- Functional components only, with TypeScript props.
- Props types defined in the same file, named `{ComponentName}Props`.
- Destructure props in the function signature.
- No inline styles — use NativeWind `className` strings.

```typescript
type SwipeCardProps = {
  listing: ListingRow;
  onSwipeRight: (listingId: string) => void;
  onSwipeLeft: (listingId: string) => void;
};

export default const SwipeCard: React.FC<SwipeCardProps> = ({
  listing,
  onSwipeRight,
  onSwipeLeft,
}) => {
  return (
    <View className="flex-1 rounded-2xl bg-card shadow-lg">
      {/* ... */}
    </View>
  );
};
```

### Hooks

- Always prefixed with `use`.
- TanStack Query for all server state (fetching, mutations, cache).
- Zustand for client-only state (UI state, filters, view mode).
- Custom hooks extract logic from components — keep components as thin renderers.

```typescript
// hooks/useLocation/useLocation.ts
import { useQuery } from '@tanstack/react-query';

export default const useLocation = () => {
  return useQuery({
    queryKey: ['user-location'],
    queryFn: fetchUserLocation,
  });
};
```

### Query keys

Each feature defines a query key factory in `queryKeys.ts`.

```typescript
// features/listings/queryKeys.ts
export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
  myListings: () => [...listingKeys.all, 'mine'] as const,
};
```

### Context

Provider pattern with type-safe hooks that throw when used outside the provider.

```typescript
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // ...
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Business Logic Extraction

- Extract pure functions out of React components into their own files.
- Pure functions take inputs, return outputs, no side effects.
- Each pure function gets its own folder with a collocated test.
- Components become thin renderers: they call hooks for data, call pure functions for computation, and render JSX.

```typescript
// CORRECT — logic extracted
// features/feed/utils/rankListings/rankListings.ts
export default const rankListings = (
  listings: ListingRow[],
  userListings: ListingRow[],
  userLocation: Point,
): RankedListing[] => {
  // pure computation, fully testable
};

// features/feed/components/FeedScreen/FeedScreen.tsx
const FeedScreen = () => {
  const { data: listings } = useFeedListings();
  const { data: myListings } = useMyListings();
  const location = useUserLocation();
  const ranked = rankListings(listings, myListings, location);
  return <FlatList data={ranked} renderItem={...} />;
};
```

## Validation with Zod

- Zod is the single validation layer. No manual validation logic.
- Use Zod schemas for: form validation, API response parsing, message payload parsing, environment variables.
- Derive TypeScript types from Zod schemas with `z.infer<>`.
- Use `.pick()`, `.omit()`, `.extend()`, `.merge()` to derive form schemas from DB schemas.
- Use `z.discriminatedUnion()` for message payloads keyed on `type`.

```typescript
// Message payload schemas
const TextMessageSchema = z.object({
  type: z.literal('text'),
});

const CardOfferPayloadSchema = z.object({
  type: z.literal('card_offer'),
  payload: z.object({
    offering: z.array(CardRefSchema),
    requesting: z.array(CardRefSchema),
    cash_amount: z.number().optional(),
    cash_direction: z.enum(['offering', 'requesting']).optional(),
    note: z.string().optional(),
  }),
});

const MeetupProposalPayloadSchema = z.object({
  type: z.literal('meetup_proposal'),
  payload: z.object({
    shop_id: z.string().uuid().optional(),
    location_name: z.string().optional(),
    location_coords: z.object({ lat: z.number(), lng: z.number() }).optional(),
    proposed_time: z.string().datetime().optional(),
    note: z.string().optional(),
  }),
});

const MessageSchema = z.discriminatedUnion('type', [
  TextMessageSchema,
  CardOfferPayloadSchema,
  MeetupProposalPayloadSchema,
]);

type Message = z.infer<typeof MessageSchema>;
```

## Supabase Client

Single client instance initialized in `src/lib/supabase.ts`. Use `@supabase/supabase-js` with AsyncStorage adapter for session persistence.

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '@tcg-trade-hub/database';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
```

## oRPC API Layer

The `packages/api` package defines a type-safe RPC layer using oRPC. Procedures use Zod schemas from `@tcg-trade-hub/database` for input/output validation. The router type is exported so clients get full type inference without codegen.

### Adding a new procedure

1. Create a file in `packages/api/src/procedures/`.
2. Import `os` from `../base` and schemas from `@tcg-trade-hub/database`.
3. Chain `.input()`, `.output()`, `.handler()`.
4. Register in `packages/api/src/router.ts`.

```typescript
// packages/api/src/procedures/myProcedure.ts
import { os } from '../base';
import { SomeInsertSchema } from '@tcg-trade-hub/database';
import { z } from 'zod';

export const myProcedure = os
  .input(SomeInsertSchema)
  .output(z.object({ success: z.boolean() }))
  .handler(async ({ input, context }) => {
    const { supabase } = context;
    // ...
    return { success: true };
  });
```

### Client usage (web)

The web app creates a typed oRPC client in `apps/web/src/lib/orpc.ts` with TanStack Query integration via `@orpc/tanstack-query`.

```typescript
import { orpc } from '@/lib/orpc';

// In a component — fully type-safe, no codegen
const { data } = orpc.card.search.useQuery({ input: { query: 'charizard', tcg: 'pokemon' } });
```

### Server handler

The web app handles oRPC requests server-side in `apps/web/src/lib/rpcHandler.server.ts`. It creates a Supabase service-role client and passes it as context to the router.

## Supabase Edge Functions

- Each Edge Function gets its own folder under `supabase/functions/`.
- Written in TypeScript (Deno runtime).
- Use Zod for request validation.
- Return typed JSON responses.
- Keep Edge Functions thin — validate input, call Supabase client, return result.
- Shared utilities across Edge Functions go in `supabase/functions/_shared/`.

```
supabase/functions/
├── _shared/
│   ├── cors.ts
│   ├── supabaseAdmin.ts           # Service role client
│   └── normalizeCard.ts           # Card normalization across TCG APIs
├── card-search/
│   └── index.ts
├── get-feed/
│   └── index.ts
├── record-swipe/
│   └── index.ts
├── complete-meetup/
│   └── index.ts
└── send-push-notification/
    └── index.ts
```

## Testing

### Unit/Integration — Vitest

- Test files: `*.test.ts` collocated with implementation.
- Mock files: `*.mock.ts` alongside implementations when needed.
- Test pure functions exhaustively. Test hooks with `@testing-library/react-native`.
- Focus tests on behavior, not implementation.

```typescript
// features/feed/utils/rankListings/rankListings.test.ts
import { describe, it, expect } from 'vitest';
import rankListings from './rankListings';

describe('rankListings', () => {
  it('should prioritize direct complement matches', () => {
    const result = rankListings(mockListings, mockUserListings, mockLocation);
    expect(result[0].listing.card_name).toBe('Charizard VMAX');
  });

  it('should exclude listings beyond user radius', () => {
    // ...
  });
});
```

### E2E — Maestro (deferred for MVP)

- Flow files in `/e2e/flows/`.
- Cover critical paths: auth → onboarding → create listing → swipe → match → chat → meetup.

## NativeWind / Styling Conventions

- Use NativeWind `className` for all styling. No `StyleSheet.create()`.
- Use React Native Reusables components from `src/components/ui/` as base building blocks.
- Dark mode: use theme-aware color tokens from NativeWind config (e.g., `bg-card`, `text-foreground`, `border-border`). Never hardcode hex colors in components.
- Responsive: use NativeWind responsive prefixes where needed, but mobile is the only target so this is rare.
- The `tailwind.config.ts` extends the default shadcn/ui color token pattern for consistency with the future web admin dashboard.

```typescript
// CORRECT
<View className="flex-1 bg-background p-4">
  <Text className="text-lg font-semibold text-foreground">Title</Text>
  <Text className="text-sm text-muted-foreground">Subtitle</Text>
</View>

// WRONG — no hardcoded colors
<View style={{ backgroundColor: '#1a1a2e', padding: 16 }}>
```

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@tcg-trade-hub/database": ["../../packages/database/src"]
    }
  }
}
```

Usage:

```typescript
import { supabase } from '@/lib/supabase';
import { ListingRowSchema } from '@tcg-trade-hub/database';
import SwipeCard from '@/features/feed/components/SwipeCard/SwipeCard';
```

## JSDoc

Add JSDoc comments to:

- All exported utility functions
- All custom hooks
- All Zod schemas that aren't self-documenting
- Complex type definitions

```typescript
/**
 * Calculates the weighted relevance score for a listing
 * relative to the current user's active listings and location.
 *
 * Scoring weights:
 * - Direct complement match: 5
 * - TCG match: 2
 * - Proximity (inverse distance): 2
 * - Recency (7-day decay): 1
 */
export default const calculateRelevanceScore = (
  listing: ListingRow,
  userListings: ListingRow[],
  userLocation: Point,
): number => {
  // ...
};
```

## Environment Variables

All env vars prefixed with `EXPO_PUBLIC_` for client access. Sensitive keys used only in Edge Functions.

```
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=

# supabase/.env (Edge Functions only, not in client bundle)
SUPABASE_SERVICE_ROLE_KEY=
POKEMON_TCG_API_KEY=
EXPO_PUSH_ACCESS_TOKEN=
```

## Git Conventions

- Branch naming: `feat/`, `fix/`, `chore/`, `refactor/` prefixes
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`)
- PR scope: one feature or fix per PR

## Do Not

- Do not use TypeScript `enum` — use Zod enums or `as const` objects
- Do not use `StyleSheet.create()` — use NativeWind `className`
- Do not use `any` — use `unknown` and narrow with Zod
- Do not put business logic in route files (`app/` directory)
- Do not manually define types that mirror database tables
- Do not use function declarations — use const arrow functions
- Do not hardcode colors — use NativeWind theme tokens
- Do not use `localStorage` / `AsyncStorage` directly for state — use Zustand with persist middleware when needed
- Do not create God components — extract logic into hooks and pure functions
- Do not skip collocated tests for pure utility functions
- Do not import from feature internals — use the feature's `index.ts` barrel export
- Do not call Supabase directly from web components — use oRPC procedures via `@tcg-trade-hub/api`
- Do not duplicate Zod schemas in procedures — import from `@tcg-trade-hub/database`
