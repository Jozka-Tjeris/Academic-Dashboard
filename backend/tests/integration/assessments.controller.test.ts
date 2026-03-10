import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { AssessmentStatus } from "@internal_package/shared";

const testId = uuidv4().split('-')[0];
const COURSE_NAME = `GET_Test_Course_${testId}`;
const COURSE_FOR_OVERFLOW = `OVERFLOW_Test_Course_${testId}`;
const ASSESS_FOR_DELETE = `DELETE_Test_Assess_${testId}`;
const ASSESS_FOR_WEIGHT_OVERFLOW = `OVERFLOW_Test_Assess_${testId}`;

describe("Assessments controller", () => {
  let token: string;
  let userId: string;
  let courseId: string;
  let courseId_overflow: string;
  let csrfToken: string;

  beforeAll(async () => {
    csrfToken = "test-csrf_token";

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
          weight: new Prisma.Decimal(0), submitted: false },
        { courseId, userId, title: ASSESS_FOR_WEIGHT_OVERFLOW, dueDate: new Date(), 
          weight: new Prisma.Decimal(80), submitted: false },
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
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
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
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
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

  describe("PATCH /assessments/:id", () => {
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
          maxScore: 100,
        },
      });

      assessId_for_put = assessment.assessmentId;
    });

    it("updates score successfully", async () => {
      const res = await request(app)
        .patch(`/assessments/${assessId_for_put}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ score: 85 });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(85);
    });

    it("rejects score above maxScore", async () => {
      const res = await request(app)
        .patch(`/assessments/${assessId_for_put}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ score: 150 });

      expect(res.status).toBe(400);
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .patch("/assessments/nonexistent-id")
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ score: 50 });

      expect(res.status).toBe(404);
    });

    it("sets submitted=true when score is provided", async () => {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          courseId,
          title: `PATCH_RULE_Test_${testId}`,
          dueDate: new Date(),
          weight: new Prisma.Decimal(10),
          submitted: false,
          maxScore: new Prisma.Decimal(100),
        },
      });

      const res = await request(app)
        .patch(`/assessments/${assessment.assessmentId}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ score: 70 });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(70);
      expect(res.body.submitted).toBe(true);
    });
  });

  describe("GET /assessments/:id", () => {
    let assessmentId: string;

    beforeAll(async () => {
      const assessment = await prisma.assessment.create({
        data: {
          userId,
          courseId,
          title: `FETCH_Test_Assess_${testId}`,
          dueDate: new Date(),
          weight: new Prisma.Decimal(15),
          submitted: false,
          maxScore: new Prisma.Decimal(100),
        },
      });

      assessmentId = assessment.assessmentId;
    });

    it("fetches an assessment successfully", async () => {
      const res = await request(app)
        .get(`/assessments/${assessmentId}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("assessment");

      const assessment = res.body.assessment;

      expect(assessment.assessmentId).toBe(assessmentId);
      expect(assessment.weight).toBe(15);
      expect(typeof assessment.status).toBe(typeof AssessmentStatus.UPCOMING);
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .get("/assessments/nonexistent-id")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(404);
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .get(`/assessments/${assessmentId}`);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /assessments/collisions", () => {
    beforeAll(async () => {
      const baseDate = new Date("2026-03-10T00:00:00.000Z");

      await prisma.assessment.createMany({
        data: [
          {
            userId,
            courseId,
            title: `COLLISION_A_${testId}`,
            dueDate: baseDate,
            weight: new Prisma.Decimal(0.5),
            submitted: false,
          },
          {
            userId,
            courseId,
            title: `COLLISION_B_${testId}`,
            dueDate: baseDate,
            weight: new Prisma.Decimal(0.5),
            submitted: false,
          },
        ],
      });
    });

    it("returns collisions when assessments fall in same window", async () => {
      const res = await request(app)
        .get("/assessments/collisions")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty("clusters");
      expect(Array.isArray(res.body.clusters)).toBe(true);

      const cluster = res.body.clusters[0];

      expect(cluster).toHaveProperty("assessmentIds");
      expect(cluster).toHaveProperty("count");
      expect(cluster.count).toBeGreaterThanOrEqual(2);
    });

    it("respects days query filter", async () => {
      const res = await request(app)
        .get("/assessments/collisions?days=1")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("clusters");
    });

    it("returns 401 when not authenticated", async () => {
      const res = await request(app)
        .get("/assessments/collisions");

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /assessments/:id", () => {
    it("deletes an assessment", async () => {
      const assessment = await prisma.assessment.findFirst({ where: { title: ASSESS_FOR_DELETE } });
      expect(assessment).not.toBeNull();

      const res = await request(app)
        .delete(`/assessments/${assessment?.assessmentId}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Assessment deleted successfully");
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .delete("/assessments/nonexistent-id")
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken);

      expect(res.status).toBe(404);
    });
  });
});
