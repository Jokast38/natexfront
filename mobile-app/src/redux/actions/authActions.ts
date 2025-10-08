import {createAsyncThunk} from "@reduxjs/toolkit";
import authService from "@/src/services/authService";

// Inscription
export const register = createAsyncThunk(
    "auth/register",
    async (data, {rejectWithValue}) => {
        try {
            return await authService.register(data);
        } catch (error:any) {
            return rejectWithValue(error.response?.data?.error || "Erreur lors de l'inscription");
        }
    }
);

// Connexion
export const login = createAsyncThunk(
    "auth/login",
    async (data, {rejectWithValue}) => {
        try {
            return await authService.login(data);
        } catch (error:any) {
            return rejectWithValue(error.response?.data?.error || "Erreur de connexion");
        }
    }
);

// Vérification du token
export const loadToken = createAsyncThunk(
    "auth/loadToken",
    async (_, {rejectWithValue}) => {
        try {
            const result = await authService.verifyJwt();
            return result.token;
        } catch (error:any) {
            await authService.logout();
            return rejectWithValue(error.message || "Erreur lors de la récupération du token");
        }
    }
);

// Déconnexion
export const logout = createAsyncThunk("auth/logout", async (_, {rejectWithValue}) => {
    try {
        await authService.logout();
    } catch (error:any) {
        return rejectWithValue(error.response?.data || "Erreur lors de la déconnexion");
    }
});