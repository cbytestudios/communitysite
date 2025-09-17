import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Check if git is available and we're in a git repository
    try {
      await execAsync('git status')
    } catch (error) {
      return NextResponse.json({
        error: "Git repository not found. Make sure this is a git repository with a remote origin configured."
      })
    }

    // Fetch latest changes from remote
    await execAsync('git fetch origin')

    // Get current commit hash
    const { stdout: currentHash } = await execAsync('git rev-parse HEAD')
    const currentCommit = currentHash.trim()

    // Get remote commit hash
    const { stdout: remoteHash } = await execAsync('git rev-parse origin/main')
    const remoteCommit = remoteHash.trim()

    // Check if we're behind
    const { stdout: behindCount } = await execAsync('git rev-list --count HEAD..origin/main')
    const commitsAhead = parseInt(behindCount.trim())

    const hasUpdate = commitsAhead > 0

    let latestCommit = null
    let changelog: string[] = []

    if (hasUpdate) {
      // Get latest commit info
      const { stdout: commitInfo } = await execAsync('git log origin/main -1 --pretty=format:"%H|%s|%an|%ad" --date=short')
      const [hash, message, author, date] = commitInfo.split('|')
      
      latestCommit = {
        hash: hash.substring(0, 8),
        message,
        author,
        date
      }

      // Get changelog (recent commits)
      const { stdout: changelogOutput } = await execAsync('git log origin/main --oneline -10')
      changelog = changelogOutput.trim().split('\n').map(line => line.substring(8)) // Remove hash prefix
    }

    return NextResponse.json({
      currentVersion: currentCommit.substring(0, 8),
      latestVersion: remoteCommit.substring(0, 8),
      hasUpdate,
      commitsAhead,
      latestCommit,
      changelog
    })

  } catch (error) {
    console.error('Update check failed:', error)
    return NextResponse.json({
      error: `Failed to check for updates: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
}

export const dynamic = 'force-dynamic'