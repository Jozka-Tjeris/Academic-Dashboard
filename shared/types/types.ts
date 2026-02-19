
export type Course = {
  courseId: string,
  name: string,
  description: string | null,
  createdAt: Date,
  updatedAt: Date,
}

export type AssessmentStatus = 'upcoming' | 'submitted' | 'overdue';

export type Assessment = {
  assessmentId: string,
  courseId: string,
  title: string,
  description: string | null,
  dueDate: Date,
  status: AssessmentStatus,
  score: number | null,
  targetScore: number | null,
  maxScore: number | null,
  weight: number,
  latePenalty: number | null,
  isSimulated: boolean | null,
  createdAt: Date,
  updatedAt: Date,
}