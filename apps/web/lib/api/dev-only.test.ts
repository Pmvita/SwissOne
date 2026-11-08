import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isDevelopmentEnv } from "./env.ts";

describe("isDevelopmentEnv", () => {
  it("is true for development", () => {
    assert.equal(isDevelopmentEnv("development"), true);
  });

  it("is false for production", () => {
    assert.equal(isDevelopmentEnv("production"), false);
  });
});
