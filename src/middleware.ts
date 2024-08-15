import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";

import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req) {
    // If we are login and in the landing page
    // we need to redirect
    if (auth.userId && auth.isPublicRoute) {
      let path = "/select-org";

      if (auth.orgId) {
        path = `organization/${auth.orgId}/projects`;
      }

      const orgSelection = new URL(path, req.url);

      return NextResponse.redirect(orgSelection);
    }

    // If we are not authenticated and we are not in landing page
    if (!auth.userId && !auth.isPublicRoute) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If we hace the use ir and we do not have an Id organization,
    // we never select any organization, and if we are not in /select-org
    // We force to create an organization or select
    if (auth.userId && !auth.orgId && req.nextUrl.pathname !== "/select-org") {
      const orgSelection = new URL("/select-org", req.url);
      return NextResponse.redirect(orgSelection);
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
