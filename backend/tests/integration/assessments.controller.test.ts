import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/lib/prisma";

describe.skip("POST /courses/:id/assessments", () => {
  let token: string;
  let courseId: string;

  beforeAll(async () => {
    token = "test-jwt-token";

    const course = await prisma.course.create({
      data: {
        userId: "test-user-id",
        name: "TEST_Biology",
      },
    });

    courseId = course.courseId;
  });

  afterAll(async () => {
    await prisma.course.deleteMany({
      where: { name: { startsWith: "TEST_" } },
    });
  });

  it("creates an assessment", async () => {
    const res = await request(app)
      .post(`/courses/${courseId}/assessments`)
      .set("Cookie", [`access_token=${token}`])
      .send({
        title: "Midterm",
        dueDate: new Date().toISOString(),
        weight: 30,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("assessmentId");
    expect(res.body.weight).toBe(30);
  });

  it("rejects if total weight exceeds 100", async () => {
    await prisma.assessment.create({
      data: {
        userId: "test-user-id",
        courseId,
        title: "Existing",
        dueDate: new Date(),
        weight: 80,
        submitted: false,
        status: "Pending",
      },
    });

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
});