import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/calendar(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log('User ID:', userId); // Log the user ID for debugging
  if (isProtectedRoute(req) && !userId) {
    const homeUrl = new URL('/', req.url)
    return NextResponse.redirect(homeUrl)
  }
  return NextResponse.next();
})



export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};