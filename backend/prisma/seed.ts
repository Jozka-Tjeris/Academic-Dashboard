import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { TWENTYFOUR_HOURS_IN_MS, AssessmentStatus } from '@internal_package/shared';
import { validateTestEnvironment } from './db-guard';

validateTestEnvironment();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ Seed script must not run in production!');
  }

  console.log('Seeding test database...');

  // Clear existing data
  await prisma.assessment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      googleId: 'google-test-123',
      name: 'Test User',
      email: 'testuser@example.com',
      emailVerified: new Date(),
      image: 'none',
    },
  });

  // Create courses
  const coursesData = [
    {
      courseId: 'course1',
      userId: user.id,
      name: 'Intro to AI',
      description: 'Basics of Artificial Intelligence',
    },
    {
      courseId: 'course2',
      userId: user.id,
      name: 'Web Development',
      description: 'Fullstack web development',
    },
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { courseId: c.courseId },
      update: {},
      create: c,
    });
    courses.push(course);
  }

  // Create assessments
  const assessmentsData = [
    {
      assessmentId: 'assessment1',
      userId: user.id,
      courseId: 'course1',
      title: 'AI Midterm',
      description: 'Midterm exam covering AI basics',
      dueDate: new Date(Date.now() + 7 * TWENTYFOUR_HOURS_IN_MS),
      status: AssessmentStatus.UPCOMING,
      score: null,
      targetScore: 90,
      weight: 20,
      latePenalty: 5,
      maxScore: 100,
      submitted: false,
    },
    {
      assessmentId: 'assessment2',
      userId: user.id,
      courseId: 'course2',
      title: 'Web Final Project',
      description: 'Final project for web development course',
      dueDate: new Date(Date.now() + 14 * TWENTYFOUR_HOURS_IN_MS),
      status: AssessmentStatus.UPCOMING,
      score: null,
      targetScore: 95,
      weight: 30,
      latePenalty: 10,
      maxScore: 100,
      submitted: false,
    },
  ];

  for (const a of assessmentsData) {
    await prisma.assessment.upsert({
      where: { assessmentId: a.assessmentId },
      update: {},
      create: a,
    });
  }

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });