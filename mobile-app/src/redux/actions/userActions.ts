import {createAsyncThunk} from "@reduxjs/toolkit";
import apiClient from "@/src/utils/apiClient";

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async (userData: any, {rejectWithValue}) => {
        try {
            const response = await apiClient.put(`/user/${userData.id}`, userData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Une erreur est survenue');
        }
    }
);

export const getUser = createAsyncThunk(
    'user/getUser',
    async (userId: number, {rejectWithValue}) => {
        try {
            const response = await apiClient.get(`/user/${userId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Une erreur est survenue');
        }
    }
);