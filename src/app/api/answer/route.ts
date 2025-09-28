import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DatabaseService } from '@/lib/db'
import { ScoringEngine } from '@/lib/scoring'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, questionId, value, note } = body

    if (!sessionId || !questionId || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const userSession = await DatabaseService.getSession(sessionId, session.user.id)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Create answer
    const answer = await DatabaseService.createAnswer({
      sessionId,
      questionId,
      value,
      note
    })

    // Get updated session with all answers
    const updatedSession = await DatabaseService.getSession(sessionId, session.user.id)
    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Calculate current scoring
    const answers = updatedSession.answers.map(a => ({
      id: a.id,
      bucket: a.question.bucket,
      weight: a.question.weight,
      value: a.value,
      note: a.note
    }))

    const scoringResult = ScoringEngine.calculateScore(answers)

    // Check if we should stop the session
    if (scoringResult.shouldStop) {
      await DatabaseService.updateSessionStatus(sessionId, 'completed')
      
      return NextResponse.json({
        answer: {
          id: answer.id,
          value,
          note
        },
        scoring: scoringResult,
        done: true,
        stopReason: scoringResult.stopReason
      })
    }

    return NextResponse.json({
      answer: {
        id: answer.id,
        value,
        note
      },
      scoring: scoringResult,
      done: false
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
