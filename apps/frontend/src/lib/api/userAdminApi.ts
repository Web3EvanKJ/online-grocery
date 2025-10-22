import axios from 'axios';

const API_URL = 'http://localhost:8000/api/admin/users';

export const userAdminApi = {
  getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    sortOrder?: string;
  }) {
    return axios.get(API_URL, { params }).then((res) => res.data);
  },
  createUser: async (data: any) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  updateUser: async (id: number, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};
