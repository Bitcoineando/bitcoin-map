#!/usr/bin/env python3
"""
Parse a Bitcoin Core checkout and generate city-data JSON for the 3D map.

Usage:
    python scripts/parse_codebase.py /path/to/bitcoin-core v28.4 --output public/versions/city-data-v28.4.json
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# Subsystem classification rules (first match wins)
# ---------------------------------------------------------------------------
SUBSYSTEM_RULES = [
    ("src/init.", "init"),
    ("src/bitcoind.", "init"),
    ("src/bitcoin-cli.", "init"),
    ("src/bitcoin-tx.", "init"),
    ("src/bitcoin-wallet.", "init"),
    ("src/bitcoin-chainstate.", "init"),
    ("src/noui.", "init"),

    ("src/net_processing.", "network"),
    ("src/net.", "network"),
    ("src/addrman.", "network"),
    ("src/addrdb.", "network"),
    ("src/banman.", "network"),
    ("src/i2p.", "network"),
    ("src/torcontrol.", "network"),
    ("src/netaddress.", "network"),
    ("src/netbase.", "network"),
    ("src/netgroup.", "network"),
    ("src/bip324.", "network"),

    ("src/txmempool.", "mempool"),
    ("src/policy/", "mempool"),
    ("src/txorphanage.", "mempool"),

    ("src/validation.", "consensus"),
    ("src/chain.", "consensus"),
    ("src/pow.", "consensus"),
    ("src/coins.", "consensus"),
    ("src/txdb.", "consensus"),
    ("src/consensus/", "consensus"),
    ("src/versionbits.", "consensus"),
    ("src/deploymentstatus.", "consensus"),
    ("src/arith_uint256.", "consensus"),

    ("src/script/", "script"),
    ("src/primitives/", "primitives"),

    ("src/node/miner.", "mining"),
    ("src/node/blockstorage.", "mining"),
    ("src/node/blockmanager.", "mining"),
    ("src/blockfilter.", "mining"),
    ("src/blockencodings.", "mining"),

    ("src/wallet/", "wallet"),

    ("src/rpc/", "rpc"),
    ("src/httpserver.", "rpc"),
    ("src/httprpc.", "rpc"),
    ("src/rest.", "rpc"),

    ("src/kernel/", "kernel"),
    ("src/node/", "node"),
    ("src/interfaces/", "interfaces"),

    ("src/crypto/", "crypto"),
    ("src/hash.", "crypto"),
    ("src/pubkey.", "crypto"),
    ("src/key.", "crypto"),
    ("src/key_io.", "crypto"),

    ("src/serialize.", "util"),
    ("src/streams.", "util"),
    ("src/uint256.", "util"),
    ("src/logging.", "util"),
    ("src/util/", "util"),
    ("src/common/", "util"),
    ("src/support/", "util"),
    ("src/dbwrapper.", "util"),
    ("src/random.", "util"),
    ("src/span.", "util"),
    ("src/prevector.", "util"),
    ("src/compat/", "util"),
    ("src/tinyformat.", "util"),
    ("src/clientversion.", "util"),
    ("src/compressor.", "util"),

    ("src/index/", "index"),
    ("src/zmq/", "zmq"),
    ("src/qt/", "gui"),
    ("src/bench/", "bench"),
    ("src/test/", "test"),
    ("test/", "test"),
    ("contrib/", "test"),

    # Legacy file names (pre-refactoring, early versions)
    # main.cpp was later split into validation.cpp, net_processing.cpp, etc.
    ("src/main.", "consensus"),
    ("src/rpc.", "rpc"),
    ("src/wallet.", "wallet"),
    ("src/db.", "util"),
    ("src/irc.", "network"),
    ("src/keystore.", "crypto"),
    ("src/base58.", "crypto"),
    ("src/bignum.", "crypto"),
    ("src/strlcpy.", "util"),
    ("src/headers.", "util"),
    ("src/script.", "script"),
    ("src/ui.", "gui"),
    ("src/uibase.", "gui"),
    ("src/market.", "other"),
    ("src/checkpoints.", "consensus"),
    ("src/checkqueue.", "consensus"),
    ("src/txmempool.", "mempool"),
    ("src/miner.", "mining"),
    ("src/bloom.", "network"),
    ("src/alert.", "network"),
    ("src/protocol.", "network"),
    ("src/version.", "util"),
    ("src/sync.", "util"),
    ("src/threadsafety.", "util"),
    ("src/limitedmap.", "util"),
    ("src/allocators.", "util"),
    ("src/mruset.", "util"),
    ("src/netbase.", "network"),
    ("src/timedata.", "util"),
    ("src/amount.", "consensus"),
    ("src/rpcclient.", "rpc"),
    ("src/rpcprotocol.", "rpc"),
    ("src/rpcserver.", "rpc"),
    ("src/rpcmisc.", "rpc"),
    ("src/rpcblockchain.", "rpc"),
    ("src/rpcmining.", "rpc"),
    ("src/rpcnet.", "rpc"),
    ("src/rpcrawtransaction.", "rpc"),
    ("src/rpcwallet.", "rpc"),
    ("src/crypter.", "wallet"),
    ("src/walletdb.", "wallet"),
    ("src/util.", "util"),

    # Vendored libs in early versions
    ("src/cryptopp/", "crypto"),
    ("src/json/", "util"),
]

# District ordering for grid layout
DISTRICT_ORDER = [
    "init", "network", "mempool", "consensus", "script",
    "primitives", "mining", "wallet", "rpc", "kernel",
    "node", "interfaces", "storage", "crypto", "util",
    "index", "zmq", "gui", "bench", "test",
    "other",
]

DISTRICT_COLORS = {
    "init": "#e0e0e0",
    "network": "#f59e0b",
    "mempool": "#ef4444",
    "consensus": "#3b82f6",
    "script": "#818cf8",
    "primitives": "#6366f1",
    "mining": "#a855f7",
    "wallet": "#22c55e",
    "rpc": "#14b8a6",
    "kernel": "#06b6d4",
    "node": "#0ea5e9",
    "interfaces": "#64748b",
    "storage": "#78716c",
    "crypto": "#d946ef",
    "util": "#6b7280",
    "index": "#8b5cf6",
    "zmq": "#ec4899",
    "gui": "#f43f5e",
    "bench": "#737373",
    "test": "#525252",
    "other": "#404040",
}

STORAGE_BUILDINGS = [
    {"id": "store_blk_dat", "name": "blk*.dat", "subsystem": "storage", "loc": 500},
    {"id": "store_rev_dat", "name": "rev*.dat", "subsystem": "storage", "loc": 300},
    {"id": "store_chainstate", "name": "chainstate/", "subsystem": "storage", "loc": 400},
    {"id": "store_block_index", "name": "blocks/index/", "subsystem": "storage", "loc": 300},
    {"id": "store_wallet_db", "name": "wallets/*.sqlite", "subsystem": "storage", "loc": 350},
    {"id": "store_mempool_dat", "name": "mempool.dat", "subsystem": "storage", "loc": 200},
    {"id": "store_peers_dat", "name": "peers.dat", "subsystem": "storage", "loc": 200},
    {"id": "store_banlist", "name": "banlist.json", "subsystem": "storage", "loc": 100},
]

# Storage dependency edges (hardcoded)
STORAGE_DEPS = [
    ("node_blockstorage_cpp", "store_blk_dat"),
    ("store_blk_dat", "node_blockstorage_cpp"),
    ("store_blk_dat", "validation_cpp"),
    ("node_blockstorage_cpp", "store_rev_dat"),
    ("store_rev_dat", "node_blockstorage_cpp"),
    ("store_rev_dat", "validation_cpp"),
    ("txdb_cpp", "store_chainstate"),
    ("coins_cpp", "store_chainstate"),
    ("validation_cpp", "store_chainstate"),
    ("store_chainstate", "txdb_cpp"),
    ("store_chainstate", "coins_cpp"),
    ("store_chainstate", "validation_cpp"),
    ("node_blockstorage_cpp", "store_block_index"),
    ("store_block_index", "node_blockstorage_cpp"),
    ("store_block_index", "validation_cpp"),
    ("wallet_walletdb_cpp", "store_wallet_db"),
    ("wallet_sqlite_cpp", "store_wallet_db"),
    ("store_wallet_db", "wallet_walletdb_cpp"),
    ("store_wallet_db", "wallet_sqlite_cpp"),
    ("node_mempool_persist_cpp", "store_mempool_dat"),
    ("store_mempool_dat", "node_mempool_persist_cpp"),
    ("addrdb_cpp", "store_peers_dat"),
    ("store_peers_dat", "addrdb_cpp"),
    ("banman_cpp", "store_banlist"),
    ("store_banlist", "banman_cpp"),
]

# Regex patterns
RE_CLASS_STRUCT = re.compile(r"^\s*(class|struct)\s+\w+")
RE_FORWARD_DECL = re.compile(r";\s*$")
RE_ENUM = re.compile(r"^\s*enum\s+")
RE_FUNCTION = re.compile(
    r"^[a-zA-Z_][\w:*&<>\s,]*\s+\*?[a-zA-Z_]\w*\s*\([^;]*\)\s*(const\s*)?\{?\s*$"
)
RE_INCLUDE_LOCAL = re.compile(r'^\s*#include\s+"([^"]+)"')
RE_INCLUDE_ANGLE = re.compile(r'^\s*#include\s+<([^>]+)>')


def path_to_id(path: str) -> str:
    """Convert a file path to a building ID."""
    # Remove src/ prefix if present
    if path.startswith("src/"):
        p = path[4:]
    else:
        p = path
    # Replace / and . but preserve hyphens
    p = p.replace("/", "_").replace(".", "_")
    return p


# Fallback rules for early versions where files are in the repo root (no src/ prefix)
# These map bare filenames to subsystems for Satoshi-era code.
ROOTFILE_RULES = [
    ("main.", "consensus"),
    ("net.", "network"),
    ("irc.", "network"),
    ("db.", "util"),
    ("script.", "script"),
    ("key.", "crypto"),
    ("sha.", "crypto"),
    ("bignum.", "crypto"),
    ("base58.", "crypto"),
    ("uint256.", "util"),
    ("serialize.", "util"),
    ("util.", "util"),
    ("headers.", "util"),
    ("init.", "init"),
    ("bitcoind.", "init"),
    ("rpc.", "rpc"),
    ("wallet.", "wallet"),
    ("ui.", "gui"),
    ("uibase.", "gui"),
    ("market.", "other"),
]


def classify_subsystem(path: str) -> str:
    """Classify a file path into a subsystem using first-match rules."""
    # Try standard src/ prefix rules first
    for prefix, subsystem in SUBSYSTEM_RULES:
        if path.startswith(prefix):
            return subsystem

    # For root-level files (early versions without src/), try bare filename rules
    if "/" not in path:
        for prefix, subsystem in ROOTFILE_RULES:
            if path.startswith(prefix):
                return subsystem

    if path.startswith("src/"):
        return "other"
    return "other"


def count_metrics(filepath: str):
    """Count LOC, classes, functions, enums in a file."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            lines = f.readlines()
    except (OSError, IOError):
        return 0, 0, 0, 0

    loc = len(lines)
    classes = 0
    functions = 0
    enums = 0
    in_block_comment = False

    for line in lines:
        stripped = line.strip()

        # Track block comments
        if in_block_comment:
            if "*/" in stripped:
                in_block_comment = False
            continue
        if stripped.startswith("/*"):
            if "*/" not in stripped:
                in_block_comment = True
            continue
        if stripped.startswith("//"):
            continue

        # Count classes/structs (not forward declarations)
        if RE_CLASS_STRUCT.match(line):
            if not RE_FORWARD_DECL.search(stripped):
                classes += 1

        # Count enums
        if RE_ENUM.match(line):
            enums += 1

        # Count functions (approximate)
        if RE_FUNCTION.match(line):
            functions += 1

    return loc, classes, functions, enums


def discover_files(repo_path: str):
    """Find all .cpp and .h files in the Bitcoin Core repo.

    Handles both modern layout (files under src/) and early Satoshi-era layout
    (files in the repo root). Excludes vendored third-party subdirectories.
    """
    EXCLUDED_SUBDIRS = {"secp256k1", "leveldb", "minisketch", "crc32c", "univalue"}

    files = []
    src_dir = os.path.join(repo_path, "src")
    contrib_dir = os.path.join(repo_path, "contrib", "devtools", "bitcoin-tidy")

    # Check if src/ contains actual source files (not just build artifacts)
    has_src_sources = os.path.isdir(src_dir) and any(
        f.endswith((".cpp", ".h")) for f in os.listdir(src_dir)
        if os.path.isfile(os.path.join(src_dir, f))
    )

    # Check if repo root has source files (early Satoshi-era layout)
    has_root_sources = any(
        f.endswith((".cpp", ".h")) for f in os.listdir(repo_path)
        if os.path.isfile(os.path.join(repo_path, f))
    )

    scan_dirs = []
    if has_src_sources:
        scan_dirs.append((src_dir, "src"))
        scan_dirs.append((contrib_dir, "contrib/devtools/bitcoin-tidy"))
    if has_root_sources and not has_src_sources:
        # Early layout: scan only root-level files (not subdirs like src/ with artifacts)
        scan_dirs.append((repo_path, ""))

    for root_dir, rel_prefix in scan_dirs:
        if not os.path.isdir(root_dir):
            continue

        # For root-level scanning (early versions), only list files in the root dir, no recursion
        if rel_prefix == "":
            for fname in sorted(os.listdir(root_dir)):
                if not (fname.endswith(".cpp") or fname.endswith(".h")):
                    continue
                abs_path = os.path.join(root_dir, fname)
                if os.path.isfile(abs_path):
                    files.append((fname, abs_path))
            continue

        for dirpath, dirnames, filenames in os.walk(root_dir):
            rel_dir = os.path.relpath(dirpath, repo_path).replace(os.sep, "/")

            # Skip .git, build dirs, and vendored code
            if rel_dir.startswith("src/"):
                second = rel_dir.split("/")[1] if "/" in rel_dir[4:] else rel_dir[4:]
                if second in EXCLUDED_SUBDIRS:
                    dirnames[:] = []
                    continue

            for fname in sorted(filenames):
                if not (fname.endswith(".cpp") or fname.endswith(".h")):
                    continue
                abs_path = os.path.join(dirpath, fname)
                rel_path = os.path.relpath(abs_path, repo_path)
                rel_path = rel_path.replace(os.sep, "/")
                files.append((rel_path, abs_path))

    # Deduplicate
    seen = set()
    unique = []
    for rel, absp in files:
        if rel not in seen:
            seen.add(rel)
            unique.append((rel, absp))

    return unique


def resolve_include(include_path: str, including_file_rel: str, known_paths: set, repo_path: str):
    """Resolve a local #include to a known file path."""
    # Try as src/{include_path}
    candidate = "src/" + include_path
    if candidate in known_paths:
        return candidate

    # Try as bare path (for early versions with root-level files)
    if include_path in known_paths:
        return include_path

    # Try relative to including file's directory
    inc_dir = os.path.dirname(including_file_rel)
    candidate = os.path.normpath(os.path.join(inc_dir, include_path)).replace(os.sep, "/")
    if candidate in known_paths:
        return candidate

    return None


def parse_dependencies(rel_path: str, abs_path: str, known_paths: set, repo_path: str):
    """Extract #include dependencies from a file."""
    deps = []
    my_id = path_to_id(rel_path)

    try:
        with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                # Try both quote and angle-bracket includes
                m = RE_INCLUDE_LOCAL.match(line)
                if not m:
                    m = RE_INCLUDE_ANGLE.match(line)
                if not m:
                    continue
                include_path = m.group(1)
                # Strip IWYU pragmas or trailing comments from the path
                include_path = include_path.strip()
                resolved = resolve_include(include_path, rel_path, known_paths, repo_path)
                if resolved is None:
                    continue
                target_id = path_to_id(resolved)
                if target_id != my_id:
                    deps.append(target_id)
    except (OSError, IOError):
        pass

    # Deduplicate while preserving order
    seen = set()
    unique_deps = []
    for d in deps:
        if d not in seen:
            seen.add(d)
            unique_deps.append(d)

    return unique_deps


def build_districts(subsystem_counts: dict):
    """Build district objects with grid layout."""
    cols = 5
    spacing_x = 30
    spacing_z = 28

    districts = []
    for i, name in enumerate(DISTRICT_ORDER):
        count = subsystem_counts.get(name, 0)
        if count == 0 and name != "storage":
            continue

        row = i // cols
        col = i % cols
        x = (col - cols / 2) * spacing_x
        z = -row * spacing_z

        side = max(10, min(40, 4 + count * 0.8))

        districts.append({
            "id": name,
            "name": name.upper(),
            "color": DISTRICT_COLORS.get(name, "#404040"),
            "position": [x, z],
            "size": [side, side],
            "buildingCount": count,
        })

    return districts


def main():
    parser = argparse.ArgumentParser(description="Parse Bitcoin Core codebase for city map")
    parser.add_argument("repo_path", help="Path to Bitcoin Core checkout")
    parser.add_argument("version", help="Version string (e.g. v28.4)")
    parser.add_argument("--output", "-o", default="city-data.json", help="Output JSON file")
    args = parser.parse_args()

    repo_path = os.path.abspath(args.repo_path)
    if not os.path.isdir(repo_path):
        print(f"Error: {repo_path} is not a directory", file=sys.stderr)
        sys.exit(1)

    print(f"Scanning {repo_path} for .cpp and .h files...")
    files = discover_files(repo_path)
    print(f"Found {len(files)} source files")

    # Build set of known relative paths for dependency resolution
    known_paths = {rel for rel, _ in files}

    # Process each file
    buildings = []
    all_deps = []
    subsystem_counts = {}
    building_ids = set()

    for rel_path, abs_path in sorted(files):
        loc, classes, functions, enums = count_metrics(abs_path)
        if loc == 0:
            continue

        bid = path_to_id(rel_path)
        subsystem = classify_subsystem(rel_path)
        building_ids.add(bid)

        buildings.append({
            "id": bid,
            "name": rel_path,
            "path": rel_path,
            "subsystem": subsystem,
            "loc": loc,
            "classes": classes,
            "functions": functions,
            "enums": enums,
        })

        subsystem_counts[subsystem] = subsystem_counts.get(subsystem, 0) + 1

        # Parse dependencies
        deps = parse_dependencies(rel_path, abs_path, known_paths, repo_path)
        for target_id in deps:
            all_deps.append({"from": bid, "to": target_id})

    # Add storage buildings
    for sb in STORAGE_BUILDINGS:
        buildings.append({
            "id": sb["id"],
            "name": sb["name"],
            "subsystem": sb["subsystem"],
            "loc": sb["loc"],
            "classes": 0,
            "functions": 0,
            "enums": 0,
            "path": "",
        })
        building_ids.add(sb["id"])

    subsystem_counts["storage"] = len(STORAGE_BUILDINGS)

    # Add storage dependency edges (only if both endpoints exist)
    for from_id, to_id in STORAGE_DEPS:
        if from_id in building_ids and to_id in building_ids:
            all_deps.append({"from": from_id, "to": to_id})

    # Build districts
    districts = build_districts(subsystem_counts)

    # Summary (file_count includes storage buildings to match existing convention)
    file_count = len(buildings)
    dep_count = len(all_deps)

    print(f"Files: {file_count}")
    print(f"Dependencies: {dep_count}")
    print(f"Districts: {len(districts)}")

    # Print per-subsystem counts
    for name in DISTRICT_ORDER:
        c = subsystem_counts.get(name, 0)
        if c > 0:
            print(f"  {name}: {c}")

    # Build output
    output = {
        "version": args.version,
        "github_base": f"https://github.com/bitcoin/bitcoin/blob/{args.version}",
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S"),
        "file_count": file_count,
        "dependency_count": dep_count,
        "districts": districts,
        "buildings": buildings,
        "dependencies": all_deps,
    }

    # Ensure output directory exists
    out_dir = os.path.dirname(args.output)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"\nWritten to {args.output}")


if __name__ == "__main__":
    main()
