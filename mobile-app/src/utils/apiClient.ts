import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
    baseURL: "http://192.168.1.138:3000/api",
});

// Ajouter un interceptor pour inclure dynamiquement le token
apiClient.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
