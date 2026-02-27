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

describe.skip("PUT /assessments/:id", () => {
  let token: string;
  let assessmentId: string;

  beforeAll(async () => {
    token = "test-jwt-token";

    const course = await prisma.course.create({
      data: {
        userId: "test-user-id",
        name: "TEST_Chemistry",
      },
    });

    const assessment = await prisma.assessment.create({
      data: {
        userId: "test-user-id",
        courseId: course.courseId,
        title: "Quiz 1",
        dueDate: new Date(),
        weight: 20,
        submitted: false,
        status: "Pending",
        maxScore: 100,
      },
    });

    assessmentId = assessment.assessmentId;
  });

  afterAll(async () => {
    await prisma.course.deleteMany({
      where: { name: { startsWith: "TEST_" } },
    });
  });

  it("updates score successfully", async () => {
    const res = await request(app)
      .put(`/assessments/${assessmentId}`)
      .set("Cookie", [`access_token=${token}`])
      .send({ score: 85 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(85);
  });

  it("rejects score above maxScore", async () => {
    const res = await request(app)
      .put(`/assessments/${assessmentId}`)
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

describe.skip("DELETE /assessments/:id", () => {
  let token: string;
  let assessmentId: string;

  beforeAll(async () => {
    token = "test-jwt-token";

    const course = await prisma.course.create({
      data: {
        userId: "test-user-id",
        name: "TEST_DeleteAssessmentCourse",
      },
    });

    const assessment = await prisma.assessment.create({
      data: {
        userId: "test-user-id",
        courseId: course.courseId,
        title: "Delete Quiz",
        dueDate: new Date(),
        weight: 10,
        submitted: false,
        status: "Pending",
      },
    });

    assessmentId = assessment.assessmentId;
  });

  it("deletes an assessment", async () => {
    const res = await request(app)
      .delete(`/assessments/${assessmentId}`)
      .set("Cookie", [`access_token=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Assessment deleted successfully"
    );
  });
});
