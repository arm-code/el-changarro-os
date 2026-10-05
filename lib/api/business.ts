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

  getBusinessById: async (id: string): Promise<Business> => {
    const res = await axiosInstance.get<Business>(`${PREFIX}/${id}`);
    return res.data;
  },

  getPublicBusinessBySlug: async (slug: string): Promise<PublicBusinessResponse> => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const res = await fetch(`${baseUrl}/v1/businesses/public/${slug}`, {
      next: { revalidate: 600 }
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw { status: 404 };
      }
      throw new Error(`Error API: ${res.status}`);
    }
    const json = await res.json();
    return json;
  },

  /**
   * Lista todos los negocios activos — endpoint público, sin autenticación.
   * Backend: GET /v1/businesses/public
   */
  getPublicBusinesses: async (): Promise<PublicBusinessResponse[]> => {
    const res = await axiosInstance.get<PublicBusinessResponse[]>(`${PREFIX}/public`);
    return res.data;
  },

  createBusiness: async (data: CreateBusinessDto): Promise<Business> => {
    const res = await axiosInstance.post<Business>(PREFIX, data);
    return res.data;
  },

  updateBusiness: async (id: string, data: UpdateBusinessDto): Promise<Business> => {
    const res = await axiosInstance.patch<Business>(`${PREFIX}/${id}`, data);
    return res.data;
  },
};
