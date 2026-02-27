#!/bin/bash
# Captures iOS simulator state for AI context
# Usage: ./scripts/capture-state.sh [--json]
#
# Captures:
#   1. Screenshot (xcrun simctl — always works)
#   2. UI hierarchy via idb (optional — requires idb_companion)
#   3. App state via idb (optional — requires idb_companion)
#
# Note: For full UI hierarchy in Claude Code, use Maestro MCP's
# inspect_view_hierarchy tool instead — it doesn't need idb.

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills/ios-simulator-skill/ios-simulator-skill/scripts"
VENV_BIN="$HOME/.claude/skills/ios-simulator-skill/.venv/bin"
VENV_PYTHON="$VENV_BIN/python3"
OUTPUT_DIR="apps/mobile/e2e/.state-captures"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Add venv bin to PATH so scripts can find the `idb` command
export PATH="$VENV_BIN:$PATH"

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "=== Capturing iOS Simulator State ==="

# 1. Screenshot (always works with xcrun simctl)
echo "  [1/3] Taking screenshot..."
if xcrun simctl io booted screenshot "$OUTPUT_DIR/screenshot-$TIMESTAMP.png" 2>/dev/null; then
  echo "        -> $OUTPUT_DIR/screenshot-$TIMESTAMP.png"
else
  echo "        -> SKIPPED (no simulator booted)"
fi

# 2. UI element tree (requires idb_companion)
echo "  [2/3] Mapping UI elements..."
if "$VENV_PYTHON" "$SKILL_DIR/screen_mapper.py" \
    ${1:+--json} > "$OUTPUT_DIR/ui-tree-$TIMESTAMP.txt" 2>&1; then
  echo "        -> $OUTPUT_DIR/ui-tree-$TIMESTAMP.txt"
else
  echo "        -> SKIPPED (idb_companion not available)"
  echo "           Install: brew tap facebook/fb && brew install idb-companion"
  echo "           Alternative: Use Maestro MCP inspect_view_hierarchy in Claude Code"
  rm -f "$OUTPUT_DIR/ui-tree-$TIMESTAMP.txt"
fi

# 3. Full app state (requires idb_companion)
echo "  [3/3] Capturing app state..."
if "$VENV_PYTHON" "$SKILL_DIR/app_state_capture.py" \
    --output "$OUTPUT_DIR" \
    --inline > "$OUTPUT_DIR/app-state-$TIMESTAMP.txt" 2>&1; then
  echo "        -> $OUTPUT_DIR/app-state-$TIMESTAMP.txt"
else
  echo "        -> SKIPPED (idb_companion not available)"
  rm -f "$OUTPUT_DIR/app-state-$TIMESTAMP.txt"
fi

echo ""
echo "Captured to: $OUTPUT_DIR/*-$TIMESTAMP.*"
echo ""
echo "Tip: In Claude Code, Maestro MCP provides richer state capture:"
echo "  - inspect_view_hierarchy  (full UI tree)"
echo "  - take_screenshot         (screenshot)"
echo "  - run_flow                (E2E test execution)"
