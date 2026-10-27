import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  getAuthCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/google-oauth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", getAuthCookieOptions(0));
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", getAuthCookieOptions(0));
  return response;
}
