# Journey Hierarchy Design

## Problem

Journeys are currently hardcoded in `scripts/generate_city_data.py`. The rest of the city data (buildings, districts, dependencies) is generated dynamically from the codebase index. Journeys should follow the same pattern — defined as structured data, generated into the frontend format, with hierarchy derived from the data itself.

## Data Model

### Journey definition file: `journeys.json`

A single JSON file defines all journeys. Each journey has:

```json
{
  "id": "tx-lifecycle",
  "name": "Life of a Transaction",
  "description": "Follow a transaction from network arrival to block confirmation",
  "color": "#facc15",
  "parent": "boot",
  "parentStop": 8,
  "stops": [
    {
      "file": "src/net.cpp",
      "function": "CConnman::SocketHandler",
      "annotation": "Raw bytes arrive on a TCP socket from a peer."
    }
  ]
}
```

Fields:
- `id` — unique identifier
- `name` — display name
- `description` — one-line summary shown in the journey selector
- `color` — hex color for the journey path and UI elements
- `parent` — (optional) ID of the parent journey. If null, this is a root journey.
- `parentStop` — (optional) which stop index in the parent journey this journey branches from. This is where the "branch point" is — the moment in the parent journey where this sub-journey becomes relevant.
- `stops[].file` — source file path (e.g., `src/net.cpp`). The generator resolves this to a building ID using the same `make_building_id()` function that builds the city. If the file doesn't exist in the index, the generator warns and skips the stop.
- `stops[].function` — function or code location name (display only, not resolved)
- `stops[].annotation` — explanation text

### Hierarchy rules

1. There is exactly one root journey: **Boot** (`parent: null`). This is the trunk of the tree.
2. All other journeys have a `parent` pointing to another journey.
3. The tree can be N levels deep, but in practice it's 2: Boot → sub-journeys.
4. A journey can have multiple children (Boot has 5+ children).
5. A journey can only have one parent.

### The tree for v28.4

```
Boot (main → init → node is live → shutdown)
├── Transaction Lifecycle          branches at Boot stop "node is live"
├── Block Validation               branches at Boot stop "node is live"
├── Peer Connection & Handshake    branches at Boot stop "CConnman::Start"
├── Wallet Sends a Transaction     branches at Boot stop "node is live"
└── Initial Block Download         branches at Boot stop "Step 7: load block chain"
```

## Generation Pipeline

### Step 1: Author writes `journeys.json`

This is the one manually-authored file. It contains domain knowledge that can't be extracted from code:
- The order of stops (which code path to follow)
- The annotations (what to teach the learner)
- The hierarchy (which journeys branch from where)

Everything else is automated.

### Step 2: `generate_city_data.py` reads `journeys.json`

The generator:
1. Reads `journeys.json`
2. For each stop, resolves `file` → `building_id` using `make_building_id(file)`
3. Validates that every referenced building exists in the index (warns if not)
4. Computes the `children` list for each journey (derived from `parent` fields)
5. Outputs the journeys into `city-data.ts` with resolved building IDs and computed hierarchy

### Step 3: Frontend reads the generated data

The generated TypeScript includes:

```typescript
export interface Journey {
  id: string;
  name: string;
  description: string;
  color: string;
  parent: string | null;
  parentStop: number | null;
  children: string[];       // computed by generator from parent fields
  stops: JourneyStop[];
}
```

The `children` array is derived — the generator scans all journeys and populates `children` for each journey based on which other journeys list it as `parent`.

## Frontend Behavior

### Journey selector panel

When no journey is active, show the journey tree:

```
JOURNEYS

▸ Boot: main() to Shutdown           (root — click to start)
  ├─ Life of a Transaction
  ├─ Block Validation
  ├─ Peer Connection & Handshake
  ├─ Wallet Sends a Transaction
  └─ Initial Block Download
```

Clicking any journey starts it. The root is visually distinct (it's the entry point).

### Breadcrumb

When a journey is active, show a breadcrumb above the stop info:

```
Boot > Life of a Transaction
Stop 3 of 8
```

If you're in the Boot journey itself:

```
Boot
Stop 5 of 13
```

Clicking "Boot" in the breadcrumb exits the current journey and resumes Boot at the `parentStop`.

### End of journey

When you reach the last stop of a journey:

**If the journey has children:** Show "Explore further" with the child journeys listed as buttons.

**If the journey has a parent:** Show "Back to {parent.name}" button that returns to the parent journey at the `parentStop`.

**If neither (leaf with parent):** Show "Back to {parent.name}" and the journey selector.

### End of Boot journey

The Boot journey is special. Its "node is live" stop is where most children branch from. When the user reaches that stop, the annotation mentions that the node is now in steady state and the child journeys become relevant. The last stop (shutdown) is reachable but the UI makes it clear that the interesting branches happen earlier.

## What stays manual vs. what's generated

| Aspect | Manual | Generated |
|--------|--------|-----------|
| Journey stops, order, annotations | Yes (journeys.json) | No |
| Hierarchy (parent/parentStop) | Yes (journeys.json) | No |
| Building ID resolution (file → id) | No | Yes (from codebase index) |
| Children array | No | Yes (derived from parent fields) |
| Breadcrumb text | No | Yes (derived from hierarchy) |
| Validation (do referenced files exist?) | No | Yes (warns on missing) |

## File locations

- `journeys.json` — source of truth, lives at repo root or in `data/`
- `scripts/generate_city_data.py` — reads journeys.json, outputs to city-data.ts
- `bitcoin-map/src/data/city-data.ts` — generated output consumed by frontend

## Migration from current state

1. Extract the 5 hardcoded journeys from `generate_city_data.py` into `journeys.json`
2. Add the Boot journey to `journeys.json` with `parent: null`
3. Add `parent` and `parentStop` to the existing 5 journeys
4. Update `generate_city_data.py` to read from `journeys.json` instead of inline data
5. Update the Journey interface in the generator to include `parent`, `parentStop`, `children`
6. Update `JourneyPanel.tsx` to show the tree, breadcrumb, and end-of-journey branching
