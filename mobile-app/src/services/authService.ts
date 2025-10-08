import * as SecureStore from "expo-secure-store";
import apiClient from "./apiClient";

const authService = {
    async register(data:any) {
        const response = await apiClient.post("/user", data);
        return response.data;
    },

    async login(data:any) {
        const response = await apiClient.post("/auth", data);
        const token = response.data.token;
        await SecureStore.setItemAsync("userToken", token);
        return token;
    },

    async verifyJwt() {
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) throw new Error("Aucun token trouvé");

        const response = await apiClient.get("/auth/verifyJwt", {
            headers: {Authorization: `Bearer ${token}`},
        });

        return {token, message: response.data.message};
    },

    async logout() {
        await SecureStore.deleteItemAsync("userToken");
    },
};

export default authService;