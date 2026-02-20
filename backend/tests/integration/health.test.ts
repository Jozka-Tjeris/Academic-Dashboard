import request from "supertest";
import { app } from "@/app";
import { server } from "@/server";

describe("Health routes", () => {
  it("should return liveness", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("should return readiness", async () => {
    const res = await request(app).get("/health/ready");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ready");
  });
});

afterAll(async () => {
  if (server && server.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
});