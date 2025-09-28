import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DatabaseService } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetRole, state, ageRange, hasQuals, constraints } = body

    // Validate required fields
    if (!targetRole || !state || !ageRange || hasQuals === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new session
    const userSession = await DatabaseService.createSession({
      userId: session.user.id,
      targetRole,
      state,
      ageRange,
      hasQuals,
      constraints: constraints || ''
    })

    return NextResponse.json({
      sessionId: userSession.id,
      status: 'active'
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
