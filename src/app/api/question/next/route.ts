import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DatabaseService } from '@/lib/db'
import { AIService } from '@/lib/ai'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    // Get the user session
    const userSession = await DatabaseService.getSession(sessionId, session.user.id)
    if (!userSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if session is already completed
    if (userSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      )
    }

    // Get next question
    const nextQuestion = await DatabaseService.getNextQuestion(sessionId)
    
    if (nextQuestion) {
      return NextResponse.json({
        question: {
          id: nextQuestion.id,
          text: nextQuestion.text,
          bucket: nextQuestion.bucket,
          weight: nextQuestion.weight,
          order: nextQuestion.order
        },
        progress: {
          current: nextQuestion.order,
          total: userSession.questions.length
        }
      })
    }

    // Generate new question if none available
    const context = {
      targetRole: userSession.targetRole,
      state: userSession.state,
      ageRange: userSession.ageRange,
      hasQuals: userSession.hasQuals,
      constraints: userSession.constraints,
      answeredQuestions: userSession.answers.map(a => ({
        bucket: a.question.bucket,
        text: a.question.text,
        value: a.value
      }))
    }

    const generatedQuestion = await AIService.generateQuestion(context)
    
    // Create the question in database
    const question = await DatabaseService.createQuestion({
      sessionId,
      order: userSession.questions.length + 1,
      bucket: generatedQuestion.bucket,
      text: generatedQuestion.text,
      weight: generatedQuestion.weight,
      source: 'ai'
    })

    return NextResponse.json({
      question: {
        id: question.id,
        text: question.text,
        bucket: question.bucket,
        weight: question.weight,
        order: question.order
      },
      progress: {
        current: question.order,
        total: question.order
      }
    })
  } catch (error) {
    console.error('Error getting next question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
