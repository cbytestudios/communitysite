import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { email, username, password } = await request.json()
    const loginField = email || username
    
    console.log('Debug login attempt:', { loginField, password: '***' })
    
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: loginField.toLowerCase() },
        { username: loginField }
      ]
    })
    
    if (!user) {
      console.log('User not found for:', loginField)
      return NextResponse.json({ 
        error: 'User not found',
        searchedFor: loginField,
        searchQuery: {
          $or: [
            { email: loginField.toLowerCase() },
            { username: loginField }
          ]
        }
      }, { status: 404 })
    }
    
    console.log('User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      hasPassword: !!user.password,
      isOwner: user.isOwner,
      isEmailVerified: user.isEmailVerified
    })
    
    // Check password
    const isValidPassword = await user.comparePassword(password)
    console.log('Password comparison result:', isValidPassword)
    
    return NextResponse.json({ 
      message: 'Debug complete',
      userFound: true,
      passwordValid: isValidPassword,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOwner: user.isOwner,
        isEmailVerified: user.isEmailVerified
      }
    })
    
  } catch (error) {
    console.error('Debug login error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Debug failed' 
    }, { status: 500 })
  }
}