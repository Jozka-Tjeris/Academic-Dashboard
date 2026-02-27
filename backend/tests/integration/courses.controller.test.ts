import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

describe.skip("POST /courses", () => {
  // TODO: enable once Docker test DB container is configured
  let token: string;

  beforeAll(async () => {
    // generate JWT for test user
    token = "test-jwt-token"; // replace with real JWT generation if needed
  });

  afterAll(async () => {
    await prisma.course.deleteMany();
  });

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
});

describe.skip("GET /courses", () => {
  // TODO: enable once Docker test DB container is configured
  let token: string;

  beforeAll(async () => {
    // generate JWT for test user
    token = "test-jwt-token"; // replace with real JWT generation
  });

  beforeEach(async () => {
    await prisma.course.create({
      data: {
        userId: "test-user-id",
        name: "TEST_Calculus 101",
        description: "Integration test course",
      },
    });
  });

  afterEach(async () => {
    await prisma.course.deleteMany({ where: { name: { startsWith: "TEST_" } } });
  });

  it("returns courses with grade summary", async () => {
    const res = await request(app)
      .get("/courses")
      .set("Cookie", [`access_token=${token}`]);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("gradeSummary");
  });

  it("returns 401 if not authenticated", async () => {
    const res = await request(app).get("/courses");
    expect(res.status).toBe(401);
  });
});

describe.skip("GET /courses/:id", () => {
  let token: string;
  let courseId: string;

  beforeAll(async () => {
    token = "test-jwt-token"; // replace with real JWT generation

    const course = await prisma.course.create({
      data: {
        userId: "test-user-id",
        name: "TEST_Physics",
      },
    });

    courseId = course.courseId;
  });

  afterAll(async () => {
    await prisma.course.deleteMany({
      where: { name: { startsWith: "TEST_" } },
    });
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

describe.skip("DELETE /courses/:id", () => {
  let token: string;
  let courseId: string;

  beforeAll(async () => {
    token = "test-jwt-token";

    const course = await prisma.course.create({
      data: {
        userId: "test-user-id",
        name: "TEST_DeleteMe",
      },
    });

    courseId = course.courseId;
  });

  it("deletes a course", async () => {
    const res = await request(app)
      .delete(`/courses/${courseId}`)
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
