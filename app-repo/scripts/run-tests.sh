#!/usr/bin/env bash
set -o pipefail

ART_DIR="test-artifacts"
mkdir -p "$ART_DIR"

echo "[1/4] Installing dependencies (npm ci)"
npm ci

echo "[2/4] Running unit/integration tests (jest)"
set +e
npm test | tee "$ART_DIR/jest.txt"
JEST_EXIT=${PIPESTATUS[0]}
set -e

echo "[3/4] Installing Playwright browsers"
npx playwright install --with-deps

echo "[4/4] Running E2E tests (Playwright)"
set +e
npm run e2e:external | tee "$ART_DIR/playwright.txt"
PW_EXIT=${PIPESTATUS[0]}
set -e

echo "\n=========== Test Summary ==========="
echo "Jest exit code:        $JEST_EXIT"
echo "Playwright exit code:  $PW_EXIT"
if [ -d "playwright-report" ]; then
  echo "Playwright HTML report: $(pwd)/playwright-report/index.html"
fi
if [ -f "$ART_DIR/jest.txt" ]; then
  echo "Jest log:              $(pwd)/$ART_DIR/jest.txt"
fi
if [ -f "$ART_DIR/playwright.txt" ]; then
  echo "Playwright log:        $(pwd)/$ART_DIR/playwright.txt"
fi
echo "===================================\n"

if [ "$JEST_EXIT" -ne 0 ] || [ "$PW_EXIT" -ne 0 ]; then
  if [ "$ALERT_EMAIL_ENABLED" = "1" ]; then
    echo "Sending failure email alert..."
    node scripts/send-alert.js "$JEST_EXIT" "$PW_EXIT" || true
  fi
  exit 1
fi
