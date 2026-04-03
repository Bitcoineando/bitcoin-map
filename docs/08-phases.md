# Bitcoin Map — Build Phases

## Phase 1: Static City

**Goal:** A 3D scene with real Bitcoin Core data that you can orbit and click.

**Deliverables:**
- [ ] Node.js parser that reads a Bitcoin Core checkout and outputs `city-data.json`
  - File list with LOC
  - Subsystem classification
  - `#include` extraction
- [ ] Vite + React + Three.js project scaffold
- [ ] District ground planes with labels (hand-positioned)
- [ ] Buildings (boxes) placed within districts, sized by LOC
- [ ] Dependency lines between buildings (from includes)
- [ ] Orbit camera with zoom
- [ ] Click a building → show file name, LOC, subsystem in a basic panel
- [ ] Ship with a pre-parsed `city-data.json` from a recent Bitcoin Core release

**What it looks like:** A clean, colored block city you can rotate around. You can see that consensus has tall buildings, that network has many connections, that wallet is its own cluster. Clicking shows basic info.

**Estimated scope:** ~1500 lines of code across parser + frontend.

## Phase 2: Code Panels & Visual Polish

**Goal:** Click a building and actually see the code. Apply the full visual language.

**Deliverables:**
- [ ] Code panel with syntax highlighting (use a lightweight highlighter like Shiki or Prism)
- [ ] Show classes and functions inside each file
- [ ] Full visual language: shape variants (cylinder for singletons, slab for headers)
- [ ] Color consistency enforced across all UI elements
- [ ] Legend panel
- [ ] Hover effects (brighten, show connections)
- [ ] Fly-to camera animation on click
- [ ] Search (fuzzy find by file/class/function name)

**What it looks like:** A functional code explorer with spatial context. You can find any file, see its code, see what it connects to.

**Estimated scope:** ~1000 lines additional.

## Phase 3: Journeys

**Goal:** Follow guided paths through the codebase.

**Deliverables:**
- [ ] Journey data format and 3 initial journeys (tx lifecycle, block validation, peer handshake)
- [ ] Colored path lines rendered on the city ground
- [ ] Animated traveler dot
- [ ] Journey sidebar with stop list, annotations, progress indicator
- [ ] Camera follow mode with smooth animation
- [ ] Pause/resume on user interaction
- [ ] Code panel synced to current journey stop (shows the specific function)
- [ ] Keyboard navigation (arrow keys for prev/next)

**What it looks like:** The app's signature feature. You click "Life of a Transaction" and watch a dot travel through the city while reading annotations and code at each stop. This is what makes it more than a dependency viewer.

**Estimated scope:** ~1200 lines additional.

## Phase 4: Polish & Deploy

**Goal:** Production-ready, shareable, useful.

**Deliverables:**
- [ ] Hosted demo with pre-parsed data (deploy to Vercel/Netlify)
- [ ] "Load repo" option for local use (paste path, re-parse)
- [ ] Minimap (2D top-down view in corner)
- [ ] Responsive layout (at least desktop + tablet)
- [ ] Performance optimization (instanced rendering if needed)
- [ ] 2 more journeys (wallet send, IBD)
- [ ] URL deep-linking (share a link to a specific building or journey stop)
- [ ] README and landing page

**Estimated scope:** ~800 lines additional + deployment config.

## Future / Stretch

These are ideas, not commitments:

- **Git timeline slider** — scrub through history, watch the city grow
- **Diff view** — load two commits, highlight what changed (new buildings glow, removed ones are ghosted)
- **Contributor heatmap** — color by who works on what
- **Course integration** — link journey stops to course module content
- **Collaborative mode** — multiple cursors, like a guided classroom tour
- **Plugin for VS Code** — minimap in the editor that shows your current position in the city

## What We're NOT Building

- A general-purpose code visualizer. This is for Bitcoin Core specifically.
- A build system or IDE integration. The parser is offline, output is static JSON.
- A real-time updating system. Parse once, explore. Re-parse when you want.
- Photorealistic graphics. It's boxes and lines. That's the point.
