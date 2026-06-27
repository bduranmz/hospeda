import { NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_COOKIE = "csrf_token";
const TOKEN_BYTES = 32;
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * GET /api/csrf
 * Issues a CSRF token, sets it as an HttpOnly=false cookie (so JS can read it),
 * and returns it in the JSON body.
 *
 * Client flow:
 *   1. On app load (or before first mutating request), fetch GET /api/csrf
 *   2. Store the token in memory / state
 *   3. Send it as X-CSRF-Token header on every POST/PUT/DELETE to /api/*
 *
 * The middleware validates that the header matches the cookie value.
 */
export async function GET() {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");

  const response = NextResponse.json({ token });

  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by JS to send as a header
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
