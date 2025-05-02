import { clerkMiddleware,createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/createBlog(.*)'])

const isAdminRoute = createRouteMatcher([ '/admin(.*)'])


export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)){ auth().protect()}

  const { userId, sessionClaims } = auth()

  // If the user is trying to access an admin route
  if (isAdminRoute(req)) {
    // Check if the user has the admin role
    if (sessionClaims?.metadata?.role !== 'admin') {
      // If not, redirect to the home page
      const homeUrl = new URL('/', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
  

  
}) 


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};