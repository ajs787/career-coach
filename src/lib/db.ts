import { prisma } from './prisma'

// Database utility functions
export class DatabaseService {
  // User operations
  static async createUser(data: {
    email: string
    name?: string
    image?: string
  }) {
    return prisma.user.create({
      data: {
        ...data,
        profile: {
          create: {}
        }
      },
      include: {
        profile: true
      }
    })
  }

  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        userSessions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })
  }

  // Session operations
  static async createSession(data: {
    userId: string
    targetRole: string
    state: string
    ageRange: string
    hasQuals: boolean
    constraints: string
  }) {
    return prisma.userSession.create({
      data,
      include: {
        questions: true,
        answers: true
      }
    })
  }

  static async getSession(sessionId: string, userId: string) {
    return prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        answers: {
          include: {
            question: true
          }
        },
        verdict: true
      }
    })
  }

  static async updateSessionStatus(sessionId: string, status: string) {
    return prisma.userSession.update({
      where: { id: sessionId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : null
      }
    })
  }

  // Question operations
  static async createQuestion(data: {
    sessionId: string
    order: number
    bucket: string
    text: string
    weight: number
    source: string
  }) {
    return prisma.generatedQuestion.create({
      data
    })
  }

  static async getNextQuestion(sessionId: string) {
    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        },
        answers: {
          include: {
            question: true
          }
        }
      }
    })

    if (!session) return null

    const answeredQuestionIds = session.answers.map(a => a.questionId)
    const nextQuestion = session.questions.find(q => !answeredQuestionIds.includes(q.id))

    return nextQuestion
  }

  // Answer operations
  static async createAnswer(data: {
    sessionId: string
    questionId: string
    value: boolean
    note?: string
  }) {
    return prisma.answer.create({
      data,
      include: {
        question: true
      }
    })
  }

  // Verdict operations
  static async createVerdict(data: {
    sessionId: string
    fitScore: number
    color: string
    summary: string
    bucketScores: Record<string, number>
    mismatches: string[]
    nextSteps: string[]
    altCareers: Array<{ title: string; reason: string }>
  }) {
    return prisma.verdict.create({
      data
    })
  }

  // Career facts operations
  static async getCareerFacts(state: string, role: string) {
    return prisma.careerFact.findUnique({
      where: {
        state_role: {
          state,
          role
        }
      }
    })
  }

  static async searchCareers(criteria: {
    personality?: string[]
    realities?: string[]
    usTags?: string[]
  }) {
    return prisma.career.findMany({
      where: {
        OR: [
          criteria.personality && {
            personality: {
              hasSome: criteria.personality
            }
          },
          criteria.realities && {
            realities: {
              hasSome: criteria.realities
            }
          },
          criteria.usTags && {
            usTags: {
              hasSome: criteria.usTags
            }
          }
        ].filter(Boolean)
      }
    })
  }

  // Question templates operations
  static async getQuestionTemplates(bucket?: string) {
    return prisma.questionTemplate.findMany({
      where: {
        isActive: true,
        ...(bucket && { bucket })
      },
      orderBy: { weight: 'desc' }
    })
  }

  // Analytics operations
  static async createAuditLog(data: {
    userId?: string
    action: string
    meta?: any
  }) {
    return prisma.auditLog.create({
      data
    })
  }

  // Referral operations
  static async createReferral(userId: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    return prisma.referral.create({
      data: {
        userId,
        code
      }
    })
  }

  static async getReferralByCode(code: string) {
    return prisma.referral.findUnique({
      where: { code },
      include: {
        user: true
      }
    })
  }

  static async trackReferralClick(code: string) {
    return prisma.referral.update({
      where: { code },
      data: {
        clicks: {
          increment: 1
        }
      }
    })
  }

  static async trackReferralSignup(code: string) {
    return prisma.referral.update({
      where: { code },
      data: {
        signups: {
          increment: 1
        }
      }
    })
  }
}

export { prisma }
