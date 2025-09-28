// Scoring engine for the Career Reality Coach
export interface QuestionAnswer {
  id: string
  bucket: string
  weight: number
  value: boolean
  note?: string
}

export interface BucketScores {
  personality: number
  daily: number
  commitment: number
  lifestyle: number
}

export interface ScoringResult {
  fitScore: number
  color: 'green' | 'amber' | 'red'
  bucketScores: BucketScores
  mismatches: string[]
  confidence: number
  shouldStop: boolean
  stopReason?: string
}

// Bucket weights (sum = 100)
const BUCKET_WEIGHTS = {
  personality: 35,
  daily: 25,
  commitment: 20,
  lifestyle: 20
} as const

// Deal-breaker threshold (number of critical "no" answers that trigger hard fail)
const DEAL_BREAKER_THRESHOLD = 3

// Confidence threshold for adaptive stopping
const CONFIDENCE_THRESHOLD = 0.9

// Minimum questions before adaptive stopping
const MIN_QUESTIONS = 12

// Maximum questions
const MAX_QUESTIONS = 20

export class ScoringEngine {
  static calculateScore(answers: QuestionAnswer[]): ScoringResult {
    const bucketScores = this.calculateBucketScores(answers)
    const fitScore = this.calculateFitScore(bucketScores)
    const color = this.getColorVerdict(fitScore)
    const mismatches = this.identifyMismatches(bucketScores, answers)
    const confidence = this.calculateConfidence(answers)
    const { shouldStop, stopReason } = this.shouldStopAdaptive(answers, confidence)

    return {
      fitScore,
      color,
      bucketScores,
      mismatches,
      confidence,
      shouldStop,
      stopReason
    }
  }

  private static calculateBucketScores(answers: QuestionAnswer[]): BucketScores {
    const buckets = {
      personality: { total: 0, answered: 0, score: 0 },
      daily: { total: 0, answered: 0, score: 0 },
      commitment: { total: 0, answered: 0, score: 0 },
      lifestyle: { total: 0, answered: 0, score: 0 }
    }

    // Calculate scores for each bucket
    for (const answer of answers) {
      const bucket = answer.bucket as keyof BucketScores
      if (buckets[bucket]) {
        buckets[bucket].total += answer.weight
        buckets[bucket].answered += 1
        
        // Yes = +weight, No = -weight
        // Deal-breaker questions (weight >= 8) get -2x penalty for "no"
        const penalty = answer.weight >= 8 && !answer.value ? 2 : 1
        buckets[bucket].score += answer.value ? answer.weight : -answer.weight * penalty
      }
    }

    // Convert to percentages (0-100)
    const bucketScores: BucketScores = {
      personality: this.normalizeScore(buckets.personality),
      daily: this.normalizeScore(buckets.daily),
      commitment: this.normalizeScore(buckets.commitment),
      lifestyle: this.normalizeScore(buckets.lifestyle)
    }

    return bucketScores
  }

  private static normalizeScore(bucket: { total: number; answered: number; score: number }): number {
    if (bucket.total === 0) return 50 // Neutral if no questions answered
    
    // Normalize to 0-100 scale
    const normalized = ((bucket.score / bucket.total) + 1) * 50
    return Math.max(0, Math.min(100, Math.round(normalized)))
  }

  private static calculateFitScore(bucketScores: BucketScores): number {
    let weightedScore = 0
    let totalWeight = 0

    for (const [bucket, score] of Object.entries(bucketScores)) {
      const weight = BUCKET_WEIGHTS[bucket as keyof BucketScores]
      weightedScore += score * weight
      totalWeight += weight
    }

    return Math.round(weightedScore / totalWeight)
  }

  private static getColorVerdict(fitScore: number): 'green' | 'amber' | 'red' {
    if (fitScore >= 75) return 'green'
    if (fitScore >= 50) return 'amber'
    return 'red'
  }

  private static identifyMismatches(bucketScores: BucketScores, answers: QuestionAnswer[]): string[] {
    const mismatches: string[] = []
    const thresholds = { personality: 60, daily: 50, commitment: 40, lifestyle: 50 }

    for (const [bucket, score] of Object.entries(bucketScores)) {
      const threshold = thresholds[bucket as keyof BucketScores]
      if (score < threshold) {
        const bucketName = bucket.charAt(0).toUpperCase() + bucket.slice(1)
        mismatches.push(`${bucketName} fit is low (${score}%)`)
      }
    }

    // Check for deal-breaker patterns
    const dealBreakers = answers.filter(a => a.weight >= 8 && !a.value)
    if (dealBreakers.length >= DEAL_BREAKER_THRESHOLD) {
      mismatches.push(`Multiple deal-breaker questions answered "no" (${dealBreakers.length})`)
    }

    return mismatches
  }

  private static calculateConfidence(answers: QuestionAnswer[]): number {
    if (answers.length === 0) return 0

    const totalPossibleWeight = answers.reduce((sum, a) => sum + a.weight, 0)
    const answeredWeight = answers.reduce((sum, a) => sum + a.weight, 0)
    
    return Math.min(1, answeredWeight / (totalPossibleWeight * 0.8)) // 80% of max weight = high confidence
  }

  private static shouldStopAdaptive(answers: QuestionAnswer[], confidence: number): { shouldStop: boolean; stopReason?: string } {
    // Hard fail: 3+ deal-breakers in any single bucket
    const dealBreakersByBucket = answers
      .filter(a => a.weight >= 8 && !a.value)
      .reduce((acc, a) => {
        acc[a.bucket] = (acc[a.bucket] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    for (const [bucket, count] of Object.entries(dealBreakersByBucket)) {
      if (count >= DEAL_BREAKER_THRESHOLD) {
        return { shouldStop: true, stopReason: `Hard fail: ${count} deal-breakers in ${bucket}` }
      }
    }

    // Hard pass: all criticals passed and min questions answered
    const criticalAnswers = answers.filter(a => a.weight >= 8)
    const allCriticalsPassed = criticalAnswers.every(a => a.value)
    if (allCriticalsPassed && answers.length >= MIN_QUESTIONS) {
      return { shouldStop: true, stopReason: 'Hard pass: all critical questions passed' }
    }

    // Adaptive stop: high confidence
    if (confidence >= CONFIDENCE_THRESHOLD && answers.length >= MIN_QUESTIONS) {
      return { shouldStop: true, stopReason: `High confidence: ${Math.round(confidence * 100)}%` }
    }

    // Max questions reached
    if (answers.length >= MAX_QUESTIONS) {
      return { shouldStop: true, stopReason: 'Maximum questions reached' }
    }

    return { shouldStop: false }
  }

  static generateNextSteps(verdict: ScoringResult, state: string, role: string): string[] {
    const steps: string[] = []
    const { fitScore, color, bucketScores } = verdict

    if (color === 'red') {
      steps.push('Consider alternative career paths that better match your personality and lifestyle')
      steps.push('Research careers with similar skills but different daily realities')
    } else if (color === 'amber') {
      steps.push('Address the identified mismatches before committing to this career')
      steps.push('Shadow someone in this field for a day to experience the reality')
    } else {
      steps.push('This career appears to be a good fit for you!')
      steps.push('Start networking with professionals in this field')
    }

    // State-specific steps
    if (state === 'CA') {
      steps.push('Research California-specific licensing requirements')
      steps.push('Check with the appropriate state board for current regulations')
    } else if (state === 'NY') {
      steps.push('Review New York state requirements and regulations')
      steps.push('Consider the cost of living in your target area')
    }

    // Role-specific steps
    if (role.toLowerCase().includes('nurse')) {
      steps.push('Complete prerequisite courses if not already done')
      steps.push('Apply to accredited nursing programs')
      steps.push('Prepare for the NCLEX-RN exam')
    } else if (role.toLowerCase().includes('real estate')) {
      steps.push('Complete pre-licensing education requirements')
      steps.push('Find a sponsoring broker')
      steps.push('Pass the state real estate exam')
    }

    // Bucket-specific steps
    if (bucketScores.commitment < 50) {
      steps.push('Evaluate if you can commit to the required training timeline')
    }
    if (bucketScores.lifestyle < 50) {
      steps.push('Consider how this career will impact your personal life')
    }

    return steps
  }
}
