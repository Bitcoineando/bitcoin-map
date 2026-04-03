# Bitcoin Map — Parser Scripts

These scripts analyze the Bitcoin Core source tree and generate the JSON data files that power the 3D city visualization.

## Scripts

### `parse_codebase.py`

Analyzes a single Bitcoin Core checkout and produces a JSON file with buildings (files), districts (subsystems), and dependencies (includes).

```bash
python3 scripts/parse_codebase.py /path/to/bitcoin-core v28.4 --output public/versions/city-data-v28.4.json
```

**What it does:**
- Finds all `.cpp` and `.h` files (handles both modern `src/` layout and Satoshi-era root-level layout)
- Classifies each file into a subsystem (consensus, network, wallet, etc.) based on directory path
- Counts lines of code, classes, functions, and enums per file
- Extracts `#include` dependencies between files
- Outputs a self-contained JSON with districts, buildings, and dependency edges

**No external dependencies** — uses only Python standard library (regex-based parsing, no tree-sitter needed).

### `parse_all_versions.sh`

Batch runner that checks out each historically significant release tag, runs the parser, and restores the original checkout.

```bash
./scripts/parse_all_versions.sh /path/to/bitcoin-core
```

Outputs JSON files to `public/versions/`.

## Tracked Releases

9 releases spanning 2009–2025, chosen for their historical significance:

| Version | Date | Era | Label | Files | Deps | Districts | What happened |
|---------|------|-----|-------|-------|------|-----------|---------------|
| v0.1.5 | Feb 2009 | Satoshi | Genesis | 34 | 25 | 8 | Earliest tagged release. 26 source files in the repo root, no directories. Everything is a monolith. |
| v0.3.24 | Jul 2011 | Satoshi | Satoshi's Last | 81 | 115 | 13 | Last release of the Satoshi era. `src/` directory appears. JSON-RPC, `init.cpp` split out. |
| v0.8.0 | Feb 2013 | Growth | LevelDB | 199 | 468 | 13 | BerkeleyDB → LevelDB migration. Accidentally caused a consensus fork. The codebase is growing fast. |
| v0.9.0 | Mar 2014 | Growth | Bitcoin Core | 254 | 739 | 15 | Rebranded from "Bitcoin-Qt" to "Bitcoin Core." Major refactoring — `main.cpp` starts being broken up. Mempool gets its own identity. |
| v0.13.0 | Aug 2016 | War | SegWit | 397 | 1,555 | 17 | Segregated Witness code lands. Compact blocks. The `consensus/` and `script/` directories crystallize. This is the code the blocksize war was fought over. |
| v0.16.0 | Feb 2018 | War | Post-War | 462 | 1,948 | 17 | Full SegWit wallet support. The war is over. HD wallets by default. The wallet district grows. |
| v22.0 | Sep 2021 | Modern | Taproot | 843 | 4,152 | 20 | Taproot activation. New versioning scheme. `node/` and `interfaces/` districts appear — the codebase is being layered. |
| v24.0 | Nov 2022 | Modern | Kernel | 948 | 4,981 | 21 | `libbitcoinkernel` work begins — separating consensus into a standalone library. The `kernel/` district appears for the first time. |
| v28.4 | Mar 2025 | Modern | Current | 1,084 | 6,275 | 21 | Current release. The full metropolis. |

## How Subsystem Classification Works

Files are classified into subsystems based on their path using first-match prefix rules:

- `src/validation.*` → consensus
- `src/net.*`, `src/net_processing.*` → network
- `src/wallet/` → wallet
- `src/script/` → script
- `src/rpc/` → rpc
- etc.

For early versions where files live in the repo root (`main.cpp`, `net.cpp`), fallback rules map bare filenames to subsystems.

The full rule list is in `parse_codebase.py`. Rules are applied in order — first match wins.

## Regenerating Data

If you pull a new Bitcoin Core release or want to update the data:

```bash
# Single version
python3 scripts/parse_codebase.py /path/to/bitcoin-core v29.0 --output public/versions/city-data-v29.0.json

# All versions (takes ~30 seconds)
./scripts/parse_all_versions.sh /path/to/bitcoin-core
```

Then add the new version to `public/versions/versions.json`.
