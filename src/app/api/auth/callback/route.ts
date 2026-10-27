import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createOAuthClient,
  getAuthCookieOptions,
  OAUTH_STATE_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const callbackUrl = new URL("/", request.url);
  const params = request.nextUrl.searchParams;
  const providerError = params.get("error");

  if (providerError) {
    callbackUrl.searchParams.set("authError", "denied");
    const response = NextResponse.redirect(callbackUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, "", getAuthCookieOptions(0));
    return response;
  }

  const code = params.get("code");
  const receivedState = params.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !receivedState || !expectedState || receivedState !== expectedState) {
    return NextResponse.json(
      { error: "The sign-in response was invalid or expired. Please try again." },
      { status: 400 },
    );
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error("Google did not return an access token.");
    }

    const response = NextResponse.redirect(callbackUrl);
    response.cookies.set(
      ACCESS_TOKEN_COOKIE,
      tokens.access_token,
      getAuthCookieOptions(tokens.expiry_date
        ? Math.max(0, Math.floor((tokens.expiry_date - Date.now()) / 1000))
        : 60 * 60),
    );

    if (tokens.refresh_token) {
      response.cookies.set(
        REFRESH_TOKEN_COOKIE,
        tokens.refresh_token,
        getAuthCookieOptions(),
      );
    }

    response.cookies.set(OAUTH_STATE_COOKIE, "", getAuthCookieOptions(0));
    return response;
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    callbackUrl.searchParams.set("authError", "callback");
    const response = NextResponse.redirect(callbackUrl);
    response.cookies.set(OAUTH_STATE_COOKIE, "", getAuthCookieOptions(0));
    return response;
  }
}
