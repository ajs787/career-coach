import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed career facts for key US states and roles
  const careerFacts = [
    // Registered Nurse - California
    {
      state: 'CA',
      role: 'Registered Nurse',
      licensing: 'California Board of Registered Nursing (BRN). Requires: Associate or Bachelor degree in nursing, NCLEX-RN exam, background check, 30 hours continuing education every 2 years.',
      training: '2-4 years: Prerequisites (1-2 years) + Nursing program (2 years). Clinical hours: 800+ hours.',
      costsUSD: 'Prerequisites: $3,000-8,000. Nursing program: $15,000-60,000. Total: $18,000-68,000.',
      salaryUSD: 'Entry: $70,000-85,000. Median: $95,000-110,000. Experienced: $120,000+',
      links: ['https://www.rn.ca.gov/', 'https://www.bls.gov/oes/current/oes291141.htm']
    },
    // Registered Nurse - New York
    {
      state: 'NY',
      role: 'Registered Nurse',
      licensing: 'New York State Education Department (NYSED). Requires: Associate or Bachelor degree, NCLEX-RN exam, background check, 3 hours infection control training.',
      training: '2-4 years: Prerequisites (1-2 years) + Nursing program (2 years). Clinical hours: 800+ hours.',
      costsUSD: 'Prerequisites: $4,000-10,000. Nursing program: $20,000-70,000. Total: $24,000-80,000.',
      salaryUSD: 'Entry: $75,000-90,000. Median: $100,000-120,000. Experienced: $130,000+',
      links: ['https://www.op.nysed.gov/prof/nursing/', 'https://www.bls.gov/oes/current/oes291141.htm']
    },
    // Real Estate Agent - California
    {
      state: 'CA',
      role: 'Real Estate Agent',
      licensing: 'California Department of Real Estate (DRE). Requires: 135 hours pre-licensing education, background check, DRE exam, fingerprinting.',
      training: '3-6 months: Pre-licensing courses (135 hours) + exam prep. No degree required.',
      costsUSD: 'Pre-licensing: $300-800. Exam fees: $60. License: $245. Total: $605-1,105.',
      salaryUSD: 'Entry: $30,000-50,000 (commission-based). Median: $60,000-80,000. Top performers: $150,000+',
      links: ['https://dre.ca.gov/', 'https://www.bls.gov/oes/current/oes419021.htm']
    },
    // Licensed Therapist - California
    {
      state: 'CA',
      role: 'Licensed Therapist',
      licensing: 'California Board of Behavioral Sciences (BBS). Requires: Master\'s degree in counseling/psychology, 3,000 supervised hours, background check, clinical exam.',
      training: '6-8 years: Bachelor\'s (4 years) + Master\'s (2-3 years) + Supervised hours (1-2 years).',
      costsUSD: 'Bachelor\'s: $40,000-120,000. Master\'s: $30,000-80,000. Supervision: $2,000-5,000. Total: $72,000-205,000.',
      salaryUSD: 'Entry: $45,000-60,000. Median: $65,000-85,000. Experienced: $90,000+',
      links: ['https://www.bbs.ca.gov/', 'https://www.bls.gov/oes/current/oes211013.htm']
    },
    // Software Engineer - California
    {
      state: 'CA',
      role: 'Software Engineer',
      licensing: 'No license required. Optional certifications: AWS, Google Cloud, Microsoft Azure.',
      training: '4+ years: Computer Science degree or bootcamp (3-12 months) + self-study. Portfolio required.',
      costsUSD: 'Degree: $40,000-200,000. Bootcamp: $10,000-20,000. Self-study: $500-2,000.',
      salaryUSD: 'Entry: $80,000-120,000. Median: $130,000-180,000. Senior: $200,000+',
      links: ['https://www.bls.gov/oes/current/oes151251.htm']
    }
  ]

  // Seed question templates
  const questionTemplates = [
    // Personality bucket
    {
      bucket: 'personality',
      pattern: 'When stressed, can you follow protocols precisely rather than improvise?',
      weight: 8
    },
    {
      bucket: 'personality',
      pattern: 'Do you prefer working independently or as part of a team?',
      weight: 6
    },
    {
      bucket: 'personality',
      pattern: 'Are you comfortable making high-stakes decisions quickly?',
      weight: 7
    },
    // Daily reality bucket
    {
      bucket: 'daily',
      pattern: 'Are you okay with 50-70% of your shift being {routine_task} rather than {exciting_task}?',
      weight: 6
    },
    {
      bucket: 'daily',
      pattern: 'Can you handle {physical_demand} on a regular basis?',
      weight: 5
    },
    {
      bucket: 'daily',
      pattern: 'Are you comfortable with {technology_requirement}?',
      weight: 4
    },
    // Commitment bucket
    {
      bucket: 'commitment',
      pattern: 'Are you willing to complete {training_duration} before you can practice in {state}?',
      weight: 10
    },
    {
      bucket: 'commitment',
      pattern: 'Can you commit to {ongoing_requirement} for the duration of your career?',
      weight: 8
    },
    {
      bucket: 'commitment',
      pattern: 'Are you prepared to invest {financial_commitment} in your career development?',
      weight: 7
    },
    // Lifestyle bucket
    {
      bucket: 'lifestyle',
      pattern: 'Can you work {schedule_requirement}?',
      weight: 6
    },
    {
      bucket: 'lifestyle',
      pattern: 'Are you willing to relocate for better opportunities?',
      weight: 5
    },
    {
      bucket: 'lifestyle',
      pattern: 'Can you handle {work_life_balance_challenge}?',
      weight: 4
    },
    // Entry bucket
    {
      bucket: 'entry',
      pattern: 'Do you have {prerequisite_requirement}?',
      weight: 9
    },
    {
      bucket: 'entry',
      pattern: 'Are you prepared to start at {entry_level_position}?',
      weight: 6
    },
    // Unsexy bucket
    {
      bucket: 'unsexy',
      pattern: 'Are you fine with {unpleasant_aspect}?',
      weight: 5
    },
    {
      bucket: 'unsexy',
      pattern: 'Can you handle {boring_task} as part of your daily routine?',
      weight: 4
    }
  ]

  // Seed careers
  const careers = [
    {
      title: 'Registered Nurse',
      usTags: ['healthcare', 'medical', 'patient-care', 'clinical'],
      personality: ['conscientious', 'empathetic', 'detail-oriented', 'stress-tolerant'],
      realities: ['charting', 'medication-administration', 'patient-assessment', 'shift-work', 'physical-demand']
    },
    {
      title: 'Real Estate Agent',
      usTags: ['sales', 'property', 'commission', 'flexible-schedule'],
      personality: ['outgoing', 'persistent', 'self-motivated', 'people-oriented'],
      realities: ['cold-calling', 'showings', 'paperwork', 'irregular-income', 'weekend-work']
    },
    {
      title: 'Software Engineer',
      usTags: ['technology', 'programming', 'problem-solving', 'remote-friendly'],
      personality: ['analytical', 'logical', 'detail-oriented', 'continuous-learner'],
      realities: ['debugging', 'code-reviews', 'meetings', 'deadline-pressure', 'sitting-desk-work']
    },
    {
      title: 'Licensed Therapist',
      usTags: ['mental-health', 'counseling', 'helping-profession', 'private-practice'],
      personality: ['empathetic', 'patient', 'good-listener', 'emotionally-stable'],
      realities: ['client-sessions', 'documentation', 'insurance-billing', 'emotional-drain', 'irregular-schedule']
    },
    {
      title: 'Teacher',
      usTags: ['education', 'children', 'public-service', 'summers-off'],
      personality: ['patient', 'creative', 'organized', 'passionate-about-learning'],
      realities: ['lesson-planning', 'grading', 'parent-conferences', 'classroom-management', 'low-pay']
    }
  ]

  // Insert career facts
  for (const fact of careerFacts) {
    await prisma.careerFact.upsert({
      where: {
        state_role: {
          state: fact.state,
          role: fact.role
        }
      },
      update: fact,
      create: fact
    })
  }

  // Insert question templates
  for (const template of questionTemplates) {
    await prisma.questionTemplate.create({
      data: template
    })
  }

  // Insert careers
  for (const career of careers) {
    await prisma.career.create({
      data: career
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
