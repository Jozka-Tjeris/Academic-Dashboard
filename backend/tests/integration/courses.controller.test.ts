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
