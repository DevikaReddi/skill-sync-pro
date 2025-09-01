import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.token = token;
      this.user = JSON.parse(user);
      this.setAuthHeader(token);
    }
  }

  private setAuthHeader(token: string) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private clearAuthHeader() {
    delete axios.defaults.headers.common['Authorization'];
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);

      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/api/v1/auth/login`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { access_token, user } = response.data;
      
      this.token = access_token;
      this.user = user;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      this.setAuthHeader(access_token);
      
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await axios.post<User>(
        `${API_BASE_URL}/api/v1/auth/register`,
        data
      );
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.clearAuthHeader();
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await axios.get<User>(`${API_BASE_URL}/api/v1/auth/me`);
      this.user = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.token) return false;

    try {
      const decoded: any = jwtDecode(this.token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }
}

export const authService = new AuthService();
export type { User, LoginCredentials, RegisterData };
