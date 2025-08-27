#!/bin/bash

set -e

echo "🔍 Testing Coolify Access with GitHub Secrets/Variables..."
echo "=================================================="

# No longer need GitHub CLI since we're using .env files

echo "📥 Loading configuration from .env file..."

# Load environment variables from .env file
if [ -f ".env" ]; then
    echo "Loading from .env..."
    set -a  # Automatically export variables
    source .env
    set +a  # Stop auto-export
else
    echo "❌ No .env file found"
    echo "Please create .env with Coolify configuration"
    echo "See .env.example for template"
    exit 1
fi

# Validate required variables
echo "Validating configuration..."
if [ -z "$COOLIFY_API_TOKEN" ]; then
    echo "❌ COOLIFY_API_TOKEN not set in .env"
    exit 1
fi

if [ -z "$COOLIFY_SERVER_UUID" ]; then
    echo "❌ COOLIFY_SERVER_UUID not set in .env"
    exit 1
fi

if [ -z "$COOLIFY_API_URL" ]; then
    echo "❌ COOLIFY_API_URL not set in .env"
    exit 1
fi

# Set defaults for optional variables
COOLIFY_PROJECT_NAME=${COOLIFY_PROJECT_NAME:-"14kb"}
COOLIFY_API_PREFIX=${COOLIFY_API_PREFIX:-"14kb-api"}
COOLIFY_WEB_PREFIX=${COOLIFY_WEB_PREFIX:-"14kb"}

echo "✅ All secrets and variables retrieved successfully!"
echo ""

# Display configuration (without sensitive data)
echo "🔧 Configuration:"
echo "- API URL: https://$COOLIFY_API_URL"
echo "- API Domain: $COOLIFY_API_PREFIX.$COOLIFY_API_URL" 
echo "- Web Domain: $COOLIFY_WEB_PREFIX.$COOLIFY_API_URL"
echo "- Project: $COOLIFY_PROJECT_NAME"
echo "- Server UUID: ${COOLIFY_SERVER_UUID:0:8}..."
echo ""

# Test 1: Basic API connectivity
echo "🌐 Test 1: Testing basic API connectivity..."
if curl -f -s -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
        "https://$COOLIFY_API_URL/api/v1/servers" > /dev/null; then
    echo "✅ API connectivity test passed"
else
    echo "❌ API connectivity test failed"
    echo "Check if:"
    echo "  - Coolify server is running"
    echo "  - API token is valid"
    echo "  - URL is correct"
    exit 1
fi

# Test 2: Server access
echo ""
echo "🖥️  Test 2: Testing server access..."
SERVER_RESPONSE=$(curl -s -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
                       "https://$COOLIFY_API_URL/api/v1/servers")

if echo "$SERVER_RESPONSE" | grep -q "$COOLIFY_SERVER_UUID"; then
    echo "✅ Server UUID found in response"
else
    echo "❌ Server UUID not found in response"
    echo "Response: $SERVER_RESPONSE"
    exit 1
fi

# Test 3: Project endpoints
echo ""
echo "📁 Test 3: Testing project endpoints..."
if curl -f -s -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
        "https://$COOLIFY_API_URL/api/v1/projects" > /dev/null; then
    echo "✅ Projects endpoint accessible"
else
    echo "⚠️  Projects endpoint test failed (may not exist yet)"
fi

# Test 4: Deployment endpoint availability
echo ""
echo "🚀 Test 4: Testing deployment endpoint availability..."
DEPLOY_RESPONSE=$(curl -s -X OPTIONS -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
                       "https://$COOLIFY_API_URL/api/v1/deploy" -w "%{http_code}")

if [[ "$DEPLOY_RESPONSE" =~ 200|405 ]]; then
    echo "✅ Deployment endpoint is reachable"
else
    echo "⚠️  Deployment endpoint test inconclusive (response: $DEPLOY_RESPONSE)"
fi

# Test 5: Container registry access
echo ""
echo "📦 Test 5: Testing container registry access..."
if docker pull ghcr.io/knightkill/14kb-api:latest > /dev/null 2>&1; then
    echo "✅ Can pull API container from ghcr.io"
else
    echo "⚠️  Cannot pull API container (may not exist yet)"
fi

if docker pull ghcr.io/knightkill/14kb-ui:latest > /dev/null 2>&1; then
    echo "✅ Can pull UI container from ghcr.io"  
else
    echo "⚠️  Cannot pull UI container (may not exist yet)"
fi

echo ""
echo "🎉 Coolify access validation completed!"
echo "✅ All critical tests passed - deployment should work"
echo ""
echo "Next steps:"
echo "1. Commit your changes"
echo "2. Create a PR and merge to main"
echo "3. Watch the automatic deployment to:"
echo "   - API: https://$COOLIFY_API_PREFIX.$COOLIFY_API_URL"
echo "   - UI:  https://$COOLIFY_WEB_PREFIX.$COOLIFY_API_URL"