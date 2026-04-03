# Bitcoin Map — Parser Design

## What the Parser Does

The parser reads a Bitcoin Core source tree and produces a JSON graph that the frontend renders as a city. It runs as a Node.js CLI tool, not in the browser.

```
Bitcoin Core repo → parser → city-data.json → frontend
```

## Input

A path to a Bitcoin Core checkout on disk. The parser reads:

- All `.cpp` and `.h` files under `src/`
- Ignores `src/test/`, `src/bench/`, `src/qt/` (optional, configurable)
- Reads `git log` metadata if available (change frequency, last modified)

## Output: `city-data.json`

```typescript
interface CityData {
  commit: string;              // git commit hash this was parsed from
  timestamp: string;           // when parsed
  
  files: FileNode[];
  dependencies: Dependency[];
  subsystems: SubsystemInfo[];
}

interface FileNode {
  id: string;                  // relative file path
  name: string;                // display name (e.g., "validation.cpp")
  subsystem: string;           // which subsystem/district
  loc: number;                 // lines of code
  classes: ClassInfo[];
  functions: FunctionInfo[];
  includes: string[];          // files this file includes
  changeFrequency?: number;    // commits touching this file (from git log)
}

interface ClassInfo {
  name: string;
  line: number;
  methods: string[];
}

interface FunctionInfo {
  name: string;
  line: number;
  loc: number;                 // lines in this function
  calls: string[];             // functions this function calls (best-effort)
}

interface Dependency {
  from: string;                // file id
  to: string;                  // file id
  type: "include" | "call" | "callback";
  weight: number;              // number of connections
}

interface SubsystemInfo {
  id: string;
  name: string;
  color: string;
  filePatterns: string[];      // glob patterns that belong to this subsystem
}
```

## Subsystem Classification

Files are assigned to subsystems based on directory and filename patterns:

```typescript
const SUBSYSTEM_RULES = [
  { id: "consensus",  patterns: ["validation.*", "consensus/**", "chain.*", "pow.*", "deploymentstatus.*"] },
  { id: "network",    patterns: ["net.*", "net_processing.*", "addrman.*", "banman.*", "i2p.*", "torcontrol.*"] },
  { id: "wallet",     patterns: ["wallet/**"] },
  { id: "mempool",    patterns: ["txmempool.*", "policy/**"] },
  { id: "mining",     patterns: ["miner.*", "node/miner.*"] },
  { id: "rpc",        patterns: ["rpc/**", "rest.*", "httprpc.*", "httpserver.*"] },
  { id: "init",       patterns: ["init.*", "bitcoind.*", "bitcoin-cli.*"] },
  { id: "util",       patterns: ["util/**", "support/**", "crypto/**", "hash.*", "serialize.*"] },
];
```

Files not matching any pattern default to "util."

## Parsing Strategy

### Phase 1: Lightweight (regex-based)

For Phase 1, we skip tree-sitter and use targeted regex extraction. This is faster to build and sufficient for the initial city:

```
#include detection:     /^\s*#include\s+["<](.+)[">]/
Class detection:        /^class\s+(\w+)/
Function detection:     /^(\w[\w:]*)\s+(\w+)\s*\(/  (simplified)
LOC:                    line count
```

This won't catch everything but gives us 80% accuracy with 10% of the effort.

### Phase 2: Tree-sitter

For accurate function call extraction and class method detection, switch to tree-sitter with the C++ grammar:

```
npm install tree-sitter tree-sitter-cpp
```

Tree-sitter gives us a full AST. We walk it to extract:
- Class definitions and their methods
- Function definitions and their bodies
- Function calls within each function body
- Include directives

This enables accurate road generation (which functions actually call which) rather than just include-level connections.

### Phase 3: Clang-based (optional, much later)

For truly accurate call graphs including template resolution and virtual dispatch, use `clang -Xclang -ast-dump` or `compile_commands.json`. This requires a build environment and is heavy. Only worth it if Phase 2 proves insufficient.

## Git Metadata Extraction

If the parser is run inside a git repo, it also extracts:

```bash
# Change frequency: number of commits touching each file
git log --format='' --name-only | sort | uniq -c | sort -rn

# Last modified date per file
git log -1 --format='%ai' -- <file>
```

This feeds into building brightness/glow (frequently changed files are "hotter").

## Running the Parser

```bash
# Parse a local Bitcoin Core checkout
npx bitcoin-map-parse /path/to/bitcoin --output src/data/city-data.json

# Parse with git metadata
npx bitcoin-map-parse /path/to/bitcoin --output src/data/city-data.json --git
```

## Pre-built Snapshot

The repo ships with a pre-parsed `city-data.json` from a recent Bitcoin Core release. This means:

- Users can try the app without cloning Bitcoin Core
- The demo/hosted version works out of the box
- Developers can work on the frontend without running the parser
