// composables/useAuth.ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { AxiosError } from 'axios'

import {useToast as usePrimeToast} from "primevue/usetoast";
import {
  type BodyLoginAccessToken,
  type LoginAccessTokenData,
  LoginService,
  type UserRegister,
  UsersService
} from "@/client";
import { usersRegisterUserMutation } from "@/client/@tanstack/vue-query.gen.ts";

export const useAuth = () => {
  const error = ref<string | null>(null)
  const router = useRouter()
  const toast = usePrimeToast()
  const queryClient = useQueryClient()

  const isLoggedIn = (): boolean => {
    return localStorage.getItem('access_token') !== null
  }

  // Current user query
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => UsersService.usersReadUserMe(),
    enabled: isLoggedIn(),
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    ...usersRegisterUserMutation,
    onSuccess: () => {
      router.push('/login')
      toast.add({
        severity: 'success',
        summary: 'Account created',
        detail: 'Your account has been created successfully.',
      })
    },
    onError: (err: AxiosError) => {
      let errDetail = (err.response?.data as any)?.detail
      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      toast.add({
        severity: 'error',
        summary: 'Something went wrong',
        detail: errDetail,
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  // Login function
  const login = async (data: BodyLoginAccessToken) => {
    const response = await LoginService.loginAccessToken({
      body: data,
    })
    localStorage.setItem('access_token', response.data.access_token)
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      router.push('/')
    },
    onError: (err: AxiosError) => {
      let errDetail = (err.response?.data as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      if (Array.isArray(errDetail)) {
        errDetail = 'Something went wrong'
      }

      error.value = errDetail
    },
  })

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token')
    router.push('/login')
  }

  // Reset error
  const resetError = () => {
    error.value = null
  }

  return {
    isLoggedIn,
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoading,
    error,
    resetError,
  }
}
