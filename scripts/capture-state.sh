#!/bin/bash
# Captures full iOS simulator state for AI context
# Usage: ./scripts/capture-state.sh [--json]
#
# Requires:
#   - iOS simulator booted with the app running
#   - ios-simulator-skill installed at ~/.claude/skills/ios-simulator-skill/

set -euo pipefail

SKILL_DIR="$HOME/.claude/skills/ios-simulator-skill/ios-simulator-skill/scripts"
OUTPUT_DIR="apps/mobile/e2e/.state-captures"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "=== Capturing iOS Simulator State ==="

# 1. Accessibility tree (screen_mapper)
echo "  [1/3] Mapping UI elements..."
python3 "$SKILL_DIR/screen_mapper.py" \
  ${1:+--json} > "$OUTPUT_DIR/ui-tree-$TIMESTAMP.txt" 2>&1

# 2. Full app state
echo "  [2/3] Capturing app state..."
python3 "$SKILL_DIR/app_state_capture.py" \
  --output "$OUTPUT_DIR" \
  --inline > "$OUTPUT_DIR/app-state-$TIMESTAMP.txt" 2>&1

# 3. Screenshot
echo "  [3/3] Taking screenshot..."
xcrun simctl io booted screenshot "$OUTPUT_DIR/screenshot-$TIMESTAMP.png" 2>/dev/null \
  && echo "  Screenshot saved." \
  || echo "  Warning: Screenshot failed (is a simulator booted?)"

echo ""
echo "State captured to $OUTPUT_DIR/*-$TIMESTAMP.*"
echo "Pass these files as context to Claude Code."
