import {createAsyncThunk} from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import apiClient from "@/src/utils/apiClient";

interface RegisterThunk {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
}

interface LoginThunk {
    email: string;
    password: string;
}

// Thunk pour l'inscription
export const register = createAsyncThunk(
    'auth/register',
    async (data: RegisterThunk, {rejectWithValue}) => {
        try {
            console.log("data:", data);
            const response = await apiClient.post("/user", data);

            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || "Erreur lors de l'inscription");
        }
    }
);

// Thunk pour la connexion
export const login = createAsyncThunk(
    'auth/login',
    async (data: LoginThunk, {rejectWithValue}) => {
        try {
            const response = await apiClient.post("/auth", data);
            const token = response.data.token;

            await SecureStore.setItemAsync('userToken', token);

            return token;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Erreur de connexion');
        }
    }
);

// Thunk pour récupérer le token au démarrage
export const loadToken = createAsyncThunk(
    'auth/loadToken',
    async (_, {rejectWithValue}) => {
        try {
            const token = await SecureStore.getItemAsync('userToken');

            await apiClient.get("/auth/verifyJwt");

            return token;
        } catch (error: any) {
            await SecureStore.deleteItemAsync('userToken');
            return rejectWithValue(error.message || "Erreur lors de la récupération du token");
        }
    }
);

// Thunk pour la déconnexion
export const logout = createAsyncThunk(
    "auth/logout",
    async (data: any, {rejectWithValue}) => {
        try {
            // await apiClient.delete("push-token", {data})
            await SecureStore.deleteItemAsync('userToken');
        } catch (error: any) {
            console.log(error.response)
            return rejectWithValue(error.response?.data || "Erreur serveur");
        }
    }
);