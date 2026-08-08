import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc (public files)
     * - login (the login page itself)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|logo.png|fundo-1.jpg|fundo-2.jpg|icon-192.png|icon-512.png|app-icon.png|apple-icon.png|manifest.webmanifest|login|$).*)",
  ],
};
