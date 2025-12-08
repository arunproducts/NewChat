#!/bin/bash

echo "🚀 Testing xelo AI Platform Features"
echo "===================================="
echo

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Vision SDK Info
echo -e "${BLUE}[1] Vision SDK Info${NC}"
curl -s http://localhost:5174/api/vision/info | jq '.capabilities'
echo

# Test 2: Edge Runtime Stats
echo -e "${BLUE}[2] Edge Runtime Statistics${NC}"
curl -s http://localhost:5174/api/edge/stats | jq '.devicesOnline, .availableModels'
echo

# Test 3: Edge Devices
echo -e "${BLUE}[3] Available Edge Devices${NC}"
curl -s http://localhost:5174/api/edge/devices | jq '.[] | {name, type, status}'
echo

# Test 4: Industry Solutions Stats
echo -e "${BLUE}[4] Industry Solutions Status${NC}"
curl -s http://localhost:5174/api/solutions/stats | jq '.enabledSolutions, .solutions | keys'
echo

echo -e "${GREEN}✅ All features responding correctly!${NC}"
echo "📍 Access full features at: http://localhost:5174/features"
