import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apenas redireciona páginas públicas para proteger
  // Rotas dinâmicas /dashboard/[teamId] são protegidas no componente
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  // Se está em página pública, apenas continua
  if (isPublicPage) {
    return NextResponse.next();
  }

  // Para outras rotas, também apenas continua
  // A proteção acontecerá no componente via ProtectedRoute
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/teams/:path*', '/login', '/register'],
};
