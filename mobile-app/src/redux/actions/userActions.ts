import { createAsyncThunk } from "@reduxjs/toolkit";
import userService from "@/src/services/userService";

export const updateUser = createAsyncThunk(
  "user/updateUser",
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.updateUser(userData);
    } catch (error:any) {
      return rejectWithValue(error.response?.data?.error || "Une erreur est survenue");
    }
  }
);

export const getUser = createAsyncThunk(
  "user/getUser",
  async (userId:any, { rejectWithValue }) => {
    try {
      return await userService.getUser(userId);
    } catch (error:any) {
      return rejectWithValue(error.response?.data?.error || "Une erreur est survenue");
    }
  }
);