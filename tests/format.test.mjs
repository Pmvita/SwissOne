import assert from "node:assert/strict";
import { describe, it } from "node:test";

function formatCurrencyCompact(amount, currency = "USD") {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (absAmount >= 1_000_000_000) {
    return `${sign}${currency === "USD" ? "US$" : currency} ${(absAmount / 1_000_000_000).toFixed(2)}B`;
  }
  if (absAmount >= 1_000_000) {
    return `${sign}${currency === "USD" ? "US$" : currency} ${(absAmount / 1_000_000).toFixed(2)}M`;
  }
  return `${sign}${absAmount}`;
}

function formatAccountNumber(accountNumber) {
  if (!accountNumber) return "";
  if (accountNumber.length <= 4) return accountNumber;
  return `****${accountNumber.slice(-4)}`;
}

function isDevelopmentEnv(nodeEnv) {
  return nodeEnv === "development";
}

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
});

describe("isDevelopmentEnv", () => {
  it("gates setup helpers", () => {
    assert.equal(isDevelopmentEnv("development"), true);
    assert.equal(isDevelopmentEnv("production"), false);
  });
});
