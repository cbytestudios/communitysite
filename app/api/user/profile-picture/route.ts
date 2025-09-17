import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { profilePicture } = await request.json()

    if (!profilePicture) {
      return NextResponse.json(
        { error: 'Profile picture URL is required' },
        { status: 400 }
      )
    }

    await dbConnect()
    
    const dbUser = await User.findById(user.id)
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update profile picture
    dbUser.profilePicture = profilePicture
    await dbUser.save()

    return NextResponse.json(
      { 
        message: 'Profile picture updated successfully',
        profilePicture: dbUser.profilePicture
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Profile picture update error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    const dbUser = await User.findById(user.id)
    
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove profile picture
    dbUser.profilePicture = null
    await dbUser.save()

    return NextResponse.json(
      { message: 'Profile picture removed successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Profile picture removal error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}