import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const postSignIn = createRouteMatcher(["/post-sign-in"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/(api|trpc)(.*)",
]);
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();

    if (!auth().userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    if (!auth().orgId) {
      return NextResponse.redirect(new URL("/select-org", request.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
