import { axiosInstance } from '@/lib/api/axios'

/**
 * Inicia sesión contra el API. El API responde con una cookie httpOnly de
 * sesión; aquí solo recibimos los datos básicos del usuario.
 */
export async function loginUser(email: string, password: string) {
  const res = await axiosInstance.post<{ id: string; email: string }>('/v1/auth/login', {
    email,
    password,
  })
  return res.data
}
