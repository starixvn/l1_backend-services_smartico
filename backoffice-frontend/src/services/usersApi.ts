import axios from 'axios';

const API_BASE_URL = 'http://localhost:5120/api';

export interface UserDto {
  id: string;
  operatorId: string;
  email: string;
  fullName: string;
  roleIds: string[];
  roleNames: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest {
  fullName: string;
  isActive: boolean;
  newPassword?: string;
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export const usersApi = {
  getUsers: async (): Promise<UserDto[]> => {
    const response = await axios.get<UserDto[]>(`${API_BASE_URL}/users`);
    return response.data;
  },

  getUserById: async (id: string): Promise<UserDto> => {
    const response = await axios.get<UserDto>(`${API_BASE_URL}/users/${id}`);
    return response.data;
  },

  createUser: async (request: CreateUserRequest): Promise<UserDto> => {
    const response = await axios.post<UserDto>(`${API_BASE_URL}/users`, request);
    return response.data;
  },

  updateUser: async (id: string, request: UpdateUserRequest): Promise<UserDto> => {
    const response = await axios.put<UserDto>(`${API_BASE_URL}/users/${id}`, request);
    return response.data;
  },

  assignRoles: async (id: string, request: AssignRolesRequest): Promise<UserDto> => {
    const response = await axios.put<UserDto>(`${API_BASE_URL}/users/${id}/roles`, request);
    return response.data;
  },

  deactivateUser: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
  },
};
