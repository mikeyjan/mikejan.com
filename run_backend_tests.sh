#!/bin/bash

# Backend Test Runner for Personal Website
# This script runs all backend Lambda function tests

set -e  # Exit on first error

echo "=========================================="
echo "Running Backend Tests for Personal Website"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track test results
FAILED_TESTS=()
PASSED_TESTS=()

# Function to run tests in a directory
run_test() {
    local test_dir=$1
    local test_name=$2
    
    echo "Running: $test_name"
    if (cd "$test_dir" && python3 -m pytest -v --tb=short); then
        PASSED_TESTS+=("$test_name")
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
    else
        FAILED_TESTS+=("$test_name")
        echo -e "${RED}✗ $test_name FAILED${NC}"
        return 1
    fi
    echo ""
}

# Run shared tests
echo "=== Shared Module Tests ==="
run_test "amplify/backend/function/shared" "Shared: JWT Middleware & Token Validation" || true
echo ""

# Run Lambda function tests
echo "=== Lambda Function Tests ==="
run_test "amplify/backend/function/authenticateAdmin/src" "authenticateAdmin" || true
run_test "amplify/backend/function/createCity/src" "createCity" || true
run_test "amplify/backend/function/updateCity/src" "updateCity" || true
run_test "amplify/backend/function/deleteCity/src" "deleteCity" || true
run_test "amplify/backend/function/updatePersonalInfo/src" "updatePersonalInfo" || true
run_test "amplify/backend/function/getCityDetails/src" "getCityDetails" || true

# Print summary
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: ${#PASSED_TESTS[@]}${NC}"
for test in "${PASSED_TESTS[@]}"; do
    echo -e "  ${GREEN}✓${NC} $test"
done
echo ""

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}Failed: ${#FAILED_TESTS[@]}${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗${NC} $test"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
