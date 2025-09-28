// AI integration for question generation and career suggestions
import { DatabaseService } from './db'

export interface QuestionContext {
  targetRole: string
  state: string
  ageRange: string
  hasQuals: boolean
  constraints: string
  answeredQuestions: Array<{
    bucket: string
    text: string
    value: boolean
  }>
}

export interface CareerSuggestion {
  title: string
  reason: string
}

export class AIService {
  private static readonly SYSTEM_PROMPT = `You are a career reality coach who uses "The Coffee Beans Procedure" to help people unpack the actual day-to-day reality of careers they're considering. Your job is to cut through romantic fantasies and reveal what the work actually entails, while accounting for their specific situation and location. Use the provided context JSON. Ask **one** yes/no question at a time. No deviation from instructions.

Focus on these buckets in order of priority:
1. Personality Fit (35% weight) - Can they handle the mental/emotional demands?
2. Daily Reality (25% weight) - What does the actual work look like?
3. Commitment (20% weight) - Are they willing to do what it takes?
4. Lifestyle (20% weight) - How will this affect their personal life?

Make questions brutally specific and avoid fluff. No open-ended prompts except optional short "note" field.`

  static async generateQuestion(context: QuestionContext): Promise<{
    text: string
    bucket: string
    weight: number
  }> {
    try {
      // Get career facts for context
      const careerFacts = await DatabaseService.getCareerFacts(context.state, context.targetRole)
      
      // Get question templates for inspiration
      const templates = await DatabaseService.getQuestionTemplates()
      
      const prompt = this.buildQuestionPrompt(context, careerFacts, templates)
      
      // For now, we'll use a simple template-based approach
      // In production, this would call the actual LLM API
      const question = await this.generateFromTemplates(context, templates)
      
      return question
    } catch (error) {
      console.error('Error generating question:', error)
      // Fallback to a generic question
      return {
        text: `Are you prepared to invest significant time and money in training for ${context.targetRole}?`,
        bucket: 'commitment',
        weight: 7
      }
    }
  }

  static async generateCareerSuggestions(
    targetRole: string,
    topMismatches: string[],
    personalityFlags: string[],
    state: string
  ): Promise<CareerSuggestion[]> {
    try {
      // Search for alternative careers based on personality and realities
      const alternatives = await DatabaseService.searchCareers({
        personality: personalityFlags,
        realities: this.extractRealityKeywords(topMismatches)
      })

      // Generate reasons for each suggestion
      const suggestions: CareerSuggestion[] = alternatives.slice(0, 5).map(career => ({
        title: career.title,
        reason: this.generateCareerReason(career, targetRole, topMismatches)
      }))

      return suggestions
    } catch (error) {
      console.error('Error generating career suggestions:', error)
      return []
    }
  }

  private static buildQuestionPrompt(
    context: QuestionContext,
    careerFacts: any,
    templates: any[]
  ): string {
    return `
Context:
- Role: ${context.targetRole}
- State: ${context.state}
- Age: ${context.ageRange}
- Has Qualifications: ${context.hasQuals}
- Constraints: ${context.constraints}
- Career Facts: ${careerFacts ? JSON.stringify(careerFacts) : 'None available'}

Previous Questions Answered:
${context.answeredQuestions.map(q => `- ${q.bucket}: "${q.text}" → ${q.value ? 'Yes' : 'No'}`).join('\n')}

Available Templates:
${templates.map(t => `- ${t.bucket}: "${t.pattern}" (weight: ${t.weight})`).join('\n')}

Generate the next question focusing on the most important uncovered area.
`
  }

  private static async generateFromTemplates(
    context: QuestionContext,
    templates: any[]
  ): Promise<{ text: string; bucket: string; weight: number }> {
    // Simple template-based question generation
    // In production, this would be replaced with actual LLM calls
    
    const answeredBuckets = new Set(context.answeredQuestions.map(q => q.bucket))
    const priorityBuckets = ['personality', 'daily', 'commitment', 'lifestyle', 'entry', 'unsexy']
    
    // Find the next priority bucket that hasn't been fully explored
    let targetBucket = priorityBuckets.find(bucket => !answeredBuckets.has(bucket)) || 'personality'
    
    // Get templates for the target bucket
    const bucketTemplates = templates.filter(t => t.bucket === targetBucket)
    
    if (bucketTemplates.length === 0) {
      // Fallback to a generic question
      return {
        text: `Are you prepared to invest significant time and money in training for ${context.targetRole}?`,
        bucket: 'commitment',
        weight: 7
      }
    }

    // Select the highest weight template
    const template = bucketTemplates.reduce((prev, current) => 
      prev.weight > current.weight ? prev : current
    )

    // Replace template variables with context-specific values
    let questionText = template.pattern
    
    // Replace common placeholders
    questionText = questionText.replace('{state}', context.state)
    questionText = questionText.replace('{role}', context.targetRole)
    questionText = questionText.replace('{routine_task}', 'routine administrative tasks')
    questionText = questionText.replace('{exciting_task}', 'the exciting parts you see on TV')
    questionText = questionText.replace('{physical_demand}', 'lifting 50+ pounds and being on your feet for 8+ hours')
    questionText = questionText.replace('{technology_requirement}', 'learning new software and systems regularly')
    questionText = questionText.replace('{training_duration}', '2-4 years of education and training')
    questionText = questionText.replace('{ongoing_requirement}', 'continuing education and certification maintenance')
    questionText = questionText.replace('{financial_commitment}', '$20,000-60,000')
    questionText = questionText.replace('{schedule_requirement}', '12-hour shifts including nights and weekends')
    questionText = questionText.replace('{work_life_balance_challenge}', 'irregular hours and high stress')
    questionText = questionText.replace('{prerequisite_requirement}', 'a bachelor\'s degree or equivalent experience')
    questionText = questionText.replace('{entry_level_position}', 'an entry-level position with lower pay')
    questionText = questionText.replace('{unpleasant_aspect}', 'dealing with difficult people and stressful situations')
    questionText = questionText.replace('{boring_task}', 'extensive paperwork and documentation')

    return {
      text: questionText,
      bucket: template.bucket,
      weight: template.weight
    }
  }

  private static extractRealityKeywords(mismatches: string[]): string[] {
    const keywords: string[] = []
    
    for (const mismatch of mismatches) {
      if (mismatch.toLowerCase().includes('personality')) {
        keywords.push('people-oriented', 'detail-oriented', 'stress-tolerant')
      }
      if (mismatch.toLowerCase().includes('daily')) {
        keywords.push('administrative', 'routine', 'physical-demand')
      }
      if (mismatch.toLowerCase().includes('commitment')) {
        keywords.push('training', 'education', 'certification')
      }
      if (mismatch.toLowerCase().includes('lifestyle')) {
        keywords.push('flexible-schedule', 'work-life-balance')
      }
    }
    
    return keywords
  }

  private static generateCareerReason(
    career: any,
    targetRole: string,
    mismatches: string[]
  ): string {
    const reasons: string[] = []
    
    // Compare personality traits
    if (career.personality && career.personality.length > 0) {
      reasons.push(`Better matches your personality traits: ${career.personality.slice(0, 2).join(', ')}`)
    }
    
    // Compare daily realities
    if (career.realities && career.realities.length > 0) {
      reasons.push(`More aligned with your preferred work style: ${career.realities.slice(0, 2).join(', ')}`)
    }
    
    // Address specific mismatches
    if (mismatches.some(m => m.toLowerCase().includes('commitment'))) {
      reasons.push('Requires less upfront training and investment')
    }
    
    if (mismatches.some(m => m.toLowerCase().includes('lifestyle'))) {
      reasons.push('Offers better work-life balance')
    }
    
    return reasons.join('. ') || `Similar to ${targetRole} but with different requirements`
  }

  // Mock LLM API call (replace with actual implementation)
  private static async callLLM(prompt: string): Promise<string> {
    // This would be replaced with actual API calls to Together, OpenRouter, etc.
    // For now, return a mock response
    return "Mock LLM response"
  }
}
