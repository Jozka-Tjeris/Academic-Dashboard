import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { CourseBackend } from "../../src/types/backendTypes";
import { TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";

const testId = uuidv4().split('-')[0];
const COURSE_FOR_GET = `GET_Test_Course_${testId}`;
const COURSE_FOR_DELETE = `DELETE_Test_Course_${testId}`;

describe("Courses controller test", () => {
  let token: string;
  let userId: string;
  let csrfToken: string;

  beforeAll(async () => {
    csrfToken = "test-csrf_token";

    await prisma.course.deleteMany({
      where: { name: { contains: testId } }
    });
    await prisma.user.deleteMany({
      where: { id: userId }
    });
    
    const user = await prisma.user.create({
      data: {
        googleId: `google-test-${testId}`,
        email: `coursetest-${testId}@gmail.com`,
        name: "Course Test User"
      }
    });

    userId = user.id;

    await prisma.course.createMany({
      data: [
        { userId, name: COURSE_FOR_GET },
        { userId, name: COURSE_FOR_DELETE },
      ]
    });

    token = jwt.sign({
      sub: userId,
      email: user.email,
    }, 
    process.env.JWT_SECRET!, 
    {
      expiresIn: "1m",
    });
  });

  afterAll(async () => {
    await prisma.course.deleteMany({
      where: { name: { contains: testId } }
    });
    await prisma.user.deleteMany({
      where: { id: userId }
    });
  });

  describe("POST /courses", () => {
    it("creates a new course", async () => {
      const res = await request(app)
        .post("/courses")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ name: "Calculus 101", description: "Intro course" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("courseId");
      expect(res.body.name).toBe("Calculus 101");
    });

    it("fails if name is missing", async () => {
      const res = await request(app)
        .post("/courses")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Course name is required and must be a string");
    });

    it("returns 401 if not authenticated", async () => {
      const res = await request(app).post("/courses");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /courses", () => {
    it("returns courses with grade summary", async () => {
      const res = await request(app)
        .get("/courses")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`]);

      const myCourse = res.body.find((c: CourseBackend) => c.name === COURSE_FOR_GET);
      expect(res.status).toBe(200);
      expect(myCourse).toBeDefined();
      expect(myCourse).toHaveProperty("gradeSummary");
    });

    it("returns 401 if not authenticated", async () => {
      const res = await request(app).get("/courses");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /courses/:id", () => {
    let courseId: string;

    beforeAll(async () => {
      const course = await prisma.course.create({
        data: {
          userId: userId,
          name: "TEST_Physics",
        },
      });

      courseId = course.courseId;
    });

    it("returns course with assessments and grade summary", async () => {
      const res = await request(app)
        .get(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("courseId", courseId);
      expect(res.body).toHaveProperty("assessments");
      expect(res.body).toHaveProperty("gradeSummary");
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .get("/courses/nonexistent-id")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /courses/:id", () => {
    let courseId: string;

    beforeAll(async () => {
      const course = await prisma.course.create({
        data: {
          userId,
          name: `UPDATE_Test_Course_${testId}`,
          description: "before update",
        },
      });

      courseId = course.courseId;
    });

    it("updates a course", async () => {
      const res = await request(app)
        .patch(`/courses/${courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({
          name: "Updated Course Name",
          description: "updated description",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("courseId", courseId);
      expect(res.body.name).toBe("Updated Course Name");
      expect(res.body.description).toBe("updated description");
    });

    it("updates the course in the database", async () => {
      const course = await prisma.course.create({
        data: {
          userId,
          name: `UPDATE_DB_Test_${testId}`,
          description: "before",
        },
      });

      const res = await request(app)
        .patch(`/courses/${course.courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({
          name: "Updated DB Name",
          description: "after",
        });

      expect(res.status).toBe(200);

      const updated = await prisma.course.findFirst({
        where: { courseId: course.courseId },
      });

      expect(updated?.name).toBe("Updated DB Name");
      expect(updated?.description).toBe("after");
    });

    it("returns 404 if course does not exist", async () => {
      const res = await request(app)
        .patch("/courses/nonexistent-id")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({
          name: "Updated Course Name",
        });

      expect(res.status).toBe(404);
    });

    it("returns 401 if unauthenticated", async () => {
      const res = await request(app)
        .patch(`/courses/${courseId}`)
        .send({
          name: "Updated Course Name",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /courses/:id/simulate", () => {
    let courseId: string;

    beforeAll(async () => {
      const course = await prisma.course.create({
        data: {
          userId,
          name: `SIMULATE_Test_Course_${testId}`,
        },
      });

      courseId = course.courseId;

      await prisma.assessment.createMany({
        data: [
          {
            userId,
            courseId,
            assessmentId: `SIM_A_${testId}`,
            title: `SIM_A_${testId}`,
            dueDate: new Date(),
            weight: 0.5,
            submissionDate: new Date(),
            score: 80,
            maxScore: 100,
          },
          {
            userId,
            courseId,
            assessmentId: `SIM_B_${testId}`,
            title: `SIM_B_${testId}`,
            dueDate: new Date(),
            weight: 0.5,
            submissionDate: new Date(),
            maxScore: 100,
          },
        ],
      });
    });

    it("calculates course grade simulation", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/simulate`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({
          simulations: [
            { assessmentId: `SIM_B_${testId}`, simulatedScore: 90 }
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("currentGrade");
      expect(res.body).toHaveProperty("maxPossibleGrade");
      expect(res.body).toHaveProperty("simulatedFinalGrade");

      expect(typeof res.body.currentGrade).toBe("number");
      expect(typeof res.body.simulatedFinalGrade).toBe("number");
    });

    it("rejects invalid simulations payload", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/simulate`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({
          simulations: "not-an-array",
        });

      expect(res.status).toBe(400);
    });

    it("returns 401 if unauthenticated", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/simulate`);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /courses/:id/analytics", () => {
    let courseId: string;

    beforeAll(async () => {
      const course = await prisma.course.create({
        data: {
          userId,
          name: `ANALYTICS_Test_Course_${testId}`,
        },
      });

      courseId = course.courseId;

      await prisma.assessment.createMany({
        data: [
          {
            userId,
            courseId,
            title: `AN_A_${testId}`,
            dueDate: new Date(),
            weight: 0.4,
            submissionDate: new Date(),
            score: 75,
            maxScore: 100,
          },
          {
            userId,
            courseId,
            title: `AN_B_${testId}`,
            dueDate: new Date(),
            weight: 0.4,
            submissionDate: new Date(),
            maxScore: 100,
          },
        ],
      });
    });

    it("returns course analytics", async () => {
      const res = await request(app)
        .get(`/courses/${courseId}/analytics?date=${new Date().toISOString()}`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });

    it("returns 401 if unauthenticated", async () => {
      const res = await request(app)
        .get(`/courses/${courseId}/analytics`);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /courses/:id/dashboard", () => {
    let courseId: string;

    beforeAll(async () => {
      const course = await prisma.course.create({
        data: {
          userId,
          name: `DASHBOARD_Test_Course_${testId}`,
        },
      });

      courseId = course.courseId;

      await prisma.assessment.createMany({
        data: [
          {
            userId,
            courseId,
            title: `DB_A_${testId}`,
            dueDate: new Date(Date.now() + TWENTYFOUR_HOURS_IN_MS),
            weight: 0.5,
            submissionDate: null,
            maxScore: 100,
          },
          {
            userId,
            courseId,
            title: `DB_B_${testId}`,
            dueDate: new Date(),
            weight: 0.5,
            submissionDate: new Date(),
            score: 88,
            maxScore: 100,
          },
        ],
      });
    });

    it("returns course dashboard data", async () => {
      const res = await request(app)
        .get(`/courses/${courseId}/dashboard?date=${new Date().toISOString()}`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toBeDefined();
    });

    it("returns 401 if unauthenticated", async () => {
      const res = await request(app)
        .get(`/courses/${courseId}/dashboard`);

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /courses/:id", () => {
    it("deletes a course", async () => {
      const course = await prisma.course.findFirst({ where: { name: COURSE_FOR_DELETE } });
      expect(course).not.toBeNull();

      const res = await request(app)
        .delete(`/courses/${course?.courseId}`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Course deleted successfully");
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .delete("/courses/nonexistent-id")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /courses/:id/goal", () => {
    let courseId: string;

    beforeAll(async () => {
      const course = await prisma.course.create({
        data:  {
          userId,
          name: `GOAL_Test_Course_${testId}`,
          description: "",
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-03-10"),
          color: "#ffffff",
        }
      });

      courseId = course.courseId;

      await prisma.assessment.create({
        data: {
          courseId,
          userId,
          title: "Midterm",
          description: null,
          dueDate: new Date("2026-03-15"),
          createdAt: new Date("2026-03-10"),
          updatedAt: new Date("2026-03-10"),
          weight: 0.4,
          maxScore: 100,
          score: 80,
          submissionDate: null,
        },
      });
    });

    it("calculates the grade goal successfully", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/goal`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ targetGrade: 0.85 });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("possible");
    });

    it("returns 404 if course not found", async () => {
      const res = await request(app)
        .post("/courses/course-invalid-id/goal")
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({ targetGrade: 0.9 });

      expect(res.status).toBe(404);
    });

    it("returns 400 if targetGrade is missing", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/goal`)
        .set('Authorization', `Bearer ${token}`)
        .set("Cookie", [`access_token=${token}`, `csrf_token=${csrfToken}`])
        .set("X-CSRF-Token", csrfToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Invalid targetGrade");
    });

    it("returns 401 if not authenticated", async () => {
      const res = await request(app)
        .post(`/courses/${courseId}/goal`)
        .send({ targetGrade: 0.85 });

      expect(res.status).toBe(401);
    });
  });
});
