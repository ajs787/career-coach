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

    const templates = await DatabaseService.prisma.questionTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching question templates:', error)
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
    const { bucket, pattern, weight, isActive } = body

    const template = await DatabaseService.prisma.questionTemplate.create({
      data: {
        bucket,
        pattern,
        weight: weight || 5,
        isActive: isActive !== false
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating question template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
