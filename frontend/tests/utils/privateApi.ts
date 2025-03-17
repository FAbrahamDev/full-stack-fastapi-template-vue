import { randomEmail, randomPassword } from "./random"
import { firstSuperuser, firstSuperuserPassword } from "../config"
import { client, LoginService, PrivateService, UsersService } from "../../src/client/sdk.gen"
import { UserPublic } from "../../src/client/types.gen"

interface UserCreate {
  email: string
  password?: string
  full_name?: string
  is_active?: boolean
  is_superuser?: boolean
}

interface UserOut {
  email: string
  full_name?: string
  id: string
  is_active: boolean
  is_superuser: boolean
}

/**
 * Get authentication token for the superuser
 */
async function getSuperuserToken(): Promise<string> {
  // Configure client with API URL from environment variable
  client.setConfig({
    baseURL: process.env.VITE_API_URL,
  })

  const response = await LoginService.loginAccessToken({
    body: {
      username: firstSuperuser,
      password: firstSuperuserPassword,
    }
  })

  if (!response.data) {
    throw new Error(`Failed to get superuser token`)
  }

  return response.data.access_token
}

/**
 * Create a user via the API directly
 */
export async function createUser(userCreate: UserCreate): Promise<UserPublic> {
  const token = await getSuperuserToken()
  
  // Configure client with the token for authentication
  client.setConfig({
    baseURL: process.env.VITE_API_URL,
    auth: () => token,
  })

  const response = await UsersService.usersCreateUser({
    body: {
      email: userCreate.email,
      password: userCreate.password || randomPassword(),
      full_name: userCreate.full_name || "Test User",
      is_active: userCreate.is_active !== undefined ? userCreate.is_active : true,
      is_superuser: userCreate.is_superuser !== undefined ? userCreate.is_superuser : false,
    }
  })

  if (!response.data) {
    throw new Error(`Failed to create user`)
  }

  return response.data
}

/**
 * Create a user via the private API (no authentication required)
 */
export async function createPrivateUser(userCreate: {
  email: string
  password?: string
  full_name?: string
  is_verified?: boolean
}): Promise<UserPublic> {
  // Configure client with API URL from environment variable
  client.setConfig({
    baseURL: process.env.VITE_API_URL,
  })

  const response = await PrivateService.privateCreateUser({
    body: {
      email: userCreate.email,
      password: userCreate.password || randomPassword(),
      full_name: userCreate.full_name || "Test User",
      is_verified: userCreate.is_verified,
    }
  })

  if (!response.data) {
    throw new Error(`Failed to create private user`)
  }

  return response.data
} 