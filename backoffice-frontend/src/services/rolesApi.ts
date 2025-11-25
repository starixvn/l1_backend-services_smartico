import axios from 'axios';

const API_BASE_URL = 'http://localhost:5120/api';

export interface RoleDto {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissionCodes: string[];
}

export const rolesApi = {
  getRoles: async (): Promise<RoleDto[]> => {
    const response = await axios.get<RoleDto[]>(`${API_BASE_URL}/roles`);
    return response.data;
  },

  getRoleById: async (id: string): Promise<RoleDto> => {
    const response = await axios.get<RoleDto>(`${API_BASE_URL}/roles/${id}`);
    return response.data;
  },

  createRole: async (request: CreateRoleRequest): Promise<RoleDto> => {
    const response = await axios.post<RoleDto>(`${API_BASE_URL}/roles`, request);
    return response.data;
  },

  updateRole: async (id: string, request: UpdateRoleRequest): Promise<RoleDto> => {
    const response = await axios.put<RoleDto>(`${API_BASE_URL}/roles/${id}`, request);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/roles/${id}`);
  },
};
