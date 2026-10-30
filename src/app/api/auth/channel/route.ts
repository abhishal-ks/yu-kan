import { cookies } from "next/headers";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  createOAuthClient,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/google-oauth";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return jsonError("Please sign in with Google to view your channel.", 401);
  }

  try {
    const auth = createOAuthClient();
    auth.setCredentials({
      ...(accessToken ? { access_token: accessToken } : {}),
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
    });

    const accessResult = await auth.getAccessToken();
    if (!accessResult.token) {
      return jsonError("Your Google session expired. Please sign in again.", 401);
    }

    const youtube = google.youtube({ version: "v3", auth });
    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
      maxResults: 1,
    });
    const channel = channelResponse.data.items?.[0];
    const response = channel
      ? NextResponse.json(
        {
          channel: {
            title: channel.snippet?.title ?? null,
            thumbnailUrl:
              channel.snippet?.thumbnails?.high?.url ??
              channel.snippet?.thumbnails?.medium?.url ??
              channel.snippet?.thumbnails?.default?.url ??
              null,
          },
        },
        { headers: { "Cache-Control": "no-store" } },
      )
      : jsonError("No YouTube channel was found for this Google account.", 404);

    const updatedAccessToken = auth.credentials.access_token;
    const expiryDate = auth.credentials.expiry_date;
    if (updatedAccessToken && updatedAccessToken !== accessToken) {
      response.cookies.set(
        ACCESS_TOKEN_COOKIE,
        updatedAccessToken,
        getAuthCookieOptions(
          expiryDate
            ? Math.max(0, Math.floor((expiryDate - Date.now()) / 1000))
            : 60 * 60,
        ),
      );
    }

    return response;
  } catch (error) {
    console.error("Unable to retrieve the signed-in YouTube channel:", error);
    return jsonError(
      "We couldn't load your YouTube channel details. Please try again.",
      502,
    );
  }
}
