// Explicit public origins avoid trusting arbitrary forwarded headers from clients.
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || !["http:", "https:"].includes(parsed.protocol)) return false;
    const configured = process.env.APP_ORIGINS;
    if (configured?.trim()) {
      return configured.split(",").some((value) => {
        try { return new URL(value.trim()).origin === origin; } catch { return false; }
      });
    }
    return origin === new URL(request.url).origin;
  } catch { return false; }
}
