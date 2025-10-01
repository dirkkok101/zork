#!/bin/bash

# Test Diagnostics Script
# Runs tests and outputs failures to a diagnostic file for later review

set -e

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
OUTPUT_FILE="test-diagnostics.md"
TEST_PATH=""
CATEGORY=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --scenes)
      TEST_PATH="testing/scenes"
      CATEGORY="Scenes"
      shift
      ;;
    --items)
      TEST_PATH="testing/items"
      CATEGORY="Items"
      shift
      ;;
    --monsters)
      TEST_PATH="testing/monsters"
      CATEGORY="Monsters"
      shift
      ;;
    --path)
      TEST_PATH="$2"
      CATEGORY="Custom Path"
      shift 2
      ;;
    --output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --scenes              Run diagnostics on scene tests"
      echo "  --items               Run diagnostics on item tests"
      echo "  --monsters            Run diagnostics on monster tests"
      echo "  --path <path>         Run diagnostics on specific path"
      echo "  --output <file>       Output file name (default: test-diagnostics.md)"
      echo "  --help                Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 --scenes"
      echo "  $0 --path testing/scenes/beach"
      echo "  $0 --scenes --output beach-diagnostics.md"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Validate test path
if [ -z "$TEST_PATH" ]; then
  echo -e "${RED}Error: No test path specified${NC}"
  echo "Use --scenes, --items, --monsters, or --path <path>"
  echo "Use --help for more information"
  exit 1
fi

if [ ! -d "$TEST_PATH" ]; then
  echo -e "${RED}Error: Test path does not exist: $TEST_PATH${NC}"
  exit 1
fi

echo -e "${YELLOW}Running diagnostics on: ${TEST_PATH}${NC}"
echo -e "${YELLOW}Output file: ${OUTPUT_FILE}${NC}"
echo ""

# Run tests with JSON output
echo -e "${GREEN}Running tests...${NC}"
TEST_OUTPUT=$(npm test -- "$TEST_PATH" --json --testLocationInResults 2>&1 || true)

# Extract JSON from output (Jest outputs JSON after all other output)
JSON_OUTPUT=$(echo "$TEST_OUTPUT" | grep -A 999999 '^{' | head -1)

# Parse test results using Node.js
node -e "
const fs = require('fs');
const testResults = $JSON_OUTPUT;

const timestamp = new Date().toISOString();
const outputFile = '$OUTPUT_FILE';
const category = '$CATEGORY';
const testPath = '$TEST_PATH';

let markdown = \`# Test Diagnostics Report
**Category:** \${category}
**Test Path:** \${testPath}
**Generated:** \${timestamp}
**Status:** \${testResults.success ? '✅ All Passing' : '❌ Failures Detected'}

## Summary
- **Total Test Suites:** \${testResults.numTotalTestSuites}
- **Passed Test Suites:** \${testResults.numPassedTestSuites}
- **Failed Test Suites:** \${testResults.numFailedTestSuites}
- **Total Tests:** \${testResults.numTotalTests}
- **Passed Tests:** \${testResults.numPassedTests}
- **Failed Tests:** \${testResults.numFailedTests}

\`;

if (testResults.numFailedTests > 0) {
  markdown += \`## Failures\n\n\`;

  testResults.testResults.forEach(suite => {
    if (suite.status === 'failed') {
      const relativePath = suite.name.replace(process.cwd() + '/', '');
      markdown += \`### \${relativePath}\n\n\`;

      suite.assertionResults.forEach(test => {
        if (test.status === 'failed') {
          markdown += \`#### ❌ \${test.ancestorTitles.join(' › ')} › \${test.title}\n\n\`;

          if (test.failureMessages && test.failureMessages.length > 0) {
            markdown += \`\\\`\\\`\\\`\n\${test.failureMessages.join('\n\n')}\n\\\`\\\`\\\`\n\n\`;
          }

          if (test.location) {
            markdown += \`**Location:** \${relativePath}:\${test.location.line}\n\n\`;
          }
        }
      });
    }
  });
} else {
  markdown += \`## ✅ All Tests Passing\n\nNo failures detected in this test run.\n\n\`;
}

markdown += \`## Full Test Results\n\n\`;
markdown += \`\\\`\\\`\\\`json\n\${JSON.stringify(testResults, null, 2)}\n\\\`\\\`\\\`\n\`;

fs.writeFileSync(outputFile, markdown);
console.log('Diagnostics written to: ' + outputFile);
" 2>/dev/null || {
  echo -e "${RED}Error: Failed to parse test results${NC}"
  echo "Raw output saved to test-diagnostics-raw.txt"
  echo "$TEST_OUTPUT" > test-diagnostics-raw.txt
  exit 1
}

echo ""
echo -e "${GREEN}✓ Diagnostics complete${NC}"
echo -e "${YELLOW}Review: ${OUTPUT_FILE}${NC}"

# Show summary
if [ -f "$OUTPUT_FILE" ]; then
  echo ""
  echo -e "${YELLOW}Summary:${NC}"
  grep -A 6 "## Summary" "$OUTPUT_FILE" | tail -6
fi
