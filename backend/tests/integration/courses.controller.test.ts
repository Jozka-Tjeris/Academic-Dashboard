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