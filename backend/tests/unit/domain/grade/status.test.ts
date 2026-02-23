import { deriveStatusFromDate } from "@/domain/grade/status";

describe("Status", () => {
  describe("deriveStatusFromDate", () => {
    test("returns graded if score exists and submitted is true", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        80,
        true,
        new Date("2026-01-01")
      );
      expect(status).toBe("graded");
    });

    test("returns submitted if submitted is true but no grade", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        true,
        new Date("2026-01-01")
      );
      expect(status).toBe("submitted");
    });

    test("returns overdue if past due and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        false,
        new Date("2026-01-05")
      );
      expect(status).toBe("overdue");
    });

    test("returns due in 24 hours if dates are same and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        false,
        new Date("2026-01-01")
      );
      expect(status).toBe("due in 24 hours");
    });

    test("returns upcoming if due in future and no score and not submitted", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        false,
        new Date("2026-01-01")
      );
      expect(status).toBe("upcoming");
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
    expect(statusHour).toBe("overdue");

    const statusMin = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T11:01:00")
    );
    expect(statusMin).toBe("overdue");

    const statusSec = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      false,
      new Date("2026-01-01T11:00:01")
    );
    expect(statusSec).toBe("overdue");
  });

  test("returns due in 24 hours if time period is within 24 hours and no score and not submitted", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-02T12:00:00"),
      null,
      false,
      new Date("2026-01-01T21:00:00")
    );
    expect(status).toBe("due in 24 hours");
  });
});

describe("Status - Edge cases (grade exists, not submitted); ignore the score and only check the dates", () => {
  test("due date is not reached yet, so it should return upcoming", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-10"),
      80,
      false,
      new Date("2026-01-01")
    );
    expect(status).toBe("upcoming");
  });

  test("dates are close, should return due in 24 hours", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-01"),
      80,
      false,
      new Date("2026-01-01")
    );
    expect(status).toBe("due in 24 hours");
  });

  test("due date passed, should return overdue", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-01"),
      80,
      false,
      new Date("2026-01-02")
    );
    expect(status).toBe("overdue");
  });
})
