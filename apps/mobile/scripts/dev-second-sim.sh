#!/bin/bash
# Launches Expo on a second iOS simulator if one is already running.
# Falls back to normal expo start if no simulator is booted.

SECONDARY_DEVICE="iPhone 16"

# Check if any simulator is already booted
BOOTED=$(xcrun simctl list devices booted | grep -c "Booted")

if [ "$BOOTED" -ge 1 ]; then
  # Boot the secondary simulator if not already booted
  SECONDARY_BOOTED=$(xcrun simctl list devices booted | grep -c "$SECONDARY_DEVICE")
  if [ "$SECONDARY_BOOTED" -eq 0 ]; then
    echo "Booting $SECONDARY_DEVICE as secondary simulator..."
    xcrun simctl boot "$SECONDARY_DEVICE" 2>/dev/null
    open -a Simulator --args -CurrentDeviceUDID "$(xcrun simctl list devices available | grep "$SECONDARY_DEVICE" | head -1 | grep -oE '[A-F0-9-]{36}')"
    sleep 2
  fi
  UDID=$(xcrun simctl list devices booted | grep "$SECONDARY_DEVICE" | grep -oE '[A-F0-9-]{36}' | head -1)
  echo "Starting Expo on $SECONDARY_DEVICE ($UDID)..."
  npx expo start --ios --port 8082 --dev-client --no-dev -- --simulator="$SECONDARY_DEVICE"
else
  echo "No simulator running. Starting normally..."
  npx expo start
fi
