#!/bin/bash

# This script helps set up SSL certificates using Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}🔒 $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_header "SSL Certificate Setup for Lost Trail RP"
echo ""

# Configuration
DOMAIN="losttrailrp.com"
EMAIL="bosbornjr@gmail.com"  # From your .env.local
NGINX_CONF="/etc/nginx/sites-available/communitysite"
NGINX_ENABLED="/etc/nginx/sites-enabled/communitysite"

print_info "Domain: $DOMAIN"
print_info "Email: $EMAIL"
print_info "Nginx config: $NGINX_CONF"
echo ""

# Step 1: Install certbot if not already installed
print_header "Step 1: Installing Certbot"
if ! command -v certbot &> /dev/null; then
    print_info "Installing certbot..."
    if [[ -f /etc/debian_version ]]; then
        apt update
        apt install -y certbot python3-certbot-nginx
    elif [[ -f /etc/redhat-release ]]; then
        yum install -y certbot python3-certbot-nginx
    else
        print_error "Unsupported OS. Please install certbot manually."
        exit 1
    fi
    print_status "Certbot installed"
else
    print_status "Certbot is already installed"
fi

# Step 2: Stop nginx temporarily
print_header "Step 2: Preparing Nginx"
print_info "Stopping nginx temporarily..."
systemctl stop nginx

# Step 3: Create temporary HTTP-only nginx config
print_info "Creating temporary HTTP-only configuration..."
cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name losttrailrp.com www.losttrailrp.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"

# Test and start nginx
if nginx -t; then
    systemctl start nginx
    print_status "Temporary nginx configuration is active"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Step 4: Obtain SSL certificate
print_header "Step 3: Obtaining SSL Certificate"
print_info "Requesting SSL certificate from Let's Encrypt..."

if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL" --redirect; then
    print_status "SSL certificate obtained successfully!"
else
    print_error "Failed to obtain SSL certificate"
    print_info "Common issues:"
    print_info "1. Domain not pointing to this server"
    print_info "2. Firewall blocking port 80/443"
    print_info "3. Another service using port 80/443"
    exit 1
fi

# Step 5: Replace with full nginx configuration
print_header "Step 4: Installing Full Nginx Configuration"
print_info "Installing the full nginx configuration with SSL..."

# Backup the certbot-modified config
cp "$NGINX_CONF" "$NGINX_CONF.certbot-backup"

# Install the full configuration (this will include the SSL settings from certbot)
# We need to merge our full config with the SSL settings that certbot added
print_info "Merging full configuration with SSL settings..."

# Get the SSL certificate paths from the certbot config
SSL_CERT=$(grep "ssl_certificate " "$NGINX_CONF.certbot-backup" | head -1 | awk '{print $2}' | sed 's/;//')
SSL_KEY=$(grep "ssl_certificate_key " "$NGINX_CONF.certbot-backup" | head -1 | awk '{print $2}' | sed 's/;//')

print_info "SSL Certificate: $SSL_CERT"
print_info "SSL Key: $SSL_KEY"

# Create the full configuration with the correct SSL paths
cat > "$NGINX_CONF" << EOF
# Nginx configuration for Lost Trail RP Community Website
# This configuration handles SSL termination, static file serving, and proxying to Next.js

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name losttrailrp.com www.losttrailrp.com;
    
    # Redirect all HTTP requests to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    server_name losttrailrp.com www.losttrailrp.com;

    # SSL Configuration (managed by Certbot)
    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.github.com https://servers-frontend.fivem.net; frame-ancestors 'none';" always;

    # Root directory
    root /var/www/losttrailrp;

    # Index files
    index index.html index.htm;

    # Max upload size
    client_max_body_size 10M;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        
        # Try to serve static files directly, fallback to Next.js
        try_files \$uri @nextjs;
    }

    # Next.js static files
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:3000;
    }

    # API routes with rate limiting
    location /api/ {
        # Rate limiting for API endpoints
        limit_req zone=api burst=20 nodelay;
        
        # Special rate limiting for auth endpoints
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Admin routes - additional security
    location /admin {
        # Additional rate limiting for admin
        limit_req zone=login burst=3 nodelay;
        
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Robots.txt
    location /robots.txt {
        add_header Content-Type text/plain;
        return 200 "User-agent: *\nDisallow: /admin\nDisallow: /api\nSitemap: https://losttrailrp.com/sitemap.xml\n";
    }

    # Security - block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|log|config)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Block common exploit attempts
    location ~* \.(php|asp|aspx|jsp)\$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Main location block - proxy everything else to Next.js
    location / {
        # Try to serve request as file, then as directory, then fallback to Next.js
        try_files \$uri \$uri/ @nextjs;
    }

    # Next.js proxy configuration
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Test the new configuration
if nginx -t; then
    systemctl reload nginx
    print_status "Full nginx configuration installed and active"
else
    print_error "New nginx configuration failed. Restoring backup..."
    cp "$NGINX_CONF.certbot-backup" "$NGINX_CONF"
    systemctl reload nginx
    exit 1
fi

# Step 6: Environment configuration
print_header "Step 5: Environment Configuration"
print_info "Authentication configuration is handled through the admin panel"
print_status "No environment updates needed"

# Step 7: Setup auto-renewal
print_header "Step 6: Setting up Auto-renewal"
print_info "Setting up automatic certificate renewal..."

# Test renewal
if certbot renew --dry-run; then
    print_status "Certificate auto-renewal is configured correctly"
else
    print_warning "Certificate auto-renewal test failed"
fi

# Final status
print_header "SSL Setup Complete!"
echo ""
print_status "SSL certificate has been installed successfully"
print_status "Your site is now accessible at: https://$DOMAIN"
print_status "HTTP requests will automatically redirect to HTTPS"
print_info "Certificate will auto-renew before expiration"
echo ""
print_info "Next steps:"
print_info "1. Restart your Next.js application to pick up the new HTTPS URL"
print_info "2. Test your site at https://$DOMAIN"
print_info "3. Update any hardcoded HTTP URLs in your application"
echo ""