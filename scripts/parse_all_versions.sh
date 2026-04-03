#!/bin/bash
#
# Parse all historically significant Bitcoin Core releases.
# Checks out each tag, runs the parser, restores the original checkout.
#
# Usage:
#   ./scripts/parse_all_versions.sh /path/to/bitcoin-core
#

set -e

REPO="${1:?Usage: $0 /path/to/bitcoin-core}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/../public/versions"
PARSER="$SCRIPT_DIR/parse_codebase.py"

# The 9 releases
VERSIONS=(
  "v0.1.5"
  "v0.3.24"
  "v0.8.0"
  "v0.9.0"
  "v0.13.0"
  "v0.16.0"
  "v22.0"
  "v24.0"
  "v28.4"
)

mkdir -p "$OUTPUT_DIR"

# Save current state so we can restore it
cd "$REPO"
ORIGINAL_REF=$(git describe --tags --always HEAD 2>/dev/null || git rev-parse --short HEAD)
echo "Current checkout: $ORIGINAL_REF"
echo ""

# Check for uncommitted changes
if ! git diff --quiet HEAD 2>/dev/null; then
  echo "ERROR: Repo has uncommitted changes. Commit or stash them first."
  exit 1
fi

for version in "${VERSIONS[@]}"; do
  echo "=== Parsing $version ==="

  # Check if tag exists
  if ! git rev-parse "$version" >/dev/null 2>&1; then
    echo "  WARNING: Tag $version not found, skipping"
    echo ""
    continue
  fi

  git checkout "$version" --quiet 2>/dev/null

  output_file="$OUTPUT_DIR/city-data-${version}.json"
  python3 "$PARSER" "$REPO" "$version" --output "$output_file"

  echo "  → $output_file"
  echo ""
done

# Restore original checkout
echo "=== Restoring $ORIGINAL_REF ==="
git checkout "$ORIGINAL_REF" --quiet 2>/dev/null
echo "Done."
