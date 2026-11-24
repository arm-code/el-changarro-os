import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/** Debe coincidir con SESSION_COOKIE_NAME del API. */
const SESSION_COOKIE = 'cb_session';

/**
 * Verifica la firma y vigencia del JWT de sesión (mismo JWT_SECRET que el API).
 * Es solo la puerta de las páginas; el API vuelve a validar cada petición.
 */
async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const loggedIn = await hasValidSession(req);

  // Rutas privadas del admin (requieren sesión)
  const privateRoutes = [
    '/dashboard',
    '/configuracion',
    '/usuarios',
    '/gestion-productos',
    '/tools',
  ];

  const isPrivate = privateRoutes.some(
    (route) => url.pathname === route || url.pathname.startsWith(`${route}/`)
  );

  if (!loggedIn && isPrivate) {
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  if (loggedIn && url.pathname.startsWith('/auth')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/gestion-productos/:path*',
    '/configuracion/:path*',
    '/tools/:path*',
    '/usuarios/:path*',
    '/auth/:path*',
  ],
};
