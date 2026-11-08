import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatAccountNumber, formatCurrencyCompact } from "./format.ts";

describe("formatCurrencyCompact", () => {
  it("formats billions", () => {
    assert.match(formatCurrencyCompact(1_250_000_000, "USD"), /1\.25B/);
  });

  it("formats millions", () => {
    assert.match(formatCurrencyCompact(500_000_000, "USD"), /500\.00M/);
  });
});

describe("formatAccountNumber", () => {
  it("masks all but last four", () => {
    assert.equal(formatAccountNumber("CH9300762011623852957"), "****2957");
  });

  it("handles empty", () => {
    assert.equal(formatAccountNumber(null), "");
  });
});
