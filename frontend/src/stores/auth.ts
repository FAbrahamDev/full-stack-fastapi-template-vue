import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { AxiosError } from "axios";
import { useToast as usePrimeToast } from "primevue/usetoast";
import { type LoginAccessTokenError } from "@/client";
import {
  loginAccessTokenMutation,
  usersReadUserMeOptions,
  usersRegisterUserMutation,
} from "@/client/@tanstack/vue-query.gen";

export const useAuthStore = defineStore("auth", () => {
  const error = ref<string | null>(null);
  const router = useRouter();
  const toast = usePrimeToast();
  const queryClient = useQueryClient();

  // Add a reactive ref to track auth state
  const accessToken = ref<string | null>(localStorage.getItem("access_token"));

  const isLoggedIn = (): boolean => {
    return accessToken.value !== null;
  };

  // Create a computed property for the enabled condition
  const isUserQueryEnabled = computed(() => isLoggedIn());

  // Current user query
  const {
    data: user,
    isLoading,
    isError: isUserQueryError,
  } = useQuery({
    ...usersReadUserMeOptions(),
    enabled: isUserQueryEnabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on 403 Forbidden errors
      if (error instanceof AxiosError && error.response?.status === 403) {
        return false;
      }
      // Default retry behavior for other errors (3 times)
      return failureCount < 3;
    },
  });

  watch(isUserQueryError, (newVal) => {
    if (newVal) {
      logout();
    }
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    ...usersRegisterUserMutation(),
    onSuccess: () => {
      router.push("/login");
      toast.add({
        severity: "success",
        summary: "Account created",
        detail: "Your account has been created successfully.",
      });
    },
    onError: (err) => {
      let errDetail = err.response?.data?.detail || err.message;

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong";
      }

      toast.add({
        severity: "error",
        summary: "Something went wrong",
        detail: errDetail,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    ...loginAccessTokenMutation(),
    onSuccess: (response) => {
      localStorage.setItem("access_token", response.access_token);
      accessToken.value = response.access_token; // Update the reactive ref
      router.push("/");
      // Invalidate and refetch user data after login
      queryClient.invalidateQueries({
        queryKey: usersReadUserMeOptions().queryKey,
      });
    },
    onError: (err: AxiosError<LoginAccessTokenError>) => {
      let errDetail = err.response?.data?.detail || err.message;

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong";
      }

      error.value = errDetail;
    },
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token");
    accessToken.value = null; // Update the reactive ref
    // Clear user data from cache
    queryClient.clear();
    router.push("/login");
  };

  // Reset error
  const resetError = () => {
    error.value = null;
  };

  return {
    isLoggedIn,
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoading,
    error,
    resetError,
  };
});
