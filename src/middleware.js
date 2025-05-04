import { clerkMiddleware,createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/createBlog(.*)'])

const isAdminRoute = createRouteMatcher([ '/admin(.*)'])


export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)){ auth().protect()}

  const { userId, sessionClaims } = auth()

 
  if (isAdminRoute(req)) {
   
    if (sessionClaims?.metadata?.role !== 'admin') {
    
      const homeUrl = new URL('/', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }

  return NextResponse.next()
  

  
}) 


export const config = {
  matcher: [
   
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
   
    '/(api|trpc)(.*)',
  ],
};