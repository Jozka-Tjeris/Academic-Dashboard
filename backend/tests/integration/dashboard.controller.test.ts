import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";

const testId = uuidv4().split("-")[0];

describe("Dashboard controller", () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    await prisma.assessment.deleteMany({
      where: { title: { contains: testId } }
    });

    await prisma.course.deleteMany({
      where: { name: { contains: testId } }
    });

    const user = await prisma.user.create({
      data: {
        googleId: `google-dashboard-${testId}`,
        email: `dashboard-${testId}@gmail.com`,
        name: "Dashboard Test User"
      }
    });

    userId = user.id;

    const course = await prisma.course.create({
      data: {
        userId,
        name: `Dashboard_Test_Course_${testId}`
      }
    });

    await prisma.assessment.createMany({
      data: [
        {
          userId,
          courseId: course.courseId,
          title: `DB_A_${testId}`,
          dueDate: new Date(Date.now() + TWENTYFOUR_HOURS_IN_MS),
          weight: 0.3,
          submitted: false,
          maxScore: 100,
        },
        {
          userId,
          courseId: course.courseId,
          title: `DB_B_${testId}`,
          dueDate: new Date(Date.now() + 3 * TWENTYFOUR_HOURS_IN_MS),
          weight: 0.7,
          submitted: false,
          maxScore: 100,
        },
      ],
    });

    token = jwt.sign(
      {
        sub: userId,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "5m",
      }
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

  describe("GET /dashboard", () => {

    it("returns dashboard data for authenticated user", async () => {

      const res = await request(app)
        .get("/dashboard")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);

      expect(res.body).toHaveProperty("courses");
      expect(res.body).toHaveProperty("workload");
      expect(res.body).toHaveProperty("collisions");

    });

    it("returns courses with gradeSummary", async () => {

      const res = await request(app)
        .get("/dashboard")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);

      expect(res.body.courses.length).toBeGreaterThan(0);

      const course = res.body.courses[0];

      expect(course).toHaveProperty("gradeSummary");
      expect(course.gradeSummary).toHaveProperty("currentGrade");
      expect(course.gradeSummary).toHaveProperty("maxPossibleGrade");

    });

    it("returns workload statistics", async () => {

      const res = await request(app)
        .get("/dashboard")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);

      expect(res.body.workload).toHaveProperty("upcomingAssessments");
      expect(res.body.workload).toHaveProperty("stats");

    });

    it("supports date query parameter", async () => {

      const res = await request(app)
        .get(`/dashboard?date=${new Date().toISOString()}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);

      expect(res.body).toBeDefined();

    });

    it("returns empty dashboard for users with no courses", async () => {

      const user = await prisma.user.create({
        data: {
          googleId: `google-empty-${testId}`,
          email: `empty-${testId}@gmail.com`,
          name: "Empty Dashboard User"
        }
      });

      const emptyToken = jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "5m" }
      );

      const res = await request(app)
        .get("/dashboard")
        .set("Cookie", [`access_token=${emptyToken}`]);

      expect(res.status).toBe(200);

      expect(res.body.courses).toEqual([]);

      await prisma.user.delete({
        where: { id: user.id }
      });

    });

    it("returns 401 if not authenticated", async () => {
      const res = await request(app)
        .get("/dashboard");

      expect(res.status).toBe(401);

    });
  });
});
