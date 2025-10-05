import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Role-based access control
    if (pathname.startsWith("/dashboard/citizen") && token?.role !== "citizen") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    
    if (pathname.startsWith("/dashboard/grama-niladhari") && token?.role !== "grama_niladhari") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    
    if (pathname.startsWith("/dashboard/election-commission") && token?.role !== "election_commission") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Redirect to appropriate dashboard based on role
    if (pathname === "/dashboard") {
      switch (token?.role) {
        case "citizen":
          return NextResponse.redirect(new URL("/dashboard/citizen", req.url))
        case "grama_niladhari":
          return NextResponse.redirect(new URL("/dashboard/grama-niladhari", req.url))
        case "election_commission":
          return NextResponse.redirect(new URL("/dashboard/election-commission", req.url))
        default:
          return NextResponse.redirect(new URL("/auth/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/elections") || pathname.startsWith("/info")) {
          return true
        }
        
        if (pathname.startsWith("/dashboard")) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"]
}
