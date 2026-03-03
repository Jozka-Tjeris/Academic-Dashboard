import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { AssessmentStatus, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

const testId = Math.random().toString(36).substring(7);
const COURSE_NAME = `GET_Test_Course_${testId}`;
const COURSE_FOR_OVERFLOW = `OVERFLOW_Test_Course_${testId}`;
const COURSE_FOR_PUT = `PUT_Test_Course_${testId}`;
const ASSESS_FOR_DELETE = `DELETE_Test_Assess_${testId}`;
const ASSESS_FOR_WEIGHT_OVERFLOW = `OVERFLOW_Test_Assess_${testId}`;

describe("Assessments controller", () => {
  let token: string;
  let userId: string;
  let courseId: string;
  let courseId_overflow: string;

  beforeAll(async () => {
    await prisma.assessment.deleteMany({
      where: { title: { contains: testId } }
    });
    await prisma.course.deleteMany({
      where: { name: { contains: testId } }
    });
    await prisma.user.deleteMany({
      where: { id: userId }
    });  
     
    const user = await prisma.user.create({
      data: {
        googleId: `google-test-${testId}`,
        email: `assesstest-${testId}@gmail.com`,
        name: "Assessment Test User"
      }
    });

    userId = user.id;

    const course = await prisma.course.create({
      data: 
        { userId, name: COURSE_NAME },
    });

    const courseOverflow = await prisma.course.create({
      data: 
        { userId, name: COURSE_FOR_OVERFLOW },
    });

    courseId = course.courseId;
    courseId_overflow = courseOverflow.courseId;

    await prisma.assessment.createMany({
      data: [
        { courseId, userId, title: ASSESS_FOR_DELETE, dueDate: new Date(), 
          status: AssessmentStatus.UPCOMING, weight: new Prisma.Decimal(0), submitted: false },
        { courseId, userId, title: ASSESS_FOR_WEIGHT_OVERFLOW, dueDate: new Date(), 
          status: AssessmentStatus.UPCOMING, weight: new Prisma.Decimal(80), submitted: false },
      ]
    })

    token = jwt.sign(
      { sub: userId, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1m" }
    );
  });

  afterAll(async () => {
    await prisma.assessment.deleteMany({
      where: { title: { contains: testId } }
    });
    await prisma.course.deleteMany({
      where: { name: { contains: testId } }
    });
    await prisma.user.deleteMany({
      where: { id: userId }
    });
  });

  describe("POST /courses/:id/assessments", () => {
    it("creates an assessment", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/assessments`)
        .set("Cookie", [`access_token=${token}`])
        .send({
          title: "Midterm",
          dueDate: new Date().toISOString(),
          weight: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("assessmentId");
      expect(res.body.weight).toBe(10);
    });

    it("rejects if total weight exceeds 100", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/assessments`)
        .set("Cookie", [`access_token=${token}`])
        .send({
          title: "Another",
          dueDate: new Date().toISOString(),
          weight: 30,
        });

      expect(res.status).toBe(400);
    });

    it("returns 401 if not authenticated", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/assessments`)
        .send({
          title: "Midterm",
          dueDate: new Date().toISOString(),
          weight: 10,
        });

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /assessments/:id", () => {
    let assessId_for_put: string;

    beforeAll(async () => {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          courseId: courseId_overflow,
          title: "Quiz 1",
          dueDate: new Date(),
          weight: 20,
          submitted: false,
          status: AssessmentStatus.UPCOMING,
          maxScore: 100,
        },
      });

      assessId_for_put = assessment.assessmentId;
    });

    it("updates score successfully", async () => {
      const res = await request(app)
        .put(`/assessments/${assessId_for_put}`)
        .set("Cookie", [`access_token=${token}`])
        .send({ score: 85 });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(85);
    });

    it("rejects score above maxScore", async () => {
      const res = await request(app)
        .put(`/assessments/${assessId_for_put}`)
        .set("Cookie", [`access_token=${token}`])
        .send({ score: 150 });

      expect(res.status).toBe(400);
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .put("/assessments/nonexistent-id")
        .set("Cookie", [`access_token=${token}`])
        .send({ score: 50 });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /assessments/:id", () => {
    it("deletes an assessment", async () => {
      const assessment = await prisma.assessment.findFirst({ where: { title: ASSESS_FOR_DELETE } });
      expect(assessment).not.toBeNull();

      const res = await request(app)
        .delete(`/assessments/${assessment?.assessmentId}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Assessment deleted successfully");
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .delete("/assessments/nonexistent-id")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(404);
    });
  });
});
