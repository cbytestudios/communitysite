import prisma from '../prisma'
import bcrypt from 'bcryptjs'

// Minimal shim to emulate the Mongoose-style API used in some routes.
// Only implements the methods the app expects: findOne, findById, findByIdAndUpdate, findById (alias), find, and instance comparePassword/save.

type PlainUser = any

const User = {
  async findOne(query: any) {
    // Support queries using $or on email/username
    if (query?.$or && Array.isArray(query.$or)) {
      for (const clause of query.$or) {
        if (clause.email) {
          const u = await prisma.user.findUnique({ where: { email: clause.email } })
          if (u) return mapToInstance(u)
        }
        if (clause.username) {
          const u = await prisma.user.findUnique({ where: { username: clause.username } })
          if (u) return mapToInstance(u)
        }
      }
      return null
    }

    // simple where matching for email or username
    if (query?.email) {
      const u = await prisma.user.findUnique({ where: { email: query.email } })
      return u ? mapToInstance(u) : null
    }

    if (query?.username) {
      const u = await prisma.user.findUnique({ where: { username: query.username } })
      return u ? mapToInstance(u) : null
    }

    return null
  },

  async findById(id: string) {
    const u = await prisma.user.findUnique({ where: { id } })
    return u ? mapToInstance(u) : null
  },

  // Find by id and update, returning the updated record
  async findByIdAndUpdate(id: string, data: any, opts?: any) {
    try {
      const updated = await prisma.user.update({ where: { id }, data })
      return mapToInstance(updated)
    } catch (e) {
      return null
    }
  }
}

function mapToInstance(record: any) {
  // Attach methods expected by code: comparePassword, save, _id
  const instance: PlainUser = { ...record, _id: record.id }

  instance.comparePassword = async (candidate: string) => {
    if (!instance.password) return false
    return bcrypt.compare(candidate, instance.password)
  }

  instance.save = async () => {
    // Save mutable fields back to DB. We'll attempt to update known fields.
    const data: any = { profilePicture: instance.profilePicture ?? null }
    if (instance.password && !instance.password.startsWith('$2a$') && !instance.password.startsWith('$2b$')) {
      data.password = await bcrypt.hash(instance.password, 12)
    } else if (instance.password) {
      data.password = instance.password
    }

    const updated = await prisma.user.update({ where: { id: instance.id }, data })
    Object.assign(instance, updated)
    return instance
  }

  return instance
}

export default User
