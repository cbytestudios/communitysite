#!/bin/bash

# Community Website Installation Script
# One-command installation for Linux servers with interactive configuration
#
# Installation Modes:
# 1. Local Installation: Run from project directory - uses local files
# 2. Remote Installation: Download from your host - for clean server deployments
#
# Usage:
#   Local:  ./install.sh (from project directory)
#   Remote: bash <(curl -fsSL https://codebyte.studio/sites/install.sh)

set -e

# Check if running interactively
INTERACTIVE=true
if [ ! -t 0 ]; then
    INTERACTIVE=false
    echo "⚠️  Running in non-interactive mode - using defaults"
    echo "ℹ️  For interactive setup, use: bash <(curl -fsSL https://codebyte.studio/sites/install.sh)"
    echo ""
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;36m'    # Bright cyan for better visibility
PURPLE='\033[1;35m'  # Bright purple
CYAN='\033[1;36m'    # Bright cyan for better visibility
NC='\033[0m' # No Color

# Default values
DEFAULT_APP_NAME="communitysite"
DEFAULT_PORT="3000"

# Global variables
APP_NAME=""
APP_PORT=""
APP_DIR=""
DOMAIN=""
ADMIN_EMAIL=""
SETUP_SSL=false
OS_TYPE=""
DISTRO=""

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

# Function to prompt for user input
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local input
    
    # If not interactive, use default
    if [ "$INTERACTIVE" = false ]; then
        if [ -n "$default" ]; then
            input="$default"
            echo "${CYAN}$prompt${NC}: ${YELLOW}$default${NC} (auto-selected)"
        else
            echo "${CYAN}$prompt${NC}: ${RED}(no default available)${NC}"
            input=""
        fi
        eval "$var_name='$input'"
        return
    fi
    
    # Interactive mode
    while true; do
        if [ -n "$default" ]; then
            echo -n -e "${CYAN}$prompt${NC} ${YELLOW}(default: $default)${NC}: " >&2
        else
            echo -n -e "${CYAN}$prompt${NC}: " >&2
        fi
        
        # Read from terminal
        if [ -c /dev/tty ]; then
            read -r input < /dev/tty
        else
            read -r input
        fi
        
        # Use default if empty
        if [ -z "$input" ] && [ -n "$default" ]; then
            input="$default"
        fi
        
        # Break if we got input or no default required
        if [ -n "$input" ] || [ -z "$default" ]; then
            break
        fi
    done
    
    eval "$var_name='$input'"
}

# Function to prompt for yes/no
prompt_yes_no() {
    local prompt="$1"
    local default="$2"
    local yn
    
    # If not interactive, use default
    if [ "$INTERACTIVE" = false ]; then
        yn="$default"
        if [ "$default" = "y" ]; then
            echo "${CYAN}$prompt${NC}: ${YELLOW}Yes${NC} (auto-selected)"
            return 0
        else
            echo "${CYAN}$prompt${NC}: ${YELLOW}No${NC} (auto-selected)"
            return 1
        fi
    fi
    
    # Interactive mode
    while true; do
        if [ "$default" = "y" ]; then
            echo -n -e "${CYAN}$prompt${NC} ${YELLOW}(Y/n)${NC}: " >&2
        else
            echo -n -e "${CYAN}$prompt${NC} ${YELLOW}(y/N)${NC}: " >&2
        fi
        
        # Read from terminal
        if [ -c /dev/tty ]; then
            read -r yn < /dev/tty
        else
            read -r yn
        fi
        
        if [ -z "$yn" ]; then
            yn="$default"
        fi
        
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no." >&2;;
        esac
    done
}

# Function to detect OS and distribution
detect_os() {
    print_step "Detecting operating system..."
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_TYPE=$ID
        DISTRO=$NAME
    elif type lsb_release >/dev/null 2>&1; then
        OS_TYPE=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
        DISTRO=$(lsb_release -sd)
    else
        OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]')
        DISTRO="Unknown"
    fi
    
    print_info "Detected: $DISTRO"
    
    # Normalize OS type
    case $OS_TYPE in
        ubuntu|debian)
            OS_TYPE="debian"
            ;;
        centos|rhel|rocky|almalinux|fedora)
            OS_TYPE="redhat"
            ;;
        arch|manjaro)
            OS_TYPE="arch"
            ;;
        *)
            print_warning "Unsupported OS: $OS_TYPE"
            print_info "Supported: Ubuntu, Debian, CentOS, RHEL, Rocky Linux, Fedora, Arch Linux"
            if ! prompt_yes_no "Continue anyway?" "n"; then
                exit 1
            fi
            ;;
    esac
}

# Function to install system packages
install_system_packages() {
    print_step "Installing system packages..."
    
    case $OS_TYPE in
        debian)
            print_info "Installing packages for Debian/Ubuntu..."
            apt update
            apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
            
            # Install Node.js 18
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt install -y nodejs
            
            # Install other packages
            apt install -y nginx git ufw certbot python3-certbot-nginx build-essential dnsutils openssl unzip
            ;;
            
        redhat)
            print_info "Installing packages for RedHat/CentOS/Fedora..."
            
            if command -v dnf >/dev/null 2>&1; then
                PKG_MANAGER="dnf"
            else
                PKG_MANAGER="yum"
            fi
            
            $PKG_MANAGER update -y
            $PKG_MANAGER install -y curl wget gnupg2
            
            # Install Node.js 18
            curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
            $PKG_MANAGER install -y nodejs
            
            # Install other packages
            $PKG_MANAGER install -y nginx git firewalld certbot python3-certbot-nginx gcc-c++ make bind-utils openssl unzip
            ;;
            
        arch)
            print_info "Installing packages for Arch Linux..."
            pacman -Syu --noconfirm
            pacman -S --noconfirm nodejs npm nginx git ufw certbot certbot-nginx base-devel bind openssl unzip
            ;;
            
        *)
            print_error "Package installation not supported for $OS_TYPE"
            print_info "Please install manually: nodejs (18+), npm, nginx, git, certbot"
            if ! prompt_yes_no "Continue anyway?" "n"; then
                exit 1
            fi
            ;;
    esac
    
    # Verify Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version $NODE_VERSION is too old. Need 18+"
        exit 1
    fi
    
    print_status "System packages installed successfully"
    print_info "Node.js version: $(node --version)"
    print_info "npm version: $(npm --version)"
}

# Function to collect all configuration from user
collect_configuration() {
    collect_all_config
    
    # Skip confirmation in non-interactive mode
    if [ "$INTERACTIVE" = false ]; then
        display_config_summary
        return
    fi
    
    # Interactive confirmation loop
    while true; do
        display_config_summary
        
        if prompt_yes_no "Is all configuration correct?" "y"; then
            break
        else
            modify_configuration
        fi
    done
}

# Function to collect all configuration
collect_all_config() {
    print_header "Configuration Setup"
    
    echo ""
    print_info "Let's configure your community website installation."
    print_info "You'll be prompted for all required settings."
    echo ""
    
    # Basic application configuration
    print_step "Basic Application Settings"
    prompt_input "Application name" "$DEFAULT_APP_NAME" "APP_NAME"
    prompt_input "Application port" "$DEFAULT_PORT" "APP_PORT"
    
    # Derived paths
    APP_DIR="/var/www/$APP_NAME"
    
    # SSL Configuration
    echo ""
    print_step "SSL Certificate Setup (recommended for production)"
    
    # In non-interactive mode, skip SSL setup
    if [ "$INTERACTIVE" = false ]; then
        SETUP_SSL=false
        print_info "SSL setup skipped in non-interactive mode"
        print_info "You can set up SSL later using: sudo certbot --nginx"
    elif prompt_yes_no "Would you like to set up SSL with Let's Encrypt?" "n"; then
        SETUP_SSL=true
        prompt_input "Domain name (without www, e.g., example.com)" "" "DOMAIN"
        prompt_input "Admin email for SSL certificate" "" "ADMIN_EMAIL"
        
        if [ -z "$DOMAIN" ] || [ -z "$ADMIN_EMAIL" ]; then
            print_error "Domain and email are required for SSL setup"
            exit 1
        fi
        
        # Validate DNS immediately after domain entry
        print_info "Checking DNS configuration for $DOMAIN..."
        validate_dns_with_retry
        
        # SSL will be configured for domain
        echo "SSL will be configured for: $DOMAIN"
    else
        SETUP_SSL=false
        echo "Running in HTTP mode on port: $APP_PORT"
    fi
    
    # Database Configuration: using SQLite (no external DB required)
    print_info "Using SQLite database (Prisma) — no DB credentials required."
    
    # All other configurations (Discord, Email, Game Servers) are handled through the admin panel
    echo ""
    print_info "✨ Additional configurations (Discord, Email, Game Servers) will be available in the admin panel after installation."
}

# Function to display configuration summary
display_config_summary() {
    echo ""
    print_header "Configuration Summary"
    echo ""
    
    print_info "📋 Application Settings:"
    echo "  1. App Name: $APP_NAME"
    echo "  2. App Port: $APP_PORT"
    echo "  3. App Directory: $APP_DIR"
    
    echo ""
    print_info "🌐 SSL & Domain:"
    if [ "$SETUP_SSL" = true ]; then
        echo "  4. SSL: Enabled"
        echo "  5. Domain: $DOMAIN"
        echo "  6. Admin Email: $ADMIN_EMAIL"
    else
        echo "  4. SSL: Disabled"
        echo "  5. Domain: Not configured"
        echo "  6. Admin Email: Not configured"
    fi
    
    echo ""
    print_info "🗄️ Database:"
    echo "  7. SQLite (DATABASE_URL=file:./prisma/dev.db)"
    
    echo ""
    print_info "📧 Email (SMTP) - Optional:"
    echo "  8. Configure email settings in admin panel after installation"
    
    echo ""
    print_info "🎯 Game Servers:"
    echo "  • Server Management: Available in Admin Panel after installation"
    
    echo ""
}

# Function to modify specific configuration items
modify_configuration() {
    echo ""
    print_info "Which setting would you like to change?"
    print_info "Enter the number (1-7) or 'done' to finish:"
    
    while true; do
        read -p "Setting to change (1-7 or 'done'): " choice
        
        case $choice in
            1) prompt_input "Application name" "$APP_NAME" "APP_NAME"; APP_DIR="/var/www/$APP_NAME" ;;
            2) prompt_input "Application port" "$APP_PORT" "APP_PORT" ;;
            3) print_info "App directory is automatically set based on app name" ;;
            4) 
                if prompt_yes_no "Enable SSL?" "$SETUP_SSL"; then
                    SETUP_SSL=true
                    if [ -z "$DOMAIN" ]; then
                        prompt_input "Domain name" "" "DOMAIN"
                    fi
                    if [ -z "$ADMIN_EMAIL" ]; then
                        prompt_input "Admin email" "" "ADMIN_EMAIL"
                    fi
                else
                    SETUP_SSL=false
                fi
                ;;
            5) prompt_input "Domain name" "$DOMAIN" "DOMAIN" ;;
            6) prompt_input "Admin email" "$ADMIN_EMAIL" "ADMIN_EMAIL" ;;
            7) print_info "Using SQLite; no DB configuration required." ;;
            done|DONE) break ;;
            *) print_error "Invalid choice. Enter 1-7 or 'done'" ;;
        esac
        
        echo ""
        print_info "Setting updated. Enter another number or 'done' to finish:"
    done
}

# Function to setup application user and directories
setup_application_environment() {
    print_step "Setting up application environment..."
    
    # Create application directory
    mkdir -p "$APP_DIR"
    
    # Ensure www-data user exists and has proper setup
    if ! id "www-data" &>/dev/null; then
        useradd -r -s /bin/bash -d /var/www -m www-data
    fi
    
    # Create www-data home directory if it doesn't exist
    if [ ! -d "/var/www" ]; then
        mkdir -p /var/www
        chown www-data:www-data /var/www
    fi
    
    # Fix all npm-related permission issues first
    print_info "Fixing npm permissions..."
    
    # Remove any existing npm config files that might have wrong permissions
    rm -f /var/www/.npmrc 2>/dev/null || true
    
    # Fix root-owned npm cache if it exists
    if [ -d "/root/.npm" ]; then
        print_info "Moving root npm cache to www-data..."
        if [ -d "/var/www/.npm" ]; then
            rm -rf /var/www/.npm
        fi
        mv /root/.npm /var/www/.npm 2>/dev/null || cp -r /root/.npm /var/www/.npm 2>/dev/null || mkdir -p /var/www/.npm
        chown -R www-data:www-data /var/www/.npm
    else
        mkdir -p /var/www/.npm
        chown -R www-data:www-data /var/www/.npm
    fi
    
    # Set up npm environment for www-data
    mkdir -p /var/www/.npm-global
    chown -R www-data:www-data /var/www/.npm-global
    
    # Ensure www-data owns its home directory completely
    chown -R www-data:www-data /var/www
    
    # Create .bashrc for www-data with PATH
    echo 'export PATH="/var/www/.npm-global/bin:$PATH"' > /var/www/.bashrc
    chown www-data:www-data /var/www/.bashrc
    
    # Configure npm for www-data user (with proper environment)
    print_info "Configuring npm for www-data user..."
    if ! sudo -u www-data bash -c "
        export HOME=/var/www
        npm config set prefix '/var/www/.npm-global' 2>/dev/null
        npm config set cache '/var/www/.npm' 2>/dev/null
    "; then
        print_warning "npm configuration had some issues, but continuing..."
        print_info "This may be resolved during the application deployment step"
    fi
    
    print_status "Application environment configured"
}

# Function to install PM2
install_pm2() {
    print_step "Installing PM2 process manager..."
    
    # Ensure npm cache is properly owned before installing PM2
    chown -R www-data:www-data /var/www/.npm 2>/dev/null || true
    chown -R www-data:www-data /var/www/.npm-global 2>/dev/null || true
    
    # Install PM2 globally for www-data user
    print_info "Installing PM2 globally..."
    if ! sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && npm install -g pm2'; then
        print_warning "PM2 installation had issues, trying alternative method..."
        # Try installing as root and then fixing permissions
        npm install -g pm2
        # Create symlink for www-data
        mkdir -p /var/www/.npm-global/bin
        ln -sf /usr/local/bin/pm2 /var/www/.npm-global/bin/pm2 2>/dev/null || true
        chown -R www-data:www-data /var/www/.npm-global
    fi
    
    print_status "PM2 installed successfully"
}

# Function to deploy application
deploy_application() {
    print_step "Deploying application files..."

    # Stop any existing services
    print_info "Stopping existing services..."
    systemctl stop nginx 2>/dev/null || true
    if systemctl is-active --quiet "$APP_NAME" 2>/dev/null; then
        systemctl stop "$APP_NAME"
    fi
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 stop $APP_NAME" 2>/dev/null || true

    # Create app directory
    mkdir -p "$APP_DIR"

    # Pull from hosted ZIP
    print_info "Downloading latest project ZIP from codebyte.studio..."
    cd /tmp
    curl -fL -o /tmp/communitysite.zip https://codebyte.studio/sites/communitysite.zip

    print_info "Extracting ZIP file..."
    rm -rf /tmp/communitysite_extracted
    mkdir -p /tmp/communitysite_extracted
    unzip -oq /tmp/communitysite.zip -d /tmp/communitysite_extracted

    rm -f /tmp/communitysite.zip

    # Move extracted files to target
    rm -rf "$APP_DIR"
    if [ -d /tmp/communitysite_extracted/communitysite-main ]; then
        mv /tmp/communitysite_extracted/communitysite-main "$APP_DIR"
    elif [ -d /tmp/communitysite_extracted/communitysite ]; then
        mv /tmp/communitysite_extracted/communitysite "$APP_DIR"
    else
        mkdir -p "$APP_DIR"
        shopt -s dotglob
        mv /tmp/communitysite_extracted/* "$APP_DIR" || true
        shopt -u dotglob
    fi

    rm -rf /tmp/communitysite_extracted

    chown -R www-data:www-data "$APP_DIR"

    # Setup environment configuration before building
    print_info "Setting up environment configuration..."
    cat > "$APP_DIR/.env" << EOF
# Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret for authentication
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

# Site URL for email links
SITE_URL=$(if [ "$SETUP_SSL" = true ]; then echo "https://$DOMAIN"; else echo "http://localhost:$APP_PORT"; fi)
EOF

    # Set permissions
    chown www-data:www-data "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
    print_info "Environment configuration created: $APP_DIR/.env"

    # Install dependencies
    print_info "Installing npm dependencies..."
    cd "$APP_DIR"
    chown -R www-data:www-data "$APP_DIR"
    chown -R www-data:www-data /var/www/.npm 2>/dev/null || true

    if ! sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && npm install --include=dev'; then
        print_warning "npm install had permission issues, trying to fix..."
        chown -R www-data:www-data /var/www
        sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && npm install --include=dev --cache /var/www/.npm'
    fi

    # Prisma generate and migrate (SQLite)
    if [ -f "$APP_DIR/prisma/schema.prisma" ]; then
      print_info "Generating Prisma client..."
      sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && node ./node_modules/prisma/build/index.js generate'
      print_info "Running Prisma migrations..."
      sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && node ./node_modules/prisma/build/index.js migrate deploy'
    fi

    # Build app
    print_info "Building application (dev deps included for build)..."
    # Avoid shell shim; call Next via Node to prevent noexec issues
    sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && node ./node_modules/next/dist/bin/next build'

    # Prune dev dependencies for production runtime
    print_info "Pruning devDependencies for production runtime..."
    sudo -u www-data bash -c 'export HOME=/var/www && export PATH="/var/www/.npm-global/bin:$PATH" && npm prune --omit=dev'

    print_status "Application deployed successfully"
}

# Function to setup environment configuration
# NOTE: This function is now integrated into deploy_application() 
# and called before the build step to ensure .env.local exists during build
setup_environment_config() {
    print_step "Setting up environment configuration..."
    
    # Ensure app directory exists
    mkdir -p "$APP_DIR"
    
    # Create .env.local with minimal configuration
    cat > "$APP_DIR/.env.local" << EOF
# Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret for authentication
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

# Site URL for email links
SITE_URL=$(if [ "$SETUP_SSL" = true ]; then echo "https://$DOMAIN"; else echo "http://localhost:$APP_PORT"; fi)
EOF
    
    # Set proper ownership and permissions
    chown www-data:www-data "$APP_DIR/.env.local"
    chmod 600 "$APP_DIR/.env.local"
    
    print_status "Environment configuration file created successfully"
    print_info "Configuration saved to: $APP_DIR/.env.local"
    print_info "File permissions set to 600 (secure)"
}

# Function to configure Nginx
configure_nginx() {
    print_step "Configuring Nginx..."
    
    # Create Nginx configuration
    NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
    
    if [ "$SETUP_SSL" = true ]; then
        # Start with HTTP-only configuration for SSL domain
        # Certbot will modify this to add SSL configuration
        # Check if www subdomain should be included
        if dig +short "www.$DOMAIN" >/dev/null 2>&1 && [ -n "$(dig +short "www.$DOMAIN")" ]; then
            SERVER_NAMES="$DOMAIN www.$DOMAIN"
        else
            SERVER_NAMES="$DOMAIN"
        fi
        
        cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $SERVER_NAMES;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /favicon.ico {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    else
        # HTTP only configuration
        cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name localhost;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /favicon.ico {
        proxy_pass http://localhost:$APP_PORT;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
    fi
    
    # Enable site
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$APP_NAME"
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if nginx -t; then
        print_status "Nginx configuration is valid"
    else
        print_error "Nginx configuration is invalid"
        exit 1
    fi
}

# Function to setup PM2 configuration
setup_pm2_config() {
    print_step "Setting up PM2 configuration..."
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT
    },
    error_file: '/var/log/$APP_NAME/error.log',
    out_file: '/var/log/$APP_NAME/out.log',
    log_file: '/var/log/$APP_NAME/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF
    
    # Create log directory
    mkdir -p "/var/log/$APP_NAME"
    chown www-data:www-data "/var/log/$APP_NAME"
    
    print_status "PM2 configuration created"
}

# Function to configure firewall
configure_firewall() {
    print_step "Configuring firewall..."
    
    case $OS_TYPE in
        debian|arch)
            if command -v ufw >/dev/null 2>&1; then
                ufw --force enable
                ufw allow ssh
                ufw allow 'Nginx Full'
                ufw allow 80
                ufw allow 443
                print_status "UFW firewall configured"
            else
                print_warning "UFW not available. Please configure firewall manually."
            fi
            ;;
            
        redhat)
            if command -v firewall-cmd >/dev/null 2>&1; then
                systemctl enable firewalld
                systemctl start firewalld
                firewall-cmd --permanent --add-service=ssh
                firewall-cmd --permanent --add-service=http
                firewall-cmd --permanent --add-service=https
                firewall-cmd --reload
                print_status "Firewalld configured"
            else
                print_warning "Firewalld not available. Please configure firewall manually."
            fi
            ;;
    esac
}

# Function to validate DNS with retry and stop installation if needed
validate_dns_with_retry() {
    while true; do
        # Get server's public IP
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
        
        if [ -z "$SERVER_IP" ]; then
            print_warning "Could not determine server's public IP address"
            print_info "Please ensure your domain $DOMAIN points to this server before SSL setup"
            return
        fi
        
        print_info "Server IP: $SERVER_IP"
        
        # Check if domain resolves to this server
        print_info "Checking DNS resolution..."
        DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | tail -n1)
        
        if [ -z "$DOMAIN_IP" ]; then
            print_warning "Domain $DOMAIN does not resolve to any IP address"
            print_info "Please configure this DNS record with your domain provider:"
            print_info "  A record: $DOMAIN -> $SERVER_IP"
            print_info "  A record: www.$DOMAIN -> $SERVER_IP"
            print_info "DNS changes can take 5-60 minutes to propagate."
            echo ""
            
            if prompt_yes_no "Try DNS validation again?" "y"; then
                print_info "Waiting 10 seconds before retry..."
                sleep 10
                continue
            else
                print_error "DNS validation failed. Installation cannot continue without proper DNS configuration."
                exit 1
            fi
        elif [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
            print_warning "⚠️  Domain $DOMAIN resolves to $DOMAIN_IP but server IP is $SERVER_IP"
            print_info "Please update your DNS records:"
            print_info "  📍 A record: $DOMAIN -> $SERVER_IP"
            print_info "  📍 A record: www.$DOMAIN -> $SERVER_IP"
            print_info "DNS changes can take 5-60 minutes to propagate."
            echo ""
            
            if prompt_yes_no "Try DNS validation again?" "y"; then
                print_info "Waiting 30 seconds before retry..."
                sleep 30
                continue
            else
                print_error "DNS validation failed. Installation cannot continue without proper DNS configuration."
                print_error "Please update your DNS records and run the installer again."
                exit 1
            fi
        else
            print_status "Domain $DOMAIN correctly resolves to $SERVER_IP"
            print_info "DNS configuration verified!"
            echo ""
            break
        fi
    done
}

# Function to validate MongoDB connection
validate_mongodb_connection() {
    print_step "Validating MongoDB connection..."
    
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        print_warning "Node.js not found. Skipping database validation for now."
        print_info "Database connection will be validated during application deployment."
        return 0
    fi
    
    # Create a temporary Node.js script to test the connection
    local test_script="/tmp/mongodb_test.js"
    cat > "$test_script" << 'EOF'
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = process.argv[2];
    if (!uri) {
        console.error('No MongoDB URI provided');
        process.exit(1);
    }
    
    let client;
    try {
        console.log('🔄 Connecting to MongoDB...');
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            connectTimeoutMS: 10000,
        });
        
        await client.connect();
        console.log('✅ Successfully connected to MongoDB');
        
        // Test basic operations
        const db = client.db();
        const collections = await db.listCollections().toArray();
        console.log(`📊 Database accessible, found ${collections.length} collections`);
        
        // Test write permissions
        const testCollection = db.collection('connection_test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        await testCollection.deleteOne({ test: true });
        console.log('✅ Database write permissions confirmed');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ MongoDB connection failed:');
        if (error.message.includes('authentication failed')) {
            console.error('   Authentication failed - check username/password');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.error('   Cannot reach database server - check host/port');
        } else if (error.message.includes('timeout')) {
            console.error('   Connection timeout - check network/firewall');
        } else {
            console.error('   ' + error.message);
        }
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

testConnection();
EOF
    
    # Install mongodb package temporarily for testing
    print_info "Skipping MongoDB client installation — using SQLite."
    return 0
}

# Function to collect and validate database configuration
collect_and_validate_database_config() {
    print_info "Database Configuration: using SQLite via Prisma. No action required."
    MONGODB_URI=""
    return 0
}

# Function to perform final database validation after Node.js is installed
validate_database_connection_final() {
    print_info "Skipping final database validation — using SQLite."
    return 0
}

# Function to validate DNS before SSL setup
validate_dns() {
    if [ "$SETUP_SSL" = true ]; then
        while true; do
            print_step "Validating DNS configuration..."
            
            # Get server's public IP
            SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
            
            if [ -z "$SERVER_IP" ]; then
                print_warning "❌ Could not determine server's public IP address"
                print_info "Please ensure your domain $DOMAIN points to this server"
                if ! prompt_yes_no "Continue with SSL setup anyway?" "n"; then
                    print_info "Skipping SSL setup. You can set it up manually later."
                    SETUP_SSL=false
                    return
                fi
                break
            else
                print_info "🌐 Server IP: $SERVER_IP"
                
                # Check if domain resolves to this server
                print_info "Checking DNS resolution..."
                DOMAIN_IP=$(dig +short "$DOMAIN" 2>/dev/null | tail -n1)
                WWW_DOMAIN_IP=$(dig +short "www.$DOMAIN" 2>/dev/null | tail -n1)
                
                DNS_SUCCESS=true
                
                if [ -z "$DOMAIN_IP" ]; then
                    print_error "❌ Domain $DOMAIN does not resolve to any IP address"
                    DNS_SUCCESS=false
                elif [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
                    print_error "❌ Domain $DOMAIN resolves to $DOMAIN_IP but server IP is $SERVER_IP"
                    DNS_SUCCESS=false
                else
                    print_status "✅ Domain $DOMAIN correctly resolves to $SERVER_IP"
                fi
                
                if [ -n "$WWW_DOMAIN_IP" ] && [ "$WWW_DOMAIN_IP" != "$SERVER_IP" ]; then
                    print_warning "⚠️  www.$DOMAIN resolves to $WWW_DOMAIN_IP but server IP is $SERVER_IP"
                    DNS_SUCCESS=false
                elif [ -n "$WWW_DOMAIN_IP" ]; then
                    print_status "✅ www.$DOMAIN correctly resolves to $SERVER_IP"
                fi
                
                if [ "$DNS_SUCCESS" = true ]; then
                    print_status "🎉 DNS validation successful! Ready for SSL setup."
                    break
                else
                    echo ""
                    print_warning "DNS configuration needs to be updated:"
                    print_info "Please configure these DNS records with your domain provider:"
                    print_info "  📍 A record: $DOMAIN -> $SERVER_IP"
                    print_info "  📍 A record: www.$DOMAIN -> $SERVER_IP"
                    echo ""
                    print_info "DNS changes can take 5-60 minutes to propagate worldwide."
                    echo ""
                    
                    echo "What would you like to do?"
                    echo "1) Try DNS validation again (recommended after updating DNS)"
                    echo "2) Continue with SSL setup anyway (may fail)"
                    echo "3) Skip SSL setup for now"
                    
                    read -p "Choose option (1-3): " dns_choice
                    
                    case $dns_choice in
                        1)
                            print_info "Retrying DNS validation in 10 seconds..."
                            sleep 10
                            continue
                            ;;
                        2)
                            print_warning "Continuing with SSL setup despite DNS issues..."
                            break
                            ;;
                        3)
                            print_info "Skipping SSL setup. You can set it up manually later with: sudo certbot --nginx"
                            SETUP_SSL=false
                            return
                            ;;
                        *)
                            print_error "Invalid choice. Please enter 1, 2, or 3."
                            continue
                            ;;
                    esac
                fi
            fi
        done
    fi
}

# Function to setup SSL certificate
setup_ssl_certificate() {
    if [ "$SETUP_SSL" = true ]; then
        print_step "Setting up SSL certificate..."
        
        # Start nginx first
        systemctl start nginx
        
        # Wait a moment for nginx to start
        sleep 2
        
        print_info "Requesting SSL certificate for $DOMAIN..."
        
        # Check if www subdomain exists
        print_info "Checking if www.$DOMAIN has DNS record..."
        if dig +short "www.$DOMAIN" >/dev/null 2>&1 && [ -n "$(dig +short "www.$DOMAIN")" ]; then
            print_info "www.$DOMAIN DNS record found, requesting certificate for both domains..."
            CERT_DOMAINS="-d $DOMAIN -d www.$DOMAIN"
        else
            print_info "www.$DOMAIN DNS record not found, requesting certificate for main domain only..."
            CERT_DOMAINS="-d $DOMAIN"
        fi
        
        if certbot --nginx $CERT_DOMAINS --non-interactive --agree-tos --email "$ADMIN_EMAIL"; then
            print_status "SSL certificate installed successfully"
            print_info "Your website is now available at: https://$DOMAIN"
            
            # Setup automatic certificate renewal
            print_info "Setting up automatic SSL certificate renewal..."
            
            # Create renewal script
            cat > "/usr/local/bin/renew-ssl-$APP_NAME.sh" << EOF
#!/bin/bash
# SSL Certificate Renewal Script for $APP_NAME
certbot renew --quiet --nginx
systemctl reload nginx
EOF
            chmod +x "/usr/local/bin/renew-ssl-$APP_NAME.sh"
            
            # Add to crontab for automatic renewal (runs twice daily)
            (crontab -l 2>/dev/null; echo "0 */12 * * * /usr/local/bin/renew-ssl-$APP_NAME.sh") | crontab -
            
            print_status "SSL auto-renewal configured (checks twice daily)"
        else
            print_warning "SSL certificate installation failed."
            print_info "This is usually due to DNS not pointing to this server yet."
            print_info "You can set it up manually later with:"
            print_info "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
            print_info "Your website is available at: http://$SERVER_IP"
        fi
    fi
}

# Function to start services
start_services() {
    print_step "Starting services..."
    
    # Start PM2 application (fallback to npm start if no ecosystem file)
    cd "$APP_DIR"
    if [ -f "$APP_DIR/ecosystem.config.js" ]; then
      sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 start ecosystem.config.js --name $APP_NAME"
    else
      # Avoid npm shim; start Next via Node directly for noexec-safety
      sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && node ./node_modules/next/dist/bin/next start -p $APP_PORT"
    fi
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 save"
    
    # Setup PM2 startup script
    print_info "Configuring PM2 auto-start..."
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 startup systemd -u www-data --hp /var/www" | grep -E '^sudo' | bash || true
    
    # Create systemd service as backup
    print_info "Creating systemd service for $APP_NAME..."
    cat > "/etc/systemd/system/$APP_NAME.service" << EOF
[Unit]
Description=$APP_NAME Community Website
After=network.target
Wants=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
Environment=PATH=/var/www/.npm-global/bin:/usr/local/bin:/usr/bin:/bin
Environment=HOME=/var/www
Environment=NODE_ENV=production
Environment=PORT=$APP_PORT
ExecStart=/usr/bin/node ./node_modules/next/dist/bin/next start -p $APP_PORT
Restart=on-failure
RestartSec=10s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start services
    systemctl daemon-reload
    systemctl enable "$APP_NAME"
    systemctl enable nginx
    systemctl start nginx
    
    # Check services
    sleep 3
    
    if sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 list" | grep -q "$APP_NAME"; then
        print_status "Application is running"
    else
        print_error "Application failed to start"
        print_info "Check logs with: sudo -u www-data pm2 logs $APP_NAME"
    fi
    
    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
    else
        print_error "Nginx failed to start"
        print_info "Check logs with: journalctl -u nginx -f"
    fi
}

# Function to setup monitoring
setup_monitoring() {
    print_step "Setting up monitoring..."
    
    # Create monitoring script
    cat > "/usr/local/bin/$APP_NAME-monitor.sh" << EOF
#!/bin/bash
# Monitoring script for $APP_NAME

APP_NAME="$APP_NAME"
LOG_FILE="/var/log/$APP_NAME/monitor.log"

# Check if PM2 process is running
if ! sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 list" | grep -q "\$APP_NAME.*online"; then
    echo "\$(date): \$APP_NAME is down, attempting restart..." >> \$LOG_FILE
    sudo -u www-data bash -c "export PATH=\"/var/www/.npm-global/bin:\$PATH\" && pm2 restart \$APP_NAME"
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "\$(date): Nginx is down, attempting restart..." >> \$LOG_FILE
    systemctl restart nginx
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 90 ]; then
    echo "\$(date): Disk usage is at \${DISK_USAGE}%" >> \$LOG_FILE
fi
EOF
    
    chmod +x "/usr/local/bin/$APP_NAME-monitor.sh"
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/$APP_NAME-monitor.sh") | crontab -
    
    print_status "Monitoring script installed"
}

# Function to validate installation
validate_installation() {
    print_step "Validating installation..."
    
    local validation_failed=false
    
    # Check if application directory exists
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application directory $APP_DIR does not exist"
        validation_failed=true
    fi
    
    # Check if .env exists and has required variables
    if [ ! -f "$APP_DIR/.env" ]; then
        print_error "Environment file $APP_DIR/.env does not exist"
        validation_failed=true
    else
        # Check for required environment variables
        local required_vars=("DATABASE_URL" "JWT_SECRET" "SITE_URL")
        for var in "${required_vars[@]}"; do
            if ! grep -q "^$var=" "$APP_DIR/.env"; then
                print_error "Required environment variable $var is missing from .env"
                validation_failed=true
            fi
        done
    fi
    
    # Check if package.json exists
    if [ ! -f "$APP_DIR/package.json" ]; then
        print_error "package.json not found in $APP_DIR"
        validation_failed=true
    fi
    
    # Check if node_modules exists (dependencies installed)
    if [ ! -d "$APP_DIR/node_modules" ]; then
        print_error "node_modules directory not found - dependencies may not be installed"
        validation_failed=true
    fi
    
    # Check if .next build directory exists
    if [ ! -d "$APP_DIR/.next" ]; then
        print_error ".next build directory not found - application may not be built"
        validation_failed=true
    fi
    
    # PM2 ecosystem config is optional (we fallback to npm start)
    if [ ! -f "$APP_DIR/ecosystem.config.js" ]; then
        print_info "PM2 ecosystem.config.js not found — using npm start with PM2."
    fi
    
    # Check if Nginx configuration exists and is valid
    if [ ! -f "/etc/nginx/sites-available/$APP_NAME" ]; then
        print_error "Nginx configuration not found"
        validation_failed=true
    else
        if ! nginx -t >/dev/null 2>&1; then
            print_error "Nginx configuration is invalid"
            validation_failed=true
        fi
    fi
    
    # Check if systemd service exists
    if [ ! -f "/etc/systemd/system/$APP_NAME.service" ]; then
        print_error "Systemd service configuration not found"
        validation_failed=true
    fi
    
    if [ "$validation_failed" = true ]; then
        print_error "Installation validation failed. Please check the errors above."
        exit 1
    else
        print_status "Installation validation passed"
    fi
}

# Function to display final information
display_completion_info() {
    print_header "Installation Complete! 🎉"
    
    echo ""
    print_status "Your community website has been successfully installed!"
    echo ""
    
    if [ "$SETUP_SSL" = true ]; then
        print_info "🌐 Your website is available at:"
        echo "   https://$DOMAIN"
        echo "   https://www.$DOMAIN"
    else
        print_info "🌐 Your website is available at:"
        echo "   http://localhost:$APP_PORT"
        echo "   http://$(hostname -I | awk '{print $1}'):$APP_PORT"
        echo "   (If behind reverse proxy, use SITE_URL in .env)"
    fi
    
    echo ""
    print_info "📁 Important Paths:"
    echo "   App Directory: $APP_DIR"
    echo "   Environment File: $APP_DIR/.env.local"
    echo "   Nginx Config: /etc/nginx/sites-available/$APP_NAME"
    echo "   Logs: /var/log/$APP_NAME/"
    
    echo ""
    print_info "🔧 Management Commands:"
    echo "   Check status:    sudo -u www-data pm2 status"
    echo "   View logs:       sudo -u www-data pm2 logs $APP_NAME"
    echo "   Restart app:     sudo -u www-data pm2 restart $APP_NAME"
    echo "   Restart nginx:   systemctl restart nginx"
    echo "   Service status:  systemctl status $APP_NAME"
    
    echo ""
    print_status "✅ Configuration Complete:"
    echo "   - Environment file configured: $APP_DIR/.env.local"
    echo "   - All settings applied automatically"
    echo "   - Application ready to use"
    echo "   - Auto-start enabled (survives server reboots)"
    if [ "$SETUP_SSL" = true ]; then
        echo "   - SSL certificates installed and auto-renewing"
    fi
    echo ""
    
    print_info "🔧 Next Steps:"
    echo ""
    if [ "$SETUP_SSL" = true ]; then
        print_status "🌐 Visit your website at: https://$DOMAIN"
    else
        # Get server IP address
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || hostname -I | awk '{print $1}')
        print_status "🌐 Visit your website at: http://$SERVER_IP:$APP_PORT"
        echo "   (or http://localhost:$APP_PORT if accessing locally)"
    fi
    echo ""
    echo "1. Complete initial setup to create your admin account"
    echo "2. Use the 'Admin' button (not /admin URL) to access the admin panel"
    echo "3. Configure integrations (Discord, Steam, Google) in admin panel"
    echo "4. Add your game servers through admin panel"
    echo "5. Customize your website colors and content"
    echo ""
    echo "📝 If you need to modify database settings later:"
    echo "   - Edit: $APP_DIR/.env.local"
    echo "   - Restart: sudo -u www-data pm2 restart $APP_NAME"
    
    if [ "$SETUP_SSL" = false ]; then
        echo ""
        print_info "💡 To add SSL later, run:"
        echo "   sudo certbot --nginx"
    fi
    
    echo ""
    print_status "Installation completed successfully! 🚀"
}

# Function to detect existing installation
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
    
    print_step "Removing existing installation: $app_to_remove"
    
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
    
    print_status "Existing installation removed successfully"
}

# Function to handle existing installations
handle_existing_installations() {
    if detect_existing_installation; then
        print_warning "🔍 Existing installation(s) detected!"
        echo ""
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
        print_info "What would you like to do?"
        echo "1. Remove existing installation(s) and install fresh"
        echo "2. Cancel installation"
        echo ""
        
        while true; do
            read -p "Enter your choice (1-2): " choice
            case $choice in
                1)
                    print_info "Removing existing installations..."
                    for app in "${EXISTING_APPS[@]}"; do
                        uninstall_existing "$app"
                    done
                    print_status "All existing installations removed. Continuing with fresh installation..."
                    echo ""
                    break
                    ;;
                2)
                    print_info "Installation cancelled by user."
                    exit 0
                    ;;
                *)
                    print_error "Invalid choice. Please enter 1 or 2."
                    ;;
            esac
        done
    fi
}

# Main installation function
main() {
    print_header "Community Website Installation Script"
    echo ""
    print_info "This script will install and configure your community website."
    print_info "It will guide you through the entire setup process."
    echo ""
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
    
    # This script can be run from anywhere - it will clone/download the project
    
    # Check for existing installations
    handle_existing_installations
    
    # Run installation steps
    detect_os
    collect_configuration
    install_system_packages
    validate_database_connection_final
    setup_application_environment
    install_pm2
    deploy_application
    configure_nginx
    setup_pm2_config
    configure_firewall
    validate_dns
    setup_ssl_certificate
    start_services
    setup_monitoring
    validate_installation
    display_completion_info
}

# Run main function
main "$@"