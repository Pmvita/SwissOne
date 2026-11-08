/** Block setup/admin helpers outside local development. */
export function rejectUnlessDevelopment(): Response | null {
  if (process.env.NODE_ENV !== "development") {
    return Response.json(
      {
        error: "Setup endpoints are disabled outside development",
        hint: "Set NODE_ENV=development for local seeding only",
      },
      { status: 403 }
    );
  }
  return null;
}
