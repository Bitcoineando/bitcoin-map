# Bitcoin Map — Visual Language

The visual language is a strict key. Every element has one meaning. That meaning is consistent across every part of the application — the 3D scene, the UI panels, the search results, the journey sidebar.

## Shape = What Kind of Code

| Shape    | Meaning                                      | Examples                              |
|----------|----------------------------------------------|---------------------------------------|
| Tall box | Class definition / major implementation file | `CBlock`, `CTxMemPool`, `CConnman`    |
| Low box  | Utility / helper file                        | `util/time.cpp`, `hash.cpp`           |
| Cylinder | Singleton — only one instance exists         | `g_mempool`, `chainstate`, `connman`  |
| Flat slab| Header / interface file                      | `.h` files, abstract base classes     |

Height within each shape category is proportional to lines of code.

## Color = Which Subsystem

| Color    | Subsystem                | Key directory/files                         |
|----------|--------------------------|---------------------------------------------|
| Blue     | Consensus / Validation   | `validation.cpp`, `consensus/`, `chain.cpp` |
| Amber    | Network / P2P            | `net.cpp`, `net_processing.cpp`             |
| Green    | Wallet                   | `wallet/`                                   |
| Red      | Mempool                  | `txmempool.cpp`, `policy/`                  |
| Purple   | Mining                   | `miner.cpp`, `pow.cpp`                      |
| Teal     | RPC / Interface          | `rpc/`, `rest.cpp`                          |
| Gray     | Utilities / Support      | `util/`, `support/`, `crypto/`              |
| White    | Init / Top-level         | `init.cpp`, `bitcoind.cpp`                  |

These colors are used everywhere:
- Building fill in the 3D scene
- Accent bar in the code preview panel
- Dot color next to search results
- Journey path color when a journey passes through that subsystem
- District ground plane tint

## Line Style = Relationship Type

| Style       | Meaning                          |
|-------------|----------------------------------|
| Solid line  | Direct function call             |
| Dashed line | Include / compile-time dependency|
| Dotted line | Signal / callback / async event  |

Lines are thin and subtle by default. They brighten when you hover a building (showing its connections) or when a journey is active (showing the path).

## Brightness = Relevance

| State           | Treatment                    |
|-----------------|------------------------------|
| On active path  | Full brightness, slight glow |
| Hovered         | Full brightness              |
| Default         | Medium brightness            |
| Irrelevant      | Dimmed (during active journey)|

When no journey is active, everything is at default brightness. When following a journey, buildings on the path light up and everything else dims — focusing attention without hiding context.

## Labels

- District names: always visible, large, on the ground plane
- Building names: visible when zoomed to district level, small, above the building
- Function names: visible only when a building is selected/hovered

Labels use a monospace font. No serifs. No decorative typography.

## The Legend

A small, collapsible legend panel lives in the bottom-left corner. It shows the shape and color keys. It's always available but never intrusive. First-time visitors see it expanded; it collapses after first interaction.
