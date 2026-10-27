import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  createOAuthClient,
  getAuthCookieOptions,
  OAUTH_STATE_COOKIE,
} from "@/lib/google-oauth";

export async function GET(request: Request) {
  const requestOrigin = new URL(request.url).origin;

  try {
    const state = randomBytes(32).toString("base64url");
    const oauth2Client = createOAuthClient();
    const authorizationUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
      ],
      state,
    });

    const response = NextResponse.redirect(
      new URL(authorizationUrl, requestOrigin),
    );
    response.cookies.set(
      OAUTH_STATE_COOKIE,
      state,
      getAuthCookieOptions(10 * 60),
    );

    return response;
  } catch (error) {
    console.error("Unable to start Google OAuth:", error);
    return NextResponse.json(
      { error: "Google sign-in is not configured correctly." },
      { status: 500 },
    );
  }
}
