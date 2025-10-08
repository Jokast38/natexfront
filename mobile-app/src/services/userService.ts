import apiClient from "./apiClient";

const userService = {
  async updateUser(userData:any) {
    const { id, ...payload } = userData;
    const response = await apiClient.put(`/user/${id}`, payload);
    return response.data;
  },

  async getUser(userId:number) {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },
};

export default userService;