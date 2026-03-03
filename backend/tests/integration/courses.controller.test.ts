import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const testId = uuidv4().split('-')[0];
const COURSE_FOR_GET = `GET_Test_Course_${testId}`;
const COURSE_FOR_DELETE = `DELETE_Test_Course_${testId}`;

describe("Courses controller test", () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
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
        .set("Cookie", [`access_token=${token}`])
        .send({ name: "Calculus 101", description: "Intro course" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("courseId");
      expect(res.body.name).toBe("Calculus 101");
    });

    it("fails if name is missing", async () => {
      const res = await request(app)
        .post("/courses")
        .set("Cookie", [`access_token=${token}`])
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
        .set("Cookie", [`access_token=${token}`]);

      const myCourse = res.body.find((c: any) => c.name === COURSE_FOR_GET);
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
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("courseId", courseId);
      expect(res.body).toHaveProperty("assessments");
      expect(res.body).toHaveProperty("gradeSummary");
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .get("/courses/nonexistent-id")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /courses/:id", () => {
    it("deletes a course", async () => {
      const course = await prisma.course.findFirst({ where: { name: COURSE_FOR_DELETE } });
      expect(course).not.toBeNull();

      const res = await request(app)
        .delete(`/courses/${course?.courseId}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Course deleted successfully");
    });

    it("returns 404 for invalid id", async () => {
      const res = await request(app)
        .delete("/courses/nonexistent-id")
        .set("Cookie", [`access_token=${token}`]);

      expect(res.status).toBe(404);
    });
  });
});
