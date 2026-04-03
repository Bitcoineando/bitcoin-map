# Bitcoin Map — Vision

## Problem

Bitcoin Core is ~300K lines of C++ across ~1500 files. Learners face three walls:

1. **No obvious entry point.** `bitcoind.cpp` exists but tells you almost nothing about how the system works.
2. **Everything connects to everything.** Validation touches net, net touches mempool, mempool touches wallet. Raw dependency graphs are useless hairballs.
3. **The interesting structure is invisible.** The path a transaction takes from arrival to confirmation cuts across dozens of files in a specific order. No static diagram captures this. The *stories* of data flowing through the system are what people need, and they exist only in the heads of experienced contributors.

## Solution

A 3D interactive city that represents the Bitcoin Core codebase.

- **Districts** are subsystems (consensus, network, wallet, mempool, mining, RPC).
- **Buildings** are key files and classes within those subsystems.
- **Roads** are the actual data-flow paths between components.
- **Journeys** are painted trails through the city that you can follow — like marked hiking paths in a national park.

You can freely explore the city or follow a guided journey. At any building, you can open a panel showing the actual source code and annotations.

## Design Principles

### 1. Every visual encodes information

No decoration. No eye candy. If a shape, color, size, or brightness doesn't teach something, it doesn't exist. The 3D serves spatial memory, abstraction-via-zoom, and animated data flow — nothing else.

### 2. One symbol = one meaning, everywhere

Like a music video where each sound is always the same visual: once you learn that blue = consensus, it's blue in the city, in the code panel, in the sidebar, in search results. The visual language becomes subconscious within minutes.

### 3. Journeys are painted lines, not a mode

The city is always explorable. Journeys are colored paths visible on the ground. Click one to follow it. Walk off anytime. Come back anytime. You're never locked into a tour.

### 4. Built from the code, not hardcoded

Point the app at a Bitcoin Core checkout. It parses the actual source tree and builds the city. Change branches, re-parse. The layout is algorithmic (biased by directory structure and known subsystem groupings), not a hand-drawn map.

### 5. Minimalism serves understanding

The visual complexity of a subway map that happens to be 3D. Flat colors, clean labels, box geometry. Google Maps 3D buildings, not Cyberpunk 2077.

## What 3D Buys Us (and Nothing More)

1. **Spatial memory** — after 10 minutes you *know* where things are. Consensus is "over there." Wallet is "back here." This sticks in a way flat diagrams don't.
2. **Zoom = abstraction** — far: districts. Closer: buildings. Inside: code. Natural, intuitive, no UI needed.
3. **Animated paths** — a glowing dot traveling a road from P2P to Mempool to Validation is instantly understandable. That dot is a transaction. You just *got it*.
