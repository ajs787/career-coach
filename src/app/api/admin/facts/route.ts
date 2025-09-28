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

    // Simple admin check (in production, use proper RBAC)
    if (session.user.email !== 'admin@example.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const facts = await DatabaseService.prisma.careerFact.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(facts)
  } catch (error) {
    console.error('Error fetching career facts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.email !== 'admin@example.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { state, role, licensing, training, costsUSD, salaryUSD, links } = body

    const fact = await DatabaseService.prisma.careerFact.upsert({
      where: {
        state_role: {
          state,
          role
        }
      },
      update: {
        licensing,
        training,
        costsUSD,
        salaryUSD,
        links: links || []
      },
      create: {
        state,
        role,
        licensing,
        training,
        costsUSD,
        salaryUSD,
        links: links || []
      }
    })

    return NextResponse.json(fact)
  } catch (error) {
    console.error('Error creating/updating career fact:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
