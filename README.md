# 🎮 Community Website - Multi-Game Platform

A comprehensive, customizable community website platform supporting multiple games with a powerful admin panel for complete website management.

## ✨ Features

- **🎯 Multi-Game Support** - Perfect for any game community - Minecraft, Rust, GMod, CS:GO, and more
- **🛠️ Complete Admin Panel** - Manage everything through a beautiful web interface
- **👥 User Management** - Registration, authentication, roles, and permissions
- **🖥️ Server Management** - Add and monitor game servers with real-time status
- **🎨 Full Customization** - Colors, images, text, and layout - all customizable
- **🔄 Auto-Updates** - Update your website directly from the admin panel
- **🔗 Integrations** - Discord, Steam, Google authentication (optional)
- **📧 Email System** - SMTP configuration and user notifications
- **📱 Responsive Design** - Beautiful on desktop, tablet, and mobile

## 🚀 One-Command Installation

### Prerequisites

- **Linux Server** (Ubuntu, Debian, CentOS, RHEL, Fedora, Arch)
- **Root Access** (sudo privileges)
- **Domain Name** (optional, for SSL)

### Installation

**Run this single command on your Linux server:**

```bash
curl -fsSL https://raw.githubusercontent.com/OldTymeGamer/communitysite/main/install.sh | sudo bash
```

**If you experience input issues, use this alternative:**

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/OldTymeGamer/communitysite/main/install.sh)
```

That's it! The script will:
- ✅ Install Node.js, Nginx, and all dependencies
- ✅ Guide you through basic configuration (MongoDB, SSL)
- ✅ Set up SSL certificates with Let's Encrypt
- ✅ Configure firewall and security
- ✅ Start all services automatically
- ✅ Give you the exact URL/IP to visit your new website

### After Installation

1. **Visit your website** - The installer will show you the exact URL/IP address
2. **Automatic setup** - You'll be redirected to setup automatically on first visit
3. **Create admin account** - Fill out the setup form to become the site owner
4. **Use "Admin" button** - Access admin panel via the navigation button (not `/admin` URL)
5. **Start building your community!**

## 🎨 Customization

Once running, use the **Admin button** in your website's navigation to customize:

### Website Appearance
- **Colors & Branding** - Complete color scheme customization
- **Hero Section** - Title, description, and background images
- **Gallery Images** - Upload and manage slideshow images
- **Content Management** - All text and content editable

### Server Management
- **Add Game Servers** - Support for multiple game types
- **Real-time Monitoring** - Player count, ping, and status
- **Automatic Display** - Servers appear on homepage automatically

### User & Community
- **User Registration** - Enable/disable public registration
- **Email Verification** - Optional email verification system
- **Role Management** - Admin and user permissions

### Integrations
- **Discord Integration** - OAuth login and member count display
- **Steam Integration** - Steam authentication (coming soon)
- **Google Integration** - Google OAuth (coming soon)
- **Email Settings** - SMTP configuration for notifications


## 🔄 Auto-Updates

Keep your website up-to-date effortlessly:

1. Go to **Admin Panel** → **Updates**
2. Click "Check for Updates"
3. If updates are available, click "Update Now"
4. The website automatically pulls changes and restarts


## 📞 Support

Need help? Here's how to get support:

1. **Check the admin panel logs** for error messages
2. **Contact us** via GitHub issues or our Discord server
3. **Read documentation** in the wiki section of this repository
4. **Join our Discord server** for live chat and support


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Build amazing gaming communities! 🎮✨**

*Made with ❤️ for the gaming community*