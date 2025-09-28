import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DatabaseService } from '@/lib/db'
import { ScoringEngine } from '@/lib/scoring'
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

    // Check if verdict already exists
    if (userSession.verdict) {
      return NextResponse.json({
        verdict: userSession.verdict
      })
    }

    // Calculate final scoring
    const answers = userSession.answers.map(a => ({
      id: a.id,
      bucket: a.question.bucket,
      weight: a.question.weight,
      value: a.value,
      note: a.note
    }))

    const scoringResult = ScoringEngine.calculateScore(answers)

    // Generate next steps
    const nextSteps = ScoringEngine.generateNextSteps(
      scoringResult,
      userSession.state,
      userSession.targetRole
    )

    // Generate alternative career suggestions
    const personalityFlags = answers
      .filter(a => a.bucket === 'personality' && a.value)
      .map(a => a.note || '')
      .filter(Boolean)

    const altCareers = await AIService.generateCareerSuggestions(
      userSession.targetRole,
      scoringResult.mismatches,
      personalityFlags,
      userSession.state
    )

    // Create verdict
    const verdict = await DatabaseService.createVerdict({
      sessionId,
      fitScore: scoringResult.fitScore,
      color: scoringResult.color,
      summary: generateSummary(scoringResult, userSession.targetRole),
      bucketScores: scoringResult.bucketScores,
      mismatches: scoringResult.mismatches,
      nextSteps,
      altCareers
    })

    // Mark session as completed
    await DatabaseService.updateSessionStatus(sessionId, 'completed')

    return NextResponse.json({
      verdict
    })
  } catch (error) {
    console.error('Error generating verdict:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSummary(scoringResult: any, targetRole: string): string {
  const { fitScore, color, bucketScores } = scoringResult
  
  if (color === 'green') {
    return `Great news! Your score of ${fitScore}% suggests that ${targetRole} is a strong fit for you. Your personality, daily preferences, and lifestyle align well with what this career demands.`
  } else if (color === 'amber') {
    return `Your score of ${fitScore}% indicates a mixed fit for ${targetRole}. While there are some areas of alignment, there are also significant mismatches that you should consider carefully before committing to this career path.`
  } else {
    return `Your score of ${fitScore}% suggests that ${targetRole} may not be the best fit for you. The mismatches identified could lead to frustration and dissatisfaction in this career. Consider exploring alternative paths that better match your personality and preferences.`
  }
}
