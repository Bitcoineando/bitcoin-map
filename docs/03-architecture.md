# Bitcoin Map — Architecture

## Overview

The app has three layers:

```
┌─────────────────────────────────────────┐
│  UI Layer (React)                       │
│  Panels, search, journey list, legend   │
├─────────────────────────────────────────┤
│  Scene Layer (Three.js)                 │
│  City rendering, camera, interaction    │
├─────────────────────────────────────────┤
│  Data Layer (Parser + Layout)           │
│  Repo parsing, graph building, spatial  │
└─────────────────────────────────────────┘
```

## Tech Stack

| Component       | Technology        | Why                                          |
|-----------------|-------------------|----------------------------------------------|
| Build tool      | Vite              | Fast, simple, good TS/React support          |
| UI framework    | React + TypeScript| Standard, good ecosystem for panels/overlays |
| 3D rendering    | Three.js          | Browser-native 3D, no install, mature        |
| React-Three     | @react-three/fiber| Declarative Three.js inside React            |
| Camera controls | @react-three/drei | Orbit controls, camera animation helpers     |
| C++ parsing     | Tree-sitter WASM  | Parse real C++ in the browser                |
| Layout          | Custom algorithm   | Force-directed within districts, fixed district placement |
| State           | Zustand           | Lightweight, good for shared scene/UI state  |

## Project Structure

```
bitcoin-map/
├── docs/                    # This documentation
├── public/
│   └── tree-sitter/         # WASM binaries for tree-sitter C++ grammar
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Root component: scene + UI overlay
│   │
│   ├── parser/              # Data Layer
│   │   ├── repo.ts          # Read file tree from a Bitcoin Core checkout
│   │   ├── extract.ts       # Tree-sitter: extract includes, classes, functions
│   │   ├── graph.ts         # Build node/edge graph from extracted data
│   │   └── types.ts         # CodeFile, CodeFunction, Dependency, Graph types
│   │
│   ├── layout/              # Spatial positioning
│   │   ├── districts.ts     # District definitions and fixed positions
│   │   ├── placement.ts     # Place buildings within districts
│   │   └── roads.ts         # Generate road geometry from call paths
│   │
│   ├── scene/               # Scene Layer
│   │   ├── City.tsx         # Root scene component
│   │   ├── District.tsx     # Ground plane + label for a subsystem
│   │   ├── Building.tsx     # Single building (box/cylinder/slab)
│   │   ├── Road.tsx         # Line between buildings
│   │   ├── JourneyPath.tsx  # Colored trail on the ground
│   │   ├── Traveler.tsx     # Animated dot following a journey
│   │   └── CameraRig.tsx   # Orbit controls + journey follow mode
│   │
│   ├── ui/                  # UI Layer
│   │   ├── CodePanel.tsx    # Shows source code at current selection
│   │   ├── JourneyList.tsx  # Sidebar: available journeys
│   │   ├── JourneyNarration.tsx  # Current stop annotation
│   │   ├── Search.tsx       # Find file/function/class
│   │   ├── Legend.tsx       # Visual key (shapes, colors)
│   │   ├── Minimap.tsx      # Top-down 2D overview (optional)
│   │   └── RepoSelector.tsx # Point app at a repo path or URL
│   │
│   ├── journeys/            # Journey definitions
│   │   ├── types.ts         # Journey, Stop, Path types
│   │   ├── index.ts         # Registry of all journeys
│   │   ├── tx-lifecycle.ts  # Life of a transaction
│   │   ├── block-validation.ts
│   │   ├── peer-handshake.ts
│   │   └── wallet-send.ts
│   │
│   ├── data/                # Subsystem mappings
│   │   ├── subsystems.ts    # File-to-subsystem mapping rules
│   │   └── colors.ts        # Color constants (single source of truth)
│   │
│   └── store/               # State management
│       └── store.ts         # Zustand store: selection, active journey, camera state
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Data Flow

```
Bitcoin Core repo on disk (or GitHub)
        │
        ▼
   parser/repo.ts          Reads file tree, filters to .cpp/.h
        │
        ▼
   parser/extract.ts       Tree-sitter parses each file:
        │                  → classes, functions, #includes
        ▼
   parser/graph.ts         Builds a graph:
        │                  → nodes = files/classes
        │                  → edges = includes, calls
        ▼
   layout/districts.ts     Assigns nodes to subsystems
        │
        ▼
   layout/placement.ts     Positions buildings within districts
        │
        ▼
   scene/City.tsx          Renders the 3D city
        │
        ▼
   Browser                 User sees and interacts with the city
```

## Key Technical Decisions

### Parsing: Backend or Browser?

**Decision: Hybrid.**

- For local repos: a small Node script pre-parses the repo and outputs a JSON graph file. This avoids loading tree-sitter WASM and hundreds of C++ files in the browser.
- For demo/hosted mode: ship a pre-parsed JSON snapshot of Bitcoin Core at a specific commit. Users can explore without needing a local checkout.
- The browser never needs to parse C++ directly in Phase 1.

### Layout: Algorithmic or Hand-placed?

**Decision: Semi-algorithmic.**

- District positions are hand-placed (there are only 6-8 of them, and their spatial relationship matters for understanding).
- Building positions within districts are algorithmic — arranged by file importance (LOC, connectivity) with more connected buildings closer to district borders facing the districts they connect to.

### Camera

**Decision: Orbit + fly-to.**

- Default: orbit camera. Click-drag to rotate, scroll to zoom, right-drag to pan.
- Click a building: camera smoothly flies to it.
- Follow a journey: camera animates along the path, can be interrupted at any time by user input.
- No first-person WASD walking. It adds complexity without aiding understanding.
