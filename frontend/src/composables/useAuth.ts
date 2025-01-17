// composables/useAuth.ts
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { AxiosError } from "axios";

import { useToast as usePrimeToast } from "primevue/usetoast";
import {
  type BodyLoginAccessToken,
  type LoginAccessTokenData,
  type LoginAccessTokenError,
  type LoginAccessTokenResponse,
  LoginService,
  type UserRegister,
  type UsersRegisterUserData,
  type UsersRegisterUserError,
  type UsersRegisterUserResponse,
  UsersService,
} from "@/client";
import {
  loginAccessTokenMutation,
  usersReadUserMeOptions,
  usersRegisterUserMutation,
} from "@/client/@tanstack/vue-query.gen.ts";
import type { Options } from "@hey-api/client-axios";

export const useAuth = () => {
  const error = ref<string | null>(null);
  const router = useRouter();
  const toast = usePrimeToast();
  const queryClient = useQueryClient();

  const isLoggedIn = (): boolean => {
    return localStorage.getItem("access_token") !== null;
  };

  // Current user query
  const { data: user, isLoading } = useQuery({
    ...usersReadUserMeOptions(),
    enabled: isLoggedIn(),
  });

  // Sign up mutation
  const signUpMutation = useMutation<
    UsersRegisterUserResponse, // Success response type
    AxiosError<UsersRegisterUserError>, // Error type
    Options<UsersRegisterUserData>
  >({
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
  const loginMutation = useMutation<
    LoginAccessTokenResponse,
    AxiosError<LoginAccessTokenError>,
    Options<LoginAccessTokenData>
  >({
    ...loginAccessTokenMutation(),
    onSuccess: (response) => {
      localStorage.setItem("access_token", response.access_token);
      router.push("/");
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
};
