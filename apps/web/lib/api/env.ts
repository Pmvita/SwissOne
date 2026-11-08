export function isDevelopmentEnv(nodeEnv = process.env.NODE_ENV) {
  return nodeEnv === "development";
}
