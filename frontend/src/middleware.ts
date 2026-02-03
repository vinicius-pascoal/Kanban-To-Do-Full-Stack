import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas que exigem autenticação
  const protectedRoutes = ['/dashboard', '/teams'];

  // Se a rota é protegida e não há token
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se está tentando acessar login/register mas já está autenticado
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/teams', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/teams/:path*', '/login', '/register'],
};
