import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/site";

const SESSION_COOKIE = "feria_session";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);

  return NextResponse.redirect(new URL("/", getBaseUrl()), {
    status: 303,
  });
}
