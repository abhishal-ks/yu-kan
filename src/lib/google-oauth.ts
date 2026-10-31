import { google } from "googleapis";

// Shared OAuth helpers keep Google-auth behavior centralized so every route uses the
// same cookie rules and environment validation instead of duplicating config logic.
export const ACCESS_TOKEN_COOKIE = "youtube_access_token";
export const REFRESH_TOKEN_COOKIE = "youtube_refresh_token";
export const OAUTH_STATE_COOKIE = "youtube_oauth_state";

/**
 * Creates the Google OAuth client used by authenticated API routes.
 * Keeping this in one place makes it easier to enforce required configuration.
 */
export function createOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI must be configured.",
    );
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  );
}

/**
 * Returns the cookie options used for long-lived auth tokens.
 * httpOnly + sameSite help reduce client-side exposure, while secure follows production safety defaults.
 */
export function getAuthCookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(maxAge === undefined ? {} : { maxAge }),
  };
}
