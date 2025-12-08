import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

export interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

class AuthAPI {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  constructor() {
    // Add request interceptor to include auth token in all requests
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('plateplan.token')
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('plateplan.token', token)
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('plateplan.token')
    localStorage.removeItem('plateplan.user')
  }

  private setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('plateplan.user', JSON.stringify(user))
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('plateplan.user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await this.api.post<User>('/auth/register', data)
      // Register returns user but no token, so we need to login after registration
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login-json', credentials)
      this.setToken(response.data.access_token)
      this.setUser(response.data.user)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      const response = await this.api.get<User>('/auth/me')
      this.setUser(response.data)
      return response.data
    } catch (error: any) {
      // Only remove token if it's definitely a 401 (invalid token)
      // Don't remove on network errors
      if (error.response?.status === 401) {
        // Don't remove token here - let the caller handle it
        // This prevents token from being cleared immediately after login
      }
      throw new Error(error.response?.data?.detail || 'Failed to get user')
    }
  }

  logout(): void {
    this.removeToken()
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null
  }
}

export const authAPI = new AuthAPI()

