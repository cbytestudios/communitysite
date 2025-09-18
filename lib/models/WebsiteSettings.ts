import prisma from '../prisma'

// Shim to provide WebsiteSettings.findOne() compatible with legacy usage.
export const WebsiteSettings = {
  async findOne() {
    const settings = await prisma.websiteSettings.findFirst()
    if (!settings) return null

    // Map flattened SMTP and email fields into an emailSettings object expected by older code
    const emailSettings = {
      smtpHost: settings.smtpHost || '',
      smtpPort: settings.smtpPort || 587,
      smtpUser: settings.smtpUser || '',
      smtpPassword: settings.smtpPassword || '',
      fromEmail: settings.fromEmail || '',
      fromName: settings.fromName || ''
    }

    return { ...settings, emailSettings }
  }
}

export default WebsiteSettings
