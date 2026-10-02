import type { BusinessConfig } from '@/types/finance';

/**
 * Configuración vacía usada como fallback mientras carga el API.
 * NO debe contener datos de ningún negocio específico.
 * El frontend muestra u oculta secciones según si los campos vienen vacíos.
 */
export const defaultBusinessConfig: BusinessConfig = {
  name: '',
  services: [],
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  description: '',
  history: '',
  mission: '',
  vision: '',
  openingHours: '',
  termsAndConditions: '',
  paymentCards: [],
  coverageAreas: [],
};
