import { axiosInstance } from './axios';

export interface Business {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBusinessDto {
  name: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateBusinessDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const PREFIX = '/v1/businesses';

import { PublicBusinessResponse } from '@/types/finance';

export const businessApi = {
  getBusinesses: async (): Promise<Business[]> => {
    const res = await axiosInstance.get<Business[]>(PREFIX);
    return res.data;
  },

  /**
   * Información pública (landing) del negocio de esta instancia. Sin autenticación.
   * Backend: GET /v1/businesses/public
   */
  getPublicBusiness: async (): Promise<PublicBusinessResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const res = await fetch(`${baseUrl}/v1/businesses/public`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw { status: 404 };
      }
      throw new Error(`Error API: ${res.status}`);
    }
    return await res.json();
  },
};
