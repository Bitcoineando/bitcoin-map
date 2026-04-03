# Bitcoin Map — Layout Algorithm

## Goal

Turn a flat list of files and dependencies into a spatial city layout where position is meaningful and the map is readable without labels.

## Two-Level Layout

### Level 1: Districts (hand-placed)

There are 6-8 districts. Their positions are fixed and chosen to reflect logical relationships:

```
                    ┌─────────┐
                    │  INIT    │
                    │ (white)  │
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────┴─────┐  ┌─────┴─────┐  ┌────┴──────┐
    │  NETWORK  │  │  MEMPOOL   │  │   RPC     │
    │  (amber)  │──│  (red)     │  │  (teal)   │
    └─────┬─────┘  └─────┬─────┘  └───────────┘
          │              │
          │        ┌─────┴─────┐
          │        │ CONSENSUS │
          └────────│  (blue)   │────────┐
                   └─────┬─────┘        │
                         │        ┌─────┴─────┐
                   ┌─────┴─────┐  │  WALLET   │
                   │  MINING   │  │  (green)  │
                   │ (purple)  │  └───────────┘
                   └───────────┘

    ┌───────────────────────────────────┐
    │         UTIL (gray)               │
    │   (spread along the bottom)       │
    └───────────────────────────────────┘
```

**Why this arrangement:**
- **Network** is at the edge — it's the boundary with the outside world
- **Mempool** is between network and consensus — transactions flow through it
- **Consensus** is at the center — everything revolves around it
- **Mining** is below consensus — it produces blocks that consensus validates
- **Wallet** is to the side — it's optional, not on the critical path
- **RPC** is at the edge — it's another boundary (user-facing)
- **Init** is at the top — it starts everything
- **Util** underlies everything — it's foundational

Districts are rectangles on the ground plane with a subtle tint of their subsystem color.

### Level 2: Buildings Within Districts (algorithmic)

Within each district, buildings are placed using these rules:

1. **Importance determines centrality.** The most connected / largest file goes in the center of the district. Less important files are placed further out.

2. **Cross-district connections determine facing.** If a file has many connections to the Network district, it's placed on the side of its district closest to Network. This makes roads shorter and the layout more intuitive.

3. **Grid-based with jitter.** Buildings snap to a loose grid within the district (prevents overlap) with slight random offset (prevents sterile regularity).

4. **Spacing by size.** Larger buildings (more LOC) get more floor space so they don't visually overlap smaller neighbors.

```typescript
function placeBuildings(district: District, files: FileNode[], graph: Graph): Position[] {
  // 1. Sort by connectivity (most connected first)
  const sorted = files.sort((a, b) => graph.degree(b.id) - graph.degree(a.id));
  
  // 2. Place most important at center
  // 3. Place others in expanding rings
  // 4. Bias position toward connected districts
  // 5. Snap to grid with jitter
}
```

## Building Dimensions

```typescript
function buildingDimensions(file: FileNode): { width, height, depth } {
  const baseSize = 1;
  const heightScale = 0.01;  // 1 unit per 100 LOC
  
  return {
    width: baseSize,
    depth: baseSize,
    height: Math.max(0.5, file.loc * heightScale)  // minimum height 0.5
  };
}
```

- **Minimum height:** 0.5 units (small files are still visible)
- **Maximum height:** capped at 30 units (prevents `validation.cpp` from being a skyscraper that obscures everything)
- Width and depth are uniform — we're not encoding information in footprint

## Road Layout

Roads connect buildings that have dependencies. They follow a simple rule:

1. Draw a straight line between connected buildings at ground level.
2. If two roads would overlap, offset one slightly.
3. Roads don't cross through buildings — they route around with one bend point if needed.

Roads are thin lines (not wide paths). They're infrastructure, not the main visual.

## Scale

The entire city should fit comfortably on screen at the default camera position. Approximate dimensions:

- Each district: ~20x20 units
- Gaps between districts: ~10 units  
- Total city footprint: ~80x80 units
- Camera starts at height 60, looking at center

At this scale, you see the whole city at once. Two scroll-zooms in and you're at building level.

## Deterministic Layout

Given the same `city-data.json`, the layout algorithm always produces the same positions. No randomness (the "jitter" uses a seeded PRNG). This means:

- Screenshots and documentation stay consistent
- Users can orient themselves across sessions
- Journey descriptions can reference spatial relationships ("the cluster on the left side of the Network district")
