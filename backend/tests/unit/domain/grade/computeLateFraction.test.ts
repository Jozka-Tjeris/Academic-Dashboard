import { PENALTY_PERCENT_PER_DAY } from "@internal_package/shared";
import { computeLateFraction } from "../../../../src/domain/grade/computeLateFraction";

describe("computeLateFraction", () => {
  const msPerDay = 1000 * 60 * 60 * 24;

  test("on-time submission returns 0", () => {
    const dueDate = new Date();
    const submissionDate = new Date(dueDate.getTime());
    const fraction = computeLateFraction(submissionDate, dueDate);
    expect(fraction.toNumber()).toBe(0);
  });

  test("early submission returns 0", () => {
    const dueDate = new Date();
    const submissionDate = new Date(dueDate.getTime() - msPerDay); // 1 day early
    const fraction = computeLateFraction(submissionDate, dueDate);
    expect(fraction.toNumber()).toBe(0);
  });

  test("1 day late returns 0.05 (5% per day)", () => {
    const dueDate = new Date();
    const submissionDate = new Date(dueDate.getTime() + msPerDay);
    const fraction = computeLateFraction(submissionDate, dueDate);
    expect(fraction.toNumber()).toBeCloseTo(PENALTY_PERCENT_PER_DAY);
  });

  test("multiple days late returns correct fraction", () => {
    const dueDate = new Date();
    const submissionDate = new Date(dueDate.getTime() + 3 * msPerDay); // 3 days late
    const fraction = computeLateFraction(submissionDate, dueDate);
    expect(fraction.toNumber()).toBeCloseTo(3 * PENALTY_PERCENT_PER_DAY);
  });

  test("fraction never negative for early submissions", () => {
    const dueDate = new Date();
    const submissionDate = new Date(dueDate.getTime() - 5 * msPerDay); // 5 days early
    const fraction = computeLateFraction(submissionDate, dueDate);
    expect(fraction.toNumber()).toBe(0);
  });
});
