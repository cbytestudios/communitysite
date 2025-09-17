import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || (!user.isAdmin && !user.isOwner)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if there are updates available
    const { stdout: currentCommit } = await execAsync('git rev-parse HEAD')
    const { stdout: remoteCommit } = await execAsync('git ls-remote origin HEAD | cut -f1')
    
    const hasUpdates = currentCommit.trim() !== remoteCommit.trim()
    
    // Get latest commit info
    const { stdout: commitInfo } = await execAsync('git log -1 --pretty=format:"%h - %s (%cr) <%an>"')
    
    return NextResponse.json({
      hasUpdates,
      currentCommit: currentCommit.trim().substring(0, 7),
      remoteCommit: remoteCommit.trim().substring(0, 7),
      latestCommitInfo: commitInfo.trim()
    })
  } catch (error) {
    console.error('Error checking for updates:', error)
    return NextResponse.json({ error: 'Failed to check for updates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || (!user.isAdmin && !user.isOwner)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pull latest changes
    await execAsync('git pull origin main')
    
    // Install dependencies
    await execAsync('npm install')
    
    // Build the application
    await execAsync('npm run build')
    
    // Restart PM2 process
    await execAsync('pm2 restart all')
    
    return NextResponse.json({ success: true, message: 'Update completed successfully' })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 })
  }
}