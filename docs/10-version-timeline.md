# Bitcoin Map — Version Timeline

## Concept

The app lets users switch between Bitcoin Core releases and see the codebase evolve — from Satoshi's tiny monolith to today's 1000+ file metropolis. The city grows, districts emerge, buildings split and multiply. The architecture tells its own history.

## Design Principle: Show The Truth

We do NOT impose modern structure onto old code. If Satoshi's v0.1.0 has 15 files with no directory structure, the city has 15 buildings in a flat cluster. There are no districts because there were no districts.

As you move forward through versions:
- Directories appear in the codebase → districts appear in the city
- Files get split (main.cpp breaks into validation.cpp, net.cpp, etc.) → one building becomes many
- New subsystems are added (wallet gets its own directory) → new districts form

The parser runs identically on every version. The subsystem classification is based on directory paths. Early code has no directories, so most files fall into a generic group. That's accurate. The districts *emerge* because the developers literally created them.

## Selected Releases

### The Satoshi Era

**v0.1.0** (January 9, 2009)
- The genesis release. ~15 source files, everything in the root directory.
- `main.cpp` contains consensus, mempool, and most networking logic.
- No separation of concerns. The whole system fits in one person's head.
- The city: a tiny village. A handful of buildings, no districts.
- **Why this release:** It's where Bitcoin began. The contrast with modern code is the first lesson.

**v0.3.9** (June 2010)
- Satoshi's last substantial release before stepping back.
- Still his architecture, but more features added (JSON-RPC, command-line interface).
- `main.cpp` has grown significantly. Still a monolith.
- The city: a slightly larger village. Still no real districts.
- **Why this release:** The last snapshot of Satoshi's vision, before other developers took over.

### The Growing Pains

**v0.8.0** (February 2013)
- BerkeleyDB → LevelDB for the block index. This change accidentally caused a hard fork.
- Code is starting to be modularized. `main.cpp` is enormous but other files are emerging.
- The city: a small town. Some clustering is starting to appear.
- **Why this release:** The LevelDB migration is a famous incident. The codebase is at an inflection point — too big for the old structure, not yet reorganized.

**v0.9.0** (March 2014)
- Rebranded from "Bitcoin-Qt" to "Bitcoin Core."
- Major refactoring begins. `main.cpp` starts getting broken apart.
- Payment protocol added. Autotools build system.
- The city: the first real districts are forming. You can start to see neighborhoods.
- **Why this release:** The moment Bitcoin Core became "Bitcoin Core." The beginning of intentional architecture.

### The Blocksize War Era

**v0.13.0** (August 2016)
- Segregated Witness code is included but not yet activated.
- Compact block relay. Fee filtering.
- The codebase has grown substantially. Wallet is its own directory.
- The city: a real city now. Multiple distinct districts.
- **Why this release:** SegWit is the most controversial change in Bitcoin's history. This is the code people were fighting over.

**v0.16.0** (February 2018)
- Full SegWit wallet support. The war is over.
- HD wallets by default. Better fee estimation.
- The city: post-war growth. The wallet district has expanded significantly.
- **Why this release:** The codebase after the resolution of Bitcoin's biggest conflict. A matured architecture.

### Modern Era

**v22.0** (September 2021)
- Taproot activation. New versioning scheme (dropped the leading 0).
- Tor v3 support. Hardware wallet support via HWI.
- The city: approaching modern size and structure.
- **Why this release:** Taproot is the last major consensus change. The new versioning signals a new era.

**v24.0** (November 2022)
- `libbitcoinkernel` work begins — extracting consensus logic into a standalone library.
- Descriptor wallets become default. Legacy wallet creation deprecated.
- The city: the kernel district starts to separate from consensus.
- **Why this release:** The architectural vision of separating consensus from the node is the most important ongoing project.

**v28.0** (October 2024)
- Current release. The codebase as it stands.
- The city: the full metropolis. 1000+ buildings, 20+ districts.
- **Why this release:** The present. Where learners will spend most of their time.

## Total: 9 Releases

| Version | Date | Era | Key event |
|---------|------|-----|-----------|
| v0.1.0 | Jan 2009 | Satoshi | Genesis |
| v0.3.9 | Jun 2010 | Satoshi | His last work |
| v0.8.0 | Feb 2013 | Growth | LevelDB / accidental fork |
| v0.9.0 | Mar 2014 | Growth | Rebranded "Bitcoin Core" |
| v0.13.0 | Aug 2016 | War | SegWit code lands |
| v0.16.0 | Feb 2018 | War | SegWit complete, war over |
| v22.0 | Sep 2021 | Modern | Taproot activation |
| v24.0 | Nov 2022 | Modern | Kernel library begins |
| v28.0 | Oct 2024 | Modern | Current |

## Technical Implementation

### Data Pipeline

```
For each release:
  1. git checkout the tag
  2. Run the parser → generates city-data-v{version}.json
  3. Store the JSON in public/versions/
```

The parser is the same for every version. It reads whatever files exist, classifies by directory path, and outputs the graph. Early versions produce small JSONs with few districts. Late versions produce large ones with many districts. The parser doesn't care — it just reads what's there.

### Static Data Files

```
public/
  versions/
    city-data-v0.1.0.json
    city-data-v0.3.9.json
    city-data-v0.8.0.json
    city-data-v0.9.0.json
    city-data-v0.13.0.json
    city-data-v0.16.0.json
    city-data-v22.0.json
    city-data-v24.0.json
    city-data-v28.0.json
    versions.json          # index: list of available versions with metadata
```

Each JSON file is self-contained — districts, buildings, dependencies. Same schema as current `city-data.ts`, but loaded at runtime instead of compiled in.

`versions.json` is a lightweight index:
```json
[
  {
    "version": "v0.1.0",
    "date": "2009-01-09",
    "label": "Genesis",
    "era": "satoshi",
    "fileCount": 15,
    "description": "Satoshi's first release"
  },
  ...
]
```

### Estimated File Sizes

Early versions: ~10-50KB JSON (few files, few dependencies)
Mid versions: ~100-300KB JSON
Current version: ~500KB-1MB JSON
Total all versions: ~3-5MB uncompressed, ~1-2MB gzipped

Fine for static hosting. Can be served from GitHub Pages, Vercel, or just from the repo's `/public`.

### App Changes

**Version selector UI:**
- A timeline bar at the bottom of the screen (or a dropdown in the top bar)
- Shows version labels with dates
- Click to switch. The city rebuilds with the new data.
- Current version is highlighted

**Data loading:**
- On version switch, fetch the JSON file
- Parse it into the same data structures the app already uses
- Rebuild the layout and re-render the city
- Cache fetched versions in memory so switching back is instant

**District positions:**
- District positions are calculated per-version based on what districts exist
- Early versions with few/no districts get a compact layout
- The layout algorithm handles any number of districts gracefully

**Journeys:**
- Journeys are only available for v28.0 (current) initially
- The journey data references building IDs that only exist in v28.0
- When viewing other versions, the journey panel shows "Journeys available for v28.0" or is hidden
- Future: version-specific journeys could be added (e.g., "Life of a Transaction in v0.1.0")

### What The User Sees

**v0.1.0:** A tiny cluster of ~15 buildings on a flat plane. No districts. No labels. Everything is gray/neutral. It looks empty and primitive. That's the point.

**v0.9.0:** Districts are forming. You can see wallet files grouping to one side, networking to another. The city has maybe 100 buildings. It looks like a small town developing neighborhoods.

**v0.13.0:** A real city. Clear districts. The SegWit-related code is visible as new buildings in the script and consensus districts. You can see the codebase that people went to war over.

**v28.0:** The full metropolis. 1000+ buildings, 20+ districts, dense dependency networks. The contrast with v0.1.0 is staggering.

Switching between versions is the fastest way to understand how Bitcoin Core's architecture evolved — and why it's structured the way it is today.
