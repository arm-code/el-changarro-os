/**
 * Utilidad para extraer el slug del negocio a partir del subdominio actual.
 * Ejemplo: https://eventos-mendoza.arm-solutions.com.mx -> 'eventos-mendoza'
 */
export function getBusinessSlugFromHostname(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_SLUG!;
  }

  const hostname = window.location.hostname; // ej. eventos-mendoza.arm-solutions.com.mx

  // Si es localhost o IP, retornar valor por defecto
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
    return process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_SLUG!;
  }

  const parts = hostname.split('.');

  // Si tiene al menos 3 partes (ej. subdominio.dominio.com o subdominio.dominio.com.mx)
  if (parts.length >= 3) {
    // Si la primera parte no es 'www' ni 'app', ese es el slug del negocio
    if (parts[0] !== 'www' && parts[0] !== 'app') {
      return parts[0];
    }
  }

  return process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_SLUG!;
}
