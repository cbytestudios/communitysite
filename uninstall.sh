#!/bin/bash

# Community Website - Uninstall Script
# This script removes all installations of the community website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

print_step() {
    echo -e "${CYAN}📋 $1${NC}"
}

# Function to prompt for yes/no
prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    
    while true; do
        if [ "$default" = "y" ]; then
            echo -e "${CYAN}$prompt${NC} ${YELLOW}(Y/n)${NC}: "
        else
            echo -e "${CYAN}$prompt${NC} ${YELLOW}(y/N)${NC}: "
        fi
        
        read -r yn
        
        if [ -z "$yn" ]; then
            yn="$default"
        fi
        
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Function to detect existing installations
detect_existing_installation() {
    EXISTING_APPS=()
    
    # Check for existing installations in /var/www
    if [ -d "/var/www" ]; then
        for dir in /var/www/*/; do
            if [ -d "$dir" ] && [ -f "$dir/package.json" ] && [ -f "$dir/.env.local" ]; then
                app_name=$(basename "$dir")
                # Skip if it's just the .npm-global directory
                if [ "$app_name" != ".npm-global" ] && [ "$app_name" != "html" ]; then
                    EXISTING_APPS+=("$app_name")
                fi
            fi
        done
    fi
    
    # Check PM2 processes
    if command -v pm2 >/dev/null 2>&1; then
        PM2_APPS=$(sudo -u www-data pm2 list 2>/dev/null | grep -E "communitysite|redm|fivem" | awk '{print $2}' | tr -d '│' | xargs)
        if [ -n "$PM2_APPS" ]; then
            for app in $PM2_APPS; do
                if [[ ! " ${EXISTING_APPS[@]} " =~ " ${app} " ]]; then
                    EXISTING_APPS+=("$app")
                fi
            done
        fi
    fi
    
    if [ ${#EXISTING_APPS[@]} -gt 0 ]; then
        return 0  # Found existing installations
    else
        return 1  # No existing installations
    fi
}

# Function to uninstall existing installation
uninstall_existing() {
    local app_to_remove="$1"
    
    print_step "Removing installation: $app_to_remove"
    
    # Stop PM2 process
    if command -v pm2 >/dev/null 2>&1; then
        print_info "Stopping PM2 process..."
        sudo -u www-data pm2 stop "$app_to_remove" 2>/dev/null || true
        sudo -u www-data pm2 delete "$app_to_remove" 2>/dev/null || true
        sudo -u www-data pm2 save 2>/dev/null || true
    fi
    
    # Remove Nginx configuration
    if [ -f "/etc/nginx/sites-available/$app_to_remove" ]; then
        print_info "Removing Nginx configuration..."
        rm -f "/etc/nginx/sites-available/$app_to_remove"
        rm -f "/etc/nginx/sites-enabled/$app_to_remove"
        systemctl reload nginx 2>/dev/null || true
    fi
    
    # Remove SSL certificates (ask user first)
    if [ -d "/etc/letsencrypt/live" ]; then
        for cert_dir in /etc/letsencrypt/live/*/; do
            if [ -d "$cert_dir" ]; then
                domain=$(basename "$cert_dir")
                if prompt_yes_no "Remove SSL certificate for $domain?" "n"; then
                    print_info "Removing SSL certificate for $domain..."
                    certbot delete --cert-name "$domain" --non-interactive 2>/dev/null || true
                fi
            fi
        done
    fi
    
    # Remove application directory
    if [ -d "/var/www/$app_to_remove" ]; then
        print_info "Removing application directory..."
        rm -rf "/var/www/$app_to_remove"
    fi
    
    # Remove log directory
    if [ -d "/var/log/$app_to_remove" ]; then
        print_info "Removing log directory..."
        rm -rf "/var/log/$app_to_remove"
    fi
    
    # Remove cron jobs
    print_info "Removing cron jobs..."
    crontab -l 2>/dev/null | grep -v "$app_to_remove" | crontab - 2>/dev/null || true
    
    print_status "Installation '$app_to_remove' removed successfully"
}

# Function to remove system packages (optional)
remove_system_packages() {
    if prompt_yes_no "Remove system packages (Node.js, Nginx, PM2, etc.)?" "n"; then
        print_step "Removing system packages..."
        
        # Stop services first
        systemctl stop nginx 2>/dev/null || true
        systemctl disable nginx 2>/dev/null || true
        
        # Remove PM2 startup
        sudo -u www-data pm2 unstartup systemd 2>/dev/null || true
        
        # Remove packages based on OS
        if command -v apt >/dev/null 2>&1; then
            print_info "Removing packages (Ubuntu/Debian)..."
            apt remove --purge -y nodejs npm nginx certbot python3-certbot-nginx 2>/dev/null || true
            apt autoremove -y 2>/dev/null || true
        elif command -v yum >/dev/null 2>&1; then
            print_info "Removing packages (CentOS/RHEL)..."
            yum remove -y nodejs npm nginx certbot python3-certbot-nginx 2>/dev/null || true
        elif command -v dnf >/dev/null 2>&1; then
            print_info "Removing packages (Fedora)..."
            dnf remove -y nodejs npm nginx certbot python3-certbot-nginx 2>/dev/null || true
        elif command -v pacman >/dev/null 2>&1; then
            print_info "Removing packages (Arch Linux)..."
            pacman -Rs --noconfirm nodejs npm nginx certbot certbot-nginx 2>/dev/null || true
        fi
        
        # Remove Node.js repository
        if [ -f "/etc/apt/sources.list.d/nodesource.list" ]; then
            rm -f /etc/apt/sources.list.d/nodesource.list
        fi
        
        print_status "System packages removed"
    else
        print_info "Keeping system packages (Node.js, Nginx, etc.)"
    fi
}

# Function to clean up remaining files
cleanup_remaining() {
    print_step "Cleaning up remaining files..."
    
    # Remove www-data npm configuration
    if [ -d "/var/www/.npm-global" ]; then
        print_info "Removing npm global directory..."
        rm -rf /var/www/.npm-global
    fi
    
    if [ -d "/var/www/.npm" ]; then
        print_info "Removing npm cache directory..."
        rm -rf /var/www/.npm
    fi
    
    if [ -f "/var/www/.bashrc" ]; then
        print_info "Removing www-data bashrc..."
        rm -f /var/www/.bashrc
    fi
    
    # Remove firewall rules (ask first)
    if prompt_yes_no "Remove firewall rules for HTTP/HTTPS?" "y"; then
        if command -v ufw >/dev/null 2>&1; then
            print_info "Removing UFW rules..."
            ufw delete allow 'Nginx Full' 2>/dev/null || true
            ufw delete allow 'Nginx HTTP' 2>/dev/null || true
            ufw delete allow 'Nginx HTTPS' 2>/dev/null || true
        elif command -v firewall-cmd >/dev/null 2>&1; then
            print_info "Removing firewalld rules..."
            firewall-cmd --permanent --remove-service=http 2>/dev/null || true
            firewall-cmd --permanent --remove-service=https 2>/dev/null || true
            firewall-cmd --reload 2>/dev/null || true
        fi
    fi
    
    print_status "Cleanup completed"
}

# Main uninstall function
main() {
    print_header "Community Website Uninstaller"
    echo ""
    print_warning "This will remove all community website installations from this server."
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # Detect existing installations
    if ! detect_existing_installation; then
        print_info "No community website installations found."
        exit 0
    fi
    
    print_info "Found the following installations:"
    for app in "${EXISTING_APPS[@]}"; do
        echo "  - $app"
        if [ -d "/var/www/$app" ]; then
            echo "    Location: /var/www/$app"
        fi
        if sudo -u www-data pm2 list 2>/dev/null | grep -q "$app"; then
            echo "    Status: Running in PM2"
        fi
    done
    
    echo ""
    if ! prompt_yes_no "Are you sure you want to remove all installations?" "n"; then
        print_info "Uninstall cancelled."
        exit 0
    fi
    
    echo ""
    print_step "Starting uninstall process..."
    
    # Remove each installation
    for app in "${EXISTING_APPS[@]}"; do
        uninstall_existing "$app"
    done
    
    # Clean up remaining files
    cleanup_remaining
    
    # Optionally remove system packages
    echo ""
    remove_system_packages
    
    echo ""
    print_status "Uninstall completed successfully! 🎉"
    print_info "All community website installations have been removed."
    
    if systemctl is-active --quiet nginx 2>/dev/null; then
        print_info "Nginx is still running (may be used by other applications)"
    fi
}

# Run main function
main "$@"