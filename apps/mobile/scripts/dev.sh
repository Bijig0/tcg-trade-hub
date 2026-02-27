#!/usr/bin/env bash
set -euo pipefail

# Ensure we're running from apps/mobile regardless of where the script is invoked.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_DIR"

# Find a preferred unbooted iPhone simulator and boot it before starting Expo.
# If an existing simulator is already booted, this ensures we launch on a fresh device.

PREFS="iPhone 16 Pro Max,iPhone 16 Pro,iPhone 16 Plus,iPhone 16,iPhone 15 Pro Max,iPhone 15 Pro,iPhone 15,iPhone 14 Pro Max,iPhone 14"

TARGET=$(xcrun simctl list devices -j | python3 -c "
import json, sys

data = json.load(sys.stdin)
prefs = '$PREFS'.split(',')
candidates = []

for rt, devs in data.get('devices', {}).items():
    if 'iOS' not in rt:
        continue
    for d in devs:
        if d.get('state') == 'Shutdown' and d.get('isAvailable', False) and 'iPhone' in d['name']:
            try:
                rank = next(i for i, p in enumerate(prefs) if p in d['name'])
            except StopIteration:
                rank = len(prefs)
            candidates.append((rank, d['udid'], d['name']))

candidates.sort()
if candidates:
    print(candidates[0][1] + '|' + candidates[0][2])
" 2>/dev/null || true)

if [ -n "$TARGET" ]; then
    UDID=$(echo "$TARGET" | cut -d'|' -f1)
    NAME=$(echo "$TARGET" | cut -d'|' -f2)
    echo "Booting simulator: $NAME"
    xcrun simctl boot "$UDID"
    open -a Simulator
else
    echo "No unbooted simulator found — using existing"
fi

exec expo start --port 8082
