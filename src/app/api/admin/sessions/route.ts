import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DatabaseService } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.email !== 'admin@example.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const sessions = await DatabaseService.prisma.userSession.findMany({
      include: {
        verdict: {
          select: {
            fitScore: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for performance
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
