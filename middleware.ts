import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';


export async function middleware(req: NextRequest) {
    const token = await getToken({ req });

    // Define paths that do not require authentication
    const publicPaths = ['/auth/signin', '/auth/signup'];

    // If the user is not authenticated and trying to access a protected route
    if (!token && !publicPaths.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

  // Allow the request to proceed
  return NextResponse.next();
}

// Specify the paths where the middleware should run
export const config = {
    matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};