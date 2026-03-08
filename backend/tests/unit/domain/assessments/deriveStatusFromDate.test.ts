import { AssessmentStatus, Prisma } from "@prisma/client";
import { deriveStatusFromDate } from "../../../../src/domain/assessments/deriveStatusFromDate";

describe("Status", () => {
  describe("deriveStatusFromDate", () => {
    test("returns graded if score exists and submitted is true", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        new Prisma.Decimal(80),
        true,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatus.GRADED);
    });

    test("returns submitted if submitted is true but no grade", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        true,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatus.SUBMITTED);
    });

    test("returns overdue if past due and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        false,
        new Date("2026-01-05")
      );
      expect(status).toBe(AssessmentStatus.OVERDUE);
    });

    test("returns due in 24 hours if dates are same and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        false,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatus.DUE_IN_24_HOURS);
    });

    test("returns upcoming if due in future and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        false,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatus.UPCOMING);
    });
  });
});

describe("Status - Hours, Minutes and Seconds", () => {
  test("returns overdue if past due and no score and not submitted", () => {
    const statusHour = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T12:00:00")
    );
    expect(statusHour).toBe(AssessmentStatus.OVERDUE);

    const statusMin = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T11:01:00")
    );
    expect(statusMin).toBe(AssessmentStatus.OVERDUE);

    const statusSec = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T11:00:01")
    );
    expect(statusSec).toBe(AssessmentStatus.OVERDUE);
  });

  test("returns due in 24 hours if time period is within 24 hours and no score and not submitted", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-02T12:00:00"),
      null,
      false,
      new Date("2026-01-01T21:00:00")
    );
    expect(status).toBe(AssessmentStatus.DUE_IN_24_HOURS);
  });
});

describe("Status - Edge cases (grade exists, not submitted); ignore the score and only check the dates", () => {
  test("due date is not reached yet, so it should return upcoming", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-10"),
      new Prisma.Decimal(80),
      false,
      new Date("2026-01-01")
    );
    expect(status).toBe(AssessmentStatus.UPCOMING);
  });

  test("dates are close, should return due in 24 hours", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-01"),
      new Prisma.Decimal(80),
      false,
      new Date("2026-01-01")
    );
    expect(status).toBe(AssessmentStatus.DUE_IN_24_HOURS);
  });

  test("due date passed, should return overdue", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-01"),
      new Prisma.Decimal(80),
      false,
      new Date("2026-01-02")
    );
    expect(status).toBe(AssessmentStatus.OVERDUE);
  });
})
