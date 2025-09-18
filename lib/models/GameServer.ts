import prisma from '../prisma'

// Minimal shim for GameServer model to support Mongoose-like calls used in the codebase.

export const GameServer = {
  async find(filter: any = {}) {
    // Translate simple filters like { isPublic: true, isOnline: true }
    const where: any = {}
    if (typeof filter.isPublic !== 'undefined') where.isPublic = filter.isPublic
    if (typeof filter.isOnline !== 'undefined') where.isOnline = filter.isOnline

    const results = await prisma.gameServer.findMany({ where })
    return results
  },

  async findByIdAndUpdate(id: string, data: any, opts?: any) {
    try {
      const updated = await prisma.gameServer.update({ where: { id }, data })
      return updated
    } catch (e) {
      return null
    }
  },

  async findById(id: string) {
    return prisma.gameServer.findUnique({ where: { id } })
  }
}

export default GameServer
