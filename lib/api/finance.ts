import { axiosInstance } from './axios';
import {
  Transaction,
  CreateTransactionDto,
  BusinessEvent,
  CreateBusinessEventDto,
  UpdateBusinessEventDto,
  EventStatus,
  SalesNote,
  CreateSalesNoteDto,
  UpdateSalesNoteDto,
  SalesNoteStatus,
  TransactionCategory,
  PaymentMethod,
  CreateTransactionCategoryDto,
  CreatePaymentMethodDto,
  PaginatedResponse,
  BusinessConfig,
  UpdateBusinessConfigDto,
  CreatePaymentCardDto,
  PaymentCard,
} from '@/types/finance';

const PREFIX = '/v1';

export const financeApi = {
  // Transactions
  getTransactions: async (page: number = 1, limit: number = 10) => {
    const res = await axiosInstance.get<PaginatedResponse<Transaction>>(`${PREFIX}/transactions`, {
      params: { page, limit }
    });
    return res.data;
  },

  createTransaction: async (data: CreateTransactionDto) => {
    const res = await axiosInstance.post<Transaction>(`${PREFIX}/transactions`, data);
    return res.data;
  },

  getSummary: async () => {
    const res = await axiosInstance.get<{ totalInputs: number; totalOutputs: number; balance: number }>(`${PREFIX}/transactions/summary`);
    return res.data;
  },

  // Sales Notes / Quotes
  getSalesNotes: async (params?: { page?: number; limit?: number; status?: string; eventId?: string; search?: string }) => {
    const res = await axiosInstance.get<PaginatedResponse<SalesNote> | SalesNote[]>(`${PREFIX}/sales-notes`, {
      params,
    });
    return (res.data as PaginatedResponse<SalesNote>).items || res.data;
  },

  getSalesNoteById: async (id: string) => {
    const res = await axiosInstance.get<SalesNote>(`${PREFIX}/sales-notes/${id}`);
    return res.data;
  },

  createSalesNote: async (data: CreateSalesNoteDto) => {
    const res = await axiosInstance.post<SalesNote>(`${PREFIX}/sales-notes`, data);
    return res.data;
  },

  updateSalesNote: async (id: string, data: UpdateSalesNoteDto) => {
    const res = await axiosInstance.patch<SalesNote>(`${PREFIX}/sales-notes/${id}`, data);
    return res.data;
  },

  updateSalesNoteStatus: async (id: string, status: SalesNoteStatus) => {
    const res = await axiosInstance.patch<SalesNote>(`${PREFIX}/sales-notes/${id}/status`, { status });
    return res.data;
  },

  deleteSalesNote: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/sales-notes/${id}`);
    return res.data;
  },

  // Business Events
  getBusinessEvents: async (params?: { page?: number; limit?: number; status?: string; tab?: string; search?: string }) => {
    const res = await axiosInstance.get<PaginatedResponse<BusinessEvent> | BusinessEvent[]>(`${PREFIX}/events`, {
      params,
    });
    return (res.data as PaginatedResponse<BusinessEvent>).items || res.data;
  },

  getBusinessEventById: async (id: string) => {
    const res = await axiosInstance.get<BusinessEvent>(`${PREFIX}/events/${id}`);
    return res.data;
  },

  createBusinessEvent: async (data: CreateBusinessEventDto) => {
    const res = await axiosInstance.post<BusinessEvent>(`${PREFIX}/events`, data);
    return res.data;
  },

  updateBusinessEvent: async (id: string, data: UpdateBusinessEventDto) => {
    const res = await axiosInstance.patch<BusinessEvent>(`${PREFIX}/events/${id}`, data);
    return res.data;
  },

  updateEventStatus: async (id: string, status: EventStatus) => {
    const res = await axiosInstance.patch<BusinessEvent>(`${PREFIX}/events/${id}/status`, { status });
    return res.data;
  },

  deleteBusinessEvent: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/events/${id}`);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await axiosInstance.get<PaginatedResponse<TransactionCategory> | TransactionCategory[]>(`${PREFIX}/categories`);
    return (res.data as PaginatedResponse<TransactionCategory>).items || res.data;
  },

  createCategory: async (data: CreateTransactionCategoryDto) => {
    const res = await axiosInstance.post<TransactionCategory>(`${PREFIX}/categories`, data);
    return res.data;
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const res = await axiosInstance.get<PaginatedResponse<PaymentMethod> | PaymentMethod[]>(`${PREFIX}/payment-methods`);
    return (res.data as PaginatedResponse<PaymentMethod>).items || res.data;
  },

  createPaymentMethod: async (data: CreatePaymentMethodDto) => {
    const res = await axiosInstance.post<PaymentMethod>(`${PREFIX}/payment-methods`, data);
    return res.data;
  },

  // Business Configuration
  getConfig: async () => {
    const res = await axiosInstance.get<BusinessConfig>(`${PREFIX}/config`);
    return res.data;
  },

  updateConfig: async (data: UpdateBusinessConfigDto) => {
    // Sanitizar payload para evitar errores 400 por propiedades no permitidas (forbidNonWhitelisted) o email vacío
    const payload: Record<string, any> = {};

    if (data.name?.trim()) payload.name = data.name.trim();
    if (data.logoUrl?.trim()) payload.logoUrl = data.logoUrl.trim();
    if (data.phone?.trim()) payload.phone = data.phone.trim();
    if (data.whatsapp?.trim()) payload.whatsapp = data.whatsapp.trim();
    if (data.email?.trim()) payload.email = data.email.trim();
    if (data.address?.trim()) payload.address = data.address.trim();
    if (Array.isArray(data.services)) payload.services = data.services;
    if (Array.isArray(data.coverageAreas)) payload.coverageAreas = data.coverageAreas;
    if (typeof data.termsAndConditions === 'string') payload.termsAndConditions = data.termsAndConditions;
    if (typeof data.description === 'string') payload.description = data.description.trim();
    if (typeof data.history === 'string') payload.history = data.history.trim();
    if (typeof data.mission === 'string') payload.mission = data.mission.trim();
    if (typeof data.vision === 'string') payload.vision = data.vision.trim();
    if (typeof data.openingHours === 'string') payload.openingHours = data.openingHours.trim();
    if (typeof data.whatsappMessage === 'string' || data.whatsappMessage === null) payload.whatsappMessage = data.whatsappMessage;

    const res = await axiosInstance.patch<BusinessConfig>(`${PREFIX}/config`, payload);
    return res.data;
  },

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  addPaymentCard: async (data: CreatePaymentCardDto) => {
    const payload: Record<string, any> = {
      bank: data.bank.trim(),
      beneficiary: data.beneficiary.trim(),
    };
    if (data.cardNumber?.trim()) payload.cardNumber = data.cardNumber.trim();
    if (data.clabe?.trim()) payload.clabe = data.clabe.trim();

    const res = await axiosInstance.post<PaymentCard>(`${PREFIX}/config/cards`, payload);
    return res.data;
  },

  updatePaymentCard: async (cardId: string, data: Partial<CreatePaymentCardDto>) => {
    const payload: Record<string, any> = {};
    if (data.bank !== undefined) payload.bank = data.bank.trim();
    if (data.beneficiary !== undefined) payload.beneficiary = data.beneficiary.trim();
    if (data.cardNumber !== undefined) payload.cardNumber = data.cardNumber.trim();
    if (data.clabe !== undefined) payload.clabe = data.clabe.trim();

    const res = await axiosInstance.patch<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/cards/${cardId}`, payload);
    return res.data;
  },

  deletePaymentCard: async (cardId: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/cards/${cardId}`);
    return res.data;
  },

  addGalleryItem: async (data: { file: File; label?: string; alt?: string; order?: number }) => {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.label !== undefined) formData.append('label', data.label);
    if (data.alt !== undefined) formData.append('alt', data.alt);
    // No enviamos 'order' porque FormData lo envía como string y el backend espera un entero
    // if (data.order !== undefined) formData.append('order', String(data.order));

    const res = await axiosInstance.post<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateGalleryItem: async (itemId: string, data: { label?: string; order?: number }) => {
    const res = await axiosInstance.patch<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/gallery/${itemId}`, data);
    return res.data;
  },

  removeGalleryItem: async (itemId: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/gallery/${itemId}`);
    return res.data;
  },

  // --- Values ---
  addValue: async (data: { title: string; description?: string; icon?: string; order?: number }) => {
    const res = await axiosInstance.post<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/values`, data);
    return res.data;
  },
  updateValue: async (id: string, data: Partial<{ title: string; description: string; icon: string; order: number }>) => {
    const res = await axiosInstance.patch<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/values/${id}`, data);
    return res.data;
  },
  removeValue: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/values/${id}`);
    return res.data;
  },

  // --- Stats ---
  addStat: async (data: { value: string; label: string; order?: number }) => {
    const res = await axiosInstance.post<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/stats`, data);
    return res.data;
  },
  updateStat: async (id: string, data: Partial<{ value: string; label: string; order: number }>) => {
    const res = await axiosInstance.patch<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/stats/${id}`, data);
    return res.data;
  },
  removeStat: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/stats/${id}`);
    return res.data;
  },

  // --- Testimonials ---
  addTestimonial: async (data: { text: string; author: string; rating?: number; order?: number }) => {
    const res = await axiosInstance.post<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/testimonials`, data);
    return res.data;
  },
  updateTestimonial: async (id: string, data: Partial<{ text: string; author: string; rating: number; order: number }>) => {
    const res = await axiosInstance.patch<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/testimonials/${id}`, data);
    return res.data;
  },
  removeTestimonial: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/testimonials/${id}`);
    return res.data;
  },

  // --- FAQs ---
  addFaq: async (data: { question: string; answer: string; order?: number }) => {
    const res = await axiosInstance.post<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/faqs`, data);
    return res.data;
  },
  updateFaq: async (id: string, data: Partial<{ question: string; answer: string; order: number }>) => {
    const res = await axiosInstance.patch<{ success: boolean; data: BusinessConfig }>(`${PREFIX}/config/faqs/${id}`, data);
    return res.data;
  },
  removeFaq: async (id: string) => {
    const res = await axiosInstance.delete<{ success: boolean }>(`${PREFIX}/config/faqs/${id}`);
    return res.data;
  },
};
