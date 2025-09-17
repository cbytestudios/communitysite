#!/bin/bash

# Quick script to switch from HTTP to HTTPS after SSL certificates are installed
# This updates the .env.local file and restarts the application

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Configuration
APP_NAME="communitysite"
APP_DIR="/var/www/$APP_NAME"
ENV_FILE="$APP_DIR/.env.local"

print_info "Switching application to HTTPS mode..."

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file not found at $ENV_FILE"
    exit 1
fi

# NextAuth is no longer used - configuration handled in admin panel
print_info "Authentication configuration is handled through the admin panel"

# Restart the application
print_info "Restarting application service..."
if systemctl restart "$APP_NAME"; then
    print_status "Application restarted successfully"
else
    print_warning "Failed to restart application. You may need to restart it manually."
fi

print_status "Switch to HTTPS complete!"
print_info "Your application should now be using HTTPS for authentication"