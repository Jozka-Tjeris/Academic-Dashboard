import { deriveStatusFromDate } from "../../../../src/domain/grade/status";

describe("Status", () => {
  describe("deriveStatusFromDate", () => {
    test("returns submitted if score exists", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        80,
        new Date("2026-01-01")
      );
      expect(status).toBe("submitted");
    });

    test("returns overdue if past due and no score", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        new Date("2026-01-05")
      );
      expect(status).toBe("overdue");
    });

    test("returns due in 24 hours if dates are same and no score", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-01"),
        null,
        new Date("2026-01-01")
      );
      expect(status).toBe("due in 24 hours");
    });

    test("returns upcoming if due in future and no score", () => {
      const status = deriveStatusFromDate(
        new Date("2026-01-10"),
        null,
        new Date("2026-01-01")
      );
      expect(status).toBe("upcoming");
    });
  });
});

describe("Status - Hours, Minutes and Seconds", () => {
  test("returns overdue if past due and no score", () => {
    const statusHour = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      new Date("2026-01-01T12:00:00")
    );
    expect(statusHour).toBe("overdue");

    const statusMin = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      new Date("2026-01-01T11:01:00")
    );
    expect(statusMin).toBe("overdue");

    const statusSec = deriveStatusFromDate(
      new Date("2026-01-01T11:00:00"),
      null,
      new Date("2026-01-01T11:00:01")
    );
    expect(statusSec).toBe("overdue");
  });

  test("returns due in 24 hours if time period is within 24 hours and no score", () => {
    const status = deriveStatusFromDate(
      new Date("2026-01-02T12:00:00"),
      null,
      new Date("2026-01-01T21:00:00")
    );
    expect(status).toBe("due in 24 hours");
  });
});