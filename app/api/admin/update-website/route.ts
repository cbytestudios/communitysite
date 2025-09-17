import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    console.log('Starting website update...')

    // Pull latest changes
    console.log('Pulling latest changes from git...')
    await execAsync('git pull origin main')

    // Install dependencies
    console.log('Installing dependencies...')
    await execAsync('npm install')

    // Build the application
    console.log('Building application...')
    await execAsync('npm run build')

    console.log('Update completed successfully!')

    // Schedule restart after response is sent
    setTimeout(() => {
      console.log('Restarting application...')
      process.exit(0) // This will cause PM2 or similar process managers to restart the app
    }, 2000)

    return NextResponse.json({
      message: 'Update completed successfully! The application will restart in a few seconds.'
    })

  } catch (error) {
    console.error('Update failed:', error)
    return NextResponse.json({
      error: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'