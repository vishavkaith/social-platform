import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create-post/:path*',
    '/scheduled/:path*',
    '/media/:path*',
    '/feeds/:path*',
    '/inbox/:path*',
    '/analytics/:path*',
    '/accounts/:path*',
    '/settings/:path*',
  ],
}