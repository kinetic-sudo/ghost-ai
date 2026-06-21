import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

const toPathPattern = (urlOrPath: string) => {
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
    return `${new URL(urlOrPath).pathname}(.*)`;
  }
  return `${urlOrPath}(.*)`;
};

const isPublicRoute = createRouteMatcher([
  toPathPattern(signInUrl),
  toPathPattern(signUpUrl),
]);

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname === "/") {
    const { isAuthenticated } = await auth();
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/editor" : signInUrl, req.url),
    );
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default clerkProxy;
export const proxy = clerkProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
