import { Prisma } from "@prisma/client";
import { deriveStatusFromDate } from "../../../../src/domain/assessments/deriveStatusFromDate";
import { AssessmentStatuses } from "@internal_package/shared";

describe("Status", () => {
  describe("deriveStatusFromDate", () => {
    test("returns graded if score exists and submitted is true", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        new Prisma.Decimal(80),
        true,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatuses.GRADED);
    });

    test("returns submitted if submitted is true but no grade", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        true,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatuses.SUBMITTED);
    });

    test("returns overdue if past due and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        false,
        new Date("2026-01-05")
      );
      expect(status).toBe(AssessmentStatuses.OVERDUE);
    });

    test("returns due in 24 hours if dates are same and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        false,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatuses.DUE_IN_48_HOURS);
    });

    test("returns upcoming if due in future and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        false,
        new Date("2026-01-01")
      );
      expect(status).toBe(AssessmentStatuses.UPCOMING);
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
    expect(statusHour).toBe(AssessmentStatuses.OVERDUE);

    const statusMin = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T11:01:00")
    );
    expect(statusMin).toBe(AssessmentStatuses.OVERDUE);

    const statusSec = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T11:00:01")
    );
    expect(statusSec).toBe(AssessmentStatuses.OVERDUE);
  });

  test("returns due in 24 hours if time period is within 24 hours and no score and not submitted", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-02T12:00:00"),
      null,
      false,
      new Date("2026-01-01T21:00:00")
    );
    expect(status).toBe(AssessmentStatuses.DUE_IN_48_HOURS);
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
    expect(status).toBe(AssessmentStatuses.UPCOMING);
  });

  test("dates are close, should return due in 24 hours", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-01"),
      new Prisma.Decimal(80),
      false,
      new Date("2026-01-01")
    );
    expect(status).toBe(AssessmentStatuses.DUE_IN_48_HOURS);
  });

  test("due date passed, should return overdue", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-01"),
      new Prisma.Decimal(80),
      false,
      new Date("2026-01-02")
    );
    expect(status).toBe(AssessmentStatuses.OVERDUE);
  });
})
